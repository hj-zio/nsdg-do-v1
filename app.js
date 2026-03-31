'use strict';

/** 일반 라이브러리 불러오기 */
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

/** OAuth 라이브러리 불러오기 */
const passport = require('./src/config/passport.js');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

/** 라우터 불러오기 */
const homeRouter = require('./src/routes/home.routes.js');
const apiRouter = require('./src/routes/api.routes.js');
const adminRouter = require('./src/routes/admin.routes.js');
const teacherRouter = require('./src/routes/teacher.routes.js');
const storeRouter = require('./src/routes/store.routes.js');
const payRouter = require('./src/routes/pay.routes.js');
const imageRouter = require('./src/routes/image.routes.js');
const authRouter = require('./src/routes/auth.routes.js');

/** 미들웨어 불러오기 */
const collectTraceInfo = require('./src/middlewares/collectTraceInfo.js');
const endpointLock = require('./src/middlewares/endpointLock.js');

/** 모듈 불러오기 */
const Info = require('./src/modules/info.js');
const { collectSystemMetrics } = require('./src/modules/systemMetrics.js');

/** config 불러오기 */
const db = require('./src/config/db.js');
const { keys } = require('./src/config/keys.js');
const { notice } = require('./src/config/notice.js');

/** Redis Flusher 활성화 */
require('./src/redis/flushRedisLogs.js');

Info.getSchoolSchedule(1, {});
cron.schedule('0 8 * * *', async () => { /// 평일 오전 8시마다 학사일정 업데이트
    console.log(await Info.getSchoolSchedule(1, {}));
}, { scheduled: true, timezone: 'Asia/Seoul' });

const app = express();

app.use((req, res, next) => {
    if (/^\/lostitem/i.test(req.path) && !req.path.startsWith('/lostItem')) {
        const correctPath = req.path.replace(/^\/lostitem/i, '/lostItem');
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(301, correctPath + queryString);
    }
    next();
});

const sessionStore = new MySQLStore({
    host: keys.db.HOST,
    port: keys.db.PORT,
    user: keys.db.USER,
    password: keys.db.PASSWORD,
    database: keys.db.DATABASE,
    clearExpired: keys.db.ISEXPIRE,
    checkExpirationInterval: keys.db.CHECKINTV,
    expiration: keys.db.EXPIRE,
});

app.use(session({
    secret: keys.db.SESSION_KEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: keys.db.EXPIRE
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('trust proxy', true);
app.set('views', './src/public');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(collectTraceInfo);
app.use(endpointLock);
startSystemMetricsLogging();

app.use(express.static(__dirname + '/src/public'));

app.use('/uploads', express.static('uploads'));

app.use(async (req, res, next) => {
    if (req.path.includes('/survey') || req.path.includes('/submitSurvey')) {
        await next();
        return;
    }
    if (req.session.islogined || req.path.includes('/login') || req.path.includes('/auth') || req.path.includes('/error') || req.path.includes('/google') || req.path.includes('/privacy')) {
        await next();
    } else {
        await res.redirect('/login');
    }
});

app.use('/', homeRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/teacher', teacherRouter);
app.use('/store', storeRouter);
app.use('/pay', payRouter);
app.use('/i', imageRouter);
app.use('/google', authRouter);

app.use(async (req, res, next) => {
    await recordUserLog(req, req.trace, 'SUCCESS', '오류 페이지 접속');
    res.render('views/html/error', {
        title: notice.client.REQ_ERROR,
        subtitle: notice.client.PAGE_NOT_FOUND
    });
    return;
});

app.listen(keys.system.PORT, '0.0.0.0', () => {
    console.log('Server Active :: ' + keys.system.PORT);
});

async function startSystemMetricsLogging() {
    if (process.env.NODE_ENV === 'production') {
        setInterval(async () => {
            try {
                await collectSystemMetrics();
            } catch (error) {
                console.error("시스템 정보를 수집하던 중 오류가 발생했습니다.");
            }
        }, 10000);
    } else {
        console.log('테스트 환경에서는 시스템 정보를 수집하지 않습니다.');
    }
}

async function recordUserLog(request, trace, status, activity) {
    try {
        trace.response_at = new Date().getTime();
        trace.status = status;
        trace.execution_at = trace.response_at - trace.request_at
        trace.activity = activity;
        request.trace = trace;
        const record_user_log = await db.recordUserLog(request, request.trace);
        return record_user_log;
    } catch (e) {
        await db.recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, request.trace);
        return null;
    }
}