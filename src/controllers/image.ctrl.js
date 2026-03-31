'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const Image = require('../modules/image.js');

const process = {
    main: async (req, res) => {
        try {
            const trace = req.trace;
            const token = req.query.id;
            
            const getImage = await Image.getImage(token, trace);
            if (!getImage.success) {
                await recordUserLog(req, trace, 'FAIL', '이미지 로딩');
                await res.send({
                    success: false,
                    data: null,
                    message: getImage.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '이미지 로딩');
            await res.writeHead(200, { 'Content-Type': 'image/png' });
            await res.end(Buffer.from(getImage.data, 'base64'));
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '이미지 로딩');
            await db.recordErrorLog(notice.IMAGE.GET_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    }
};

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