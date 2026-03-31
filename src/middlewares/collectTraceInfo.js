'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const collectTraceInfo = async (req, res, next) => {
    const uuid = await db.getUUID();
    if (!uuid) {
        await res.send(notice.client.SERVER_ERROR);
        return;
    }

    const r_id = uuid;
    const u_id = req.session.islogined ? req.session.u_id : 'guest';
    const g_id = req.session.islogined ? req.session.g_id : 'guest';
    const endpoint = req.path;
    const session_id = req.session.id;
    const client_ip = getClientIP(req);
    const request_at = new Date().getTime();

    const trace = {
        r_id: r_id,
        u_id: u_id,
        g_id: g_id,
        ip: client_ip,
        session_id: session_id,
        endpoint: endpoint,
        activity: null,
        request_at: request_at,
        response_at: null,
        execution_at: null
    };

    req.trace = trace;
    next();
}

function getClientIP(req) {
    try {
        const forwarded = req.headers['x-forwarded-for'];
        return forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    } catch (e) {
        return 'error';
    }
}

module.exports = collectTraceInfo;
