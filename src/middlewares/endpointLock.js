'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const endpointLock = async (req, res, next) => {
    try {
        const trace = req.trace;
        const req_endpoint = req.path;
        const isMaster = req.session.isMaster === 1 ? true : false;
        if (!isMaster) {
            const query = await db.querySQL(`
                SELECT * FROM INSDB 
                WHERE ( ? = endpoint OR ? LIKE CONCAT(endpoint, '/%') ) 
                    AND ins_status = 'in_progress'
            `, [req_endpoint, req_endpoint], trace);

            if (query.length === 0) {
                return next();
            }

            const isAPI = req_endpoint.includes('/api');
            const hasQuery = query && query.length > 0;
            const logMessage = isAPI ? '점검 API 접속' : '점검 페이지 접속';

            await recordUserLog(req, trace, 'SUCCESS', logMessage);
            if (isAPI) {
                res.send({
                    success: false,
                    data: hasQuery ? query[0] : null,
                    message: notice.client.INS_IN_PROGRESS,
                    error: null
                });
            } else {
                const subtitle = hasQuery ? `${notice.client.INS_IN_PROGRESS}<div class='text-[14px] sm:text-[16px] gray-70 pretendard-400 text-center'>${query[0].ins_type}: ${query[0].ins_start}~${query[0].ins_end}</br>총 ${query[0].ins_duration}동안 점검해요.</div>` : notice.client.INS_IN_PROGRESS;
                res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: subtitle
                });
            }
            return;
        }
    } catch (e) {
        console.log(e);
    }
    next();
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
        await db.recordErrorLog(notice.QUERY.REQEUST_100, e.message, e.stack, request.trace);
        return null;
    }
}

module.exports = endpointLock;