'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const Image = require('./image.js');

/**
 * 사용자의 접근요청을 처리하는 함수
 * @param {object} request 
 * @param {object} profile 
 * @param {object} trace 
 * @returns 
 */
async function handleRequest(request, profile, trace) {
    try {
        const is_register_user = await isRegisterUser(profile.id, trace);
        if (!is_register_user.success) {
            return is_register_user;
        }

        if (is_register_user.data) {
            /// 로그인 처리로직
            const login_result = await login(request, profile, trace);
            return login_result;
        } else {
            /// 회원가입 처리로직
            const register_result = await register(request, profile, trace);
            if (!register_result.success) {
                return register_result;
            }
            const login_result = await login(request, profile, trace);
            return login_result;
        }
    } catch (e) {
        await db.recordErrorLog(notice.AUTH.ROUTE_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 로그인 요청을 처리하는 함수
 * @param {object} request 
 * @param {object} profile 
 * @param {object} trace 
 * @returns 
 */
async function login(request, profile, trace) {
    try {
        const query = await db.querySQL('UPDATE USERDB SET recentDate = NOW() WHERE g_id = ?', [profile.id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const disconnect_previous = await disconnectPrevious(request, profile, trace);
        if (!disconnect_previous.success) {
            return disconnect_previous;
        }

        const get_user_data = await getUserData(profile.id, trace);
        if (!get_user_data.success) {
            return get_user_data;
        }

        request.session.u_id = get_user_data.data.uuid;
        request.session.g_id = get_user_data.data.g_id;
        request.session.isMaster = get_user_data.data.isMaster;
        request.session.islogined = true;
        request.session.userName = profile._json.name;

        return {
            success: true,
            data: null,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.AUTH.LOGIN_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 로그아웃 요청을 처리하는 함수
 * @param {object} request 
 * @param {object} trace 
 * @returns 
 */
async function logout(request, trace) {
    try {
        request.session.islogined = false;
        return {
            success: true,
            data: null,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.AUTH.LOGOUT_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 회원가입 요청을 처리하는 함수
 * @param {object} request 
 * @param {object} profile 
 * @param {object} trace 
 * @returns 
 */
async function register(request, profile, trace) {
    try {
        if (!profile.email.includes('@pess.cnehs.kr') && profile.email !== 'minseong4375@gmail.com' && profile.email !== 'astarot1204@gmail.com') {
            return {
                success: false,
                data: null,
                message: notice.client.NOT_SCOOL_ACCOUNT,
                error: null
            };
        }

        const upload_image = await Image.uploadImage(profile.picture, trace);
        if (!upload_image.success) {
            return {
                success: false,
                data: null,
                message: notice.client.NOT_UPLOAD_PROFILE_IMAGE,
                error: null
            };
        }

        const query = await db.querySQL('INSERT INTO USERDB (g_id, name, email, profileImage) VALUES (?, ?, ?, ?)', [profile.id, (profile._json.name).replace('대건고', ''), profile.email, upload_image.data], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        return {
            success: true,
            data: null,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.AUTH.REGISTER_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 이전에 로그인 되어있던 기기에서 로그아웃하는 함수
 * @param {object} request 
 * @param {object} profile 
 * @param {object} trace 
 * @returns 
 */
async function disconnectPrevious(request, profile, trace) {
    try {
        const query = await db.querySQL("UPDATE sessions SET data = JSON_SET(data, '$.islogined', false) WHERE JSON_UNQUOTE(JSON_EXTRACT(data, '$.g_id')) = ?;", [profile.id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        return {
            success: true,
            data: null,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.AUTH.SESSION_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

async function getUserData(g_id, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM USERDB WHERE g_id = ?', [g_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query[0].length === 0) {
            return {
                success: false,
                data: null,
                message: notice.client.USER_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: query[0],
            message: notice.client.SUCCESS,
            error: null
        }
    } catch (e) {
        await db.recordErrorLog(notice.USER.GET_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

async function checkPermission(g_id, trace) {
    try {
        const get_user_data = await getUserData(g_id, trace);
        if (!get_user_data.success) {
            return {
                success: false,
                data: null,
                message: get_user_data.message,
                error: null
            };
        }

        if (get_user_data.data.isMaster === 1) {
            return {
                success: true,
                data: 'ADMIN',
                message: notice.client.SUCCESS,
                error: null
            };
        }

        if (get_user_data.data.isTeacher === 1) {
            return {
                success: true,
                data: 'TEACHER',
                message: notice.client.SUCCESS,
                error: null
            };
        }

        if (get_user_data.data.isBan === 1) {
            return {
                success: true,
                data: 'BANNED_USER',
                message: notice.client.SUCCESS,
                error: null
            };
        }

        return {
            success: true,
            data: 'USER',
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.USER.GET_200.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 회원가입이 된 사용자인지 확인하는 함수
 * @param {number} g_id
 * @return
 */
async function isRegisterUser(g_id, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM USERDB WHERE g_id = ?', [g_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length === 0) {
            return {
                success: true,
                data: false,
                message: notice.client.SUCCESS,
                error: null
            };
        }

        return {
            success: true,
            data: true,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.USER.GET_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

async function getSelectData(uuid, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM selectDB WHERE uuid = ?', [uuid], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        return {
            success: true,
            data: query,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.USER.GET_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

module.exports = {
    handleRequest, login, logout, register, disconnectPrevious, isRegisterUser, getUserData, checkPermission, getSelectData
}