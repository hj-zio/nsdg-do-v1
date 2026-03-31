'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('../modules/user.js');

const process = {
    main: async (req, res) => {
        try {
            const trace = req.trace;
            
            const handleRequest = await User.handleRequest(req, req.user, trace);
            if (!handleRequest.success) {
                await recordUserLog(req, trace, 'FAIL', '로그인');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: handleRequest.message
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '로그인');
            await res.redirect('/');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '로그인');
            await db.recordErrorLog(notice.AUTH.CTRL_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
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
        await db.recordErrorLog(notice.QUERY.REQEUST_100, e.message, e.stack, request.trace);
        return null;
    }
}

module.exports = {
    process
}