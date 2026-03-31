'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const Image = require('../modules/image.js');

const output = {
    main: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '메인 페이지 접속');
            await res.render('views/html/main');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '메인 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    login: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '로그인 페이지 접속');
            await res.render('views/html/login');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '로그인 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    auth: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '인증 페이지 접속');
            await res.render('views/html/auth');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '인증 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    timetable: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '시간표 페이지 접속');
            await res.render('views/html/timetable');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '시간표 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    schedule: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '학사일정 페이지 접속');
            await res.render('views/html/schedule');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '학사일정 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    meal: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '급식 페이지 접속');
            await res.render('views/html/meal');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '급식 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    profile: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '프로필 페이지 접속');
            await res.render('views/html/profile');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '프로필 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    schoolNumber: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '학번 등록 및 변경 페이지 접속');
            await res.render('views/html/schoolNumber');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '학번 등록 및 변경 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    error: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '오류 페이지 접속');
            await res.render('views/html/error');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '오류 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    choose: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '선택과목 페이지 접속');
            await res.render('views/html/choose');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선택과목 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    allergy: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '알레르기 등록 페이지 접속');
            await res.render('views/html/allergy');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '알레르기 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    survey: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '설문 페이지 접속');
            await res.render('views/html/survey');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '설문 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    lostItem: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '분실물 페이지 접속');
            await res.render('views/html/lostItem');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '분실물 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    lostItemPost: async (req, res) => {
        try {
            const trace = req.trace;

            // 게스트 계정 체크
            if (trace.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '분실물 작성 페이지 접속 (게스트)');
                await res.render('views/html/error', {
                    title: '접근 불가',
                    subtitle: '게스트 계정은 글 작성이 불가능해요.'
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '분실물 작성 페이지 접속');
            await res.render('views/html/lostItemPost');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '분실물 작성 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },
    lostItemEdit: async (req, res) => {
        try {
            const trace = req.trace;

            if (trace.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '분실물 수정 페이지 접속 (게스트)');
                await res.render('views/html/error', {
                    title: '접근 불가',
                    subtitle: '게스트 계정은 글 수정이 불가능해요.'
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '분실물 수정 페이지 접속');
            await res.render('views/html/lostItemEdit');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '분실물 수정 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },
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
    output
};