'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('../modules/user.js');
const Timetable = require('../modules/timetable.js');
const Image = require('../modules/image.js');
const Info = require('../modules/info.js');
const { getDateFromWeekday } = require('../modules/day.js');

const output = {
    main: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '메인 API 호출');
            await res.send(trace);
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '메인 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    },

    getUserData: async (req, res) => {
        try {
            const trace = req.trace;

            const get_user_data = await User.getUserData(trace.g_id, trace);
            if (!get_user_data.success) {
                await recordUserLog(req, trace, 'FAIL', '메인 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: get_user_data.message,
                    error: null
                });
                return;
            }

            delete get_user_data.data.face_feature
            await recordUserLog(req, trace, 'SUCCESS', '유저 데이터 API 호출');
            await res.send({
                success: true,
                data: get_user_data.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '유저 데이터 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    },

    setSchoolNum: async (req, res) => {
        try {
            const trace = req.trace;
            const { gradeNum, classNum, numberNum } = req.query;
            const now = new Date().getTime();

            if (trace.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '학번 설정 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            if (!gradeNum || !classNum || !numberNum) {
                await recordUserLog(req, trace, 'FAIL', '학번 설정 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_VALID_VALUE,
                    error: null
                });
                return;
            }

            const get_user_data = await User.getUserData(trace.g_id, trace);
            if (!get_user_data.success) {
                await recordUserLog(req, trace, 'FAIL', '학번 설정 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: get_user_data.message,
                    error: null
                });
                return;
            }

            const currentSchoolDetail = JSON.parse(get_user_data.data.schoolDetail)
            if (currentSchoolDetail.created_at) {
                if (now - currentSchoolDetail.created_at < 2592000000) {
                    if (get_user_data.data.isMaster === 0 && get_user_data.data.isTeacher === 0) {
                        await recordUserLog(req, trace, 'FAIL', '학번 설정 API 호출');
                        await res.send({
                            success: false,
                            data: null,
                            message: `마지막 설정 후 30일이 지나지 않아 다시 설정할 수 없어요.\n마지막 변경일: ${msToDate(currentSchoolDetail.created_at)}`,
                            error: null
                        });
                        return;
                    }
                }
            }

            currentSchoolDetail.grade = gradeNum;
            currentSchoolDetail.class = classNum;
            currentSchoolDetail.number = numberNum;
            currentSchoolDetail.created_at = now;

            const query = await db.querySQL('UPDATE USERDB SET schoolDetail = ? WHERE g_id = ?', [JSON.stringify(currentSchoolDetail), trace.g_id], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '학번 설정 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '학번 설정 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '학번 설정 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    },

    getTimetable: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '시간표 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            const school_detail = JSON.parse(getUserData.data.schoolDetail);
            const gradeNum = school_detail.grade;
            const classNum = school_detail.class;
            const numberNum = school_detail.number;
            const schoolNum = Timetable.convertToSchoolNum(gradeNum, classNum, numberNum);
            if (!gradeNum || !classNum || !numberNum || !schoolNum) {
                await recordUserLog(req, trace, 'FAIL', '시간표 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SCHOOL_NUMBER_NOT_FOUND,
                    error: null
                });
                return;
            }

            const getTimetable = await Timetable.getTimetable(gradeNum, classNum, numberNum, schoolNum, trace);
            await recordUserLog(req, trace, 'SUCCESS', '시간표 API 호출');
            await res.send(getTimetable);
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '시간표 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    submitMealRating: async (req, res) => {
        try {
            const trace = req.trace;
            // content, timestamp를 req.body에서 받지만, DB 저장에는 사용하지 않음.
            const { startDate, day, meal, content, rating, timestamp } = req.body;

            const meal_date = await getDateFromWeekday(startDate, day);

            if (trace.g_id === '123456789') {
                return res.send({ success: false, data: null, message: notice.client.NOT_USE_GUEST, error: null });
            }

            if (!day || !meal || !rating) { // content, timestamp는 DB에 없으므로 필수 검증에서 제외
                return res.send({ success: false, data: null, message: notice.client.NOT_VAILD_VALUE, error: null });
            }

            if (rating < 1 || rating > 5) {
                return res.send({ success: false, data: null, message: '평점은 1-5 사이의 값이어야 합니다.', error: null });
            }

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                return res.send({ success: false, data: null, message: getUserData.message, error: null });
            }

            const sql = `
                INSERT INTO mealRating 
                    (user_id, name, schoolDetail, meal_date, meal_type, rating) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    rating = VALUES(rating),
                    name = VALUES(name),
                    schoolDetail = VALUES(schoolDetail);
            `;
            const params = [
                getUserData.data.uuid,
                getUserData.data.name,
                getUserData.data.schoolDetail,
                meal_date,
                meal,
                rating
            ];

            const queryResult = await db.querySQL(sql, params, trace);

            if (!queryResult) {
                await recordUserLog(req, trace, 'FAIL', '급식 평가 제출 API 호출');
                return res.send({ success: false, data: null, message: notice.client.QUERY_ERROR, error: null });
            }

            await recordUserLog(req, trace, 'SUCCESS', '급식 평가 제출 API 호출');
            return res.send({
                success: true,
                data: { rating_id: queryResult.insertId || queryResult.affectedRows, message: '평가가 성공적으로 제출되었습니다.' },
                message: notice.client.SUCCESS,
                error: null
            });

        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '급식 평가 제출 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, trace);
            const errorMessage = (notice && notice.service && notice.service.SERVER_ERROR)
                ? notice.service.SERVER_ERROR
                : '서버에서 오류가 발생했습니다.';
            return res.send({ success: false, data: null, message: errorMessage, error: null });
        }
    },

    getMeal: async (req, res) => {
        try {
            const trace = req.trace;
            const { startDate, endDate } = req.query;

            const query = await db.querySQL('SELECT data FROM MEALDB WHERE startDate = ? AND endDate = ?', [startDate, endDate], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '급식 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '급식 API 호출');
            await res.send({
                success: true,
                data: JSON.parse(query[0].data),
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '급식 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getSchedule: async (req, res) => {
        try {
            const trace = req.trace;

            const getSchoolScheduleData = await Info.getSchoolSchedule(2, trace);
            if (!getSchoolScheduleData.success) {
                await recordUserLog(req, trace, 'FAIL', '학사일정 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '학사일정 API 호출');
            await res.send({
                success: true,
                data: getSchoolScheduleData.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '학사일정 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getSelectHistory: async (req, res) => {
        try {
            const trace = req.trace;
            const getUserData = await User.getUserData(trace.g_id, trace);
            const getSelectData = await User.getSelectData(trace.u_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (!getSelectData.success) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }
            await recordUserLog(req, trace, 'SUCCESS', '선택과목 조회 API 호출');
            await res.send({
                success: true,
                data: getSelectData.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선택과목 전체 조회 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getAllSelectData: async (req, res) => {
        try {
            const trace = req.trace;

            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선택과목 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            const query = await db.querySQL('SELECT * FROM selectDB', [], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '선택과목 리스트 API 호출');
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선택과목 리스트 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    submitSelect: async (req, res) => {
        try {
            const { data } = req.body;
            const trace = req.trace;
            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 제출 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '선택과목 제출 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const schoolDetail = JSON.parse(getUserData.data.schoolDetail);
            const gradeName = schoolDetail.grade;
            const className = schoolDetail.class;
            const numberName = schoolDetail.number;
            const schoolNum = gradeName + className + formatNumber(numberName);

            const query = await db.querySQL('INSERT INTO selectDB (uuid, name, email, schoolNum, data) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', [getUserData.data.uuid, getUserData.data.name, getUserData.data.email, schoolNum, JSON.stringify(data)], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '선택과목 제출 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '선택과목 제출 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선택과목 제출 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    submitAllergy: async (req, res) => {
        try {
            const trace = req.trace;
            const { data } = req.body;

            const query = await db.querySQL('UPDATE USERDB SET allergy = ? WHERE uuid = ?', [data, trace.u_id], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '알레르기 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '알레르기 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '알레르기 등록 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    loginForGuest: async (req, res) => {
        try {
            const trace = req.trace;

            req.session.u_id = 'a3df154c-e212-11ef-9c86-ca3a2688ed54';
            req.session.g_id = '123456789';
            req.session.islogined = true;
            req.session.isMaster = 0;
            req.session.userName = '게스트';

            await recordUserLog(req, trace, 'SUCCESS', '게스트 로그인 API 호출');
            await res.redirect('/');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '게스트 로그인 API 호출');
            await db.recordErrorLog(notice.AUTH.LOGIN_101, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    logout: async (req, res) => {
        try {
            const trace = req.trace;

            const logout = await User.logout(req, trace);
            if (!logout.success) {
                await recordUserLog(req, trace, 'FAIL', '로그아웃 API 호출');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '로그아웃 API 호출');
            await res.redirect('/');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '로그아웃 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    submitSurvey: async (req, res) => {
        try {
            const trace = req.trace;
            const { data } = req.body;

            const build_survey_insert = buildSurveyInsert(data, trace);
            if (!build_survey_insert) {
                await recordUserLog(req, trace, 'FAIL', '설문조사 제출 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            const query = await db.querySQL(build_survey_insert[0], build_survey_insert[1], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '설문조사 제출 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '설문조사 제출 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '설문조사 제출 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },
    getLostItems: async (req, res) => {
        try {
            const trace = req.trace
            const { offset = 0, limit = 10 } = req.query

            const query = await db.querySQL(
                `SELECT 
                    l.id, 
                    l.uuid, 
                    l.name, 
                    l.title, 
                    l.content,
                    l.post_type,
                    l.status,
                    l.image_token,
                    l.product_link,
                    l.created_at,
                    l.updated_at,
                    u.schoolDetail,
                    u.email
                FROM lostItemDB l
                LEFT JOIN USERDB u ON l.uuid COLLATE utf8mb4_general_ci = u.g_id
                WHERE l.is_hidden = 0 AND l.is_deleted = 0
                ORDER BY l.created_at DESC
                LIMIT ? OFFSET ?`,
                [Number.parseInt(limit), Number.parseInt(offset)],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 목록 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 목록 조회 API 호출")
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 목록 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    createLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { title, content, post_type, image_base64, product_link } = req.body

            if (trace.g_id === "123456789") {
                await recordUserLog(req, trace, "FAIL", "분실물 작성 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null,
                })
                return
            }

            if (!title || !content || !post_type) {
                await recordUserLog(req, trace, "FAIL", "분실물 작성 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_VALID_VALUE,
                    error: null,
                })
                return
            }

            if (post_type !== "찾는_중" && post_type !== "찾아줌") {
                await recordUserLog(req, trace, "FAIL", "분실물 작성 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "올바른 게시글 타입을 선택해주세요.",
                    error: null,
                })
                return
            }

            const getUserData = await User.getUserData(trace.g_id, trace)
            if (!getUserData.success) {
                await recordUserLog(req, trace, "FAIL", "분실물 작성 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null,
                })
                return
            }

            const now = new Date().getTime()

            let imageToken = null
            if (image_base64) {
                const uploadResult = await Image.uploadImageWithBase64(image_base64, trace)
                if (uploadResult.success) {
                    imageToken = uploadResult.data
                }
            }

            const query = await db.querySQL(
                "INSERT INTO lostItemDB (uuid, name, title, content, post_type, image_token, product_link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [trace.g_id, getUserData.data.name, title, content, post_type, imageToken, product_link || null, now],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 작성 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 작성 API 호출")
            await res.send({
                success: true,
                data: { id: query.insertId },
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 작성 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    getMyLostItems: async (req, res) => {
        try {
            const trace = req.trace
            const { offset = 0, limit = 10 } = req.query

            const query = await db.querySQL(
                `SELECT 
                l.id, 
                l.uuid, 
                l.name, 
                l.title, 
                l.content,
                l.post_type,
                l.status,
                l.image_token,
                l.product_link,
                l.created_at,
                l.updated_at,
                u.schoolDetail,
                u.email
            FROM lostItemDB l
            LEFT JOIN USERDB u ON l.uuid COLLATE utf8mb4_general_ci = u.g_id
            WHERE l.uuid = ? AND l.is_deleted = 0
            ORDER BY l.created_at DESC
            LIMIT ? OFFSET ?`,
                [trace.g_id, Number.parseInt(limit), Number.parseInt(offset)],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "내 분실물 목록 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "내 분실물 목록 조회 API 호출")
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "내 분실물 목록 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    // 게시글 단건 조회
    getLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { id } = req.params

            const query = await db.querySQL(
                "SELECT id, uuid, name, title, content, post_type, status, image_token, product_link, created_at, updated_at FROM lostItemDB WHERE id = ? AND is_deleted = 0",
                [id],
                trace,
            )

            if (!query || query.length === 0) {
                await recordUserLog(req, trace, "FAIL", "분실물 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "게시글을 찾을 수 없습니다.",
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 조회 API 호출")
            await res.send({
                success: true,
                data: query[0],
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    getLostItemImage: async (req, res) => {
        try {
            const trace = req.trace
            const { id } = req.params

            const postQuery = await db.querySQL(
                "SELECT image_token FROM lostItemDB WHERE id = ? AND is_deleted = 0",
                [id],
                trace,
            )

            if (!postQuery || postQuery.length === 0 || !postQuery[0].image_token) {
                await recordUserLog(req, trace, "FAIL", "분실물 이미지 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "이미지를 찾을 수 없습니다.",
                    error: null,
                })
                return
            }

            const imageQuery = await db.querySQL(
                "SELECT image FROM IMAGEDB WHERE token = ?",
                [postQuery[0].image_token],
                trace,
            )

            if (!imageQuery || imageQuery.length === 0) {
                await recordUserLog(req, trace, "FAIL", "분실물 이미지 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "이미지를 찾을 수 없습니다.",
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 이미지 조회 API 호출")
            await res.send({
                success: true,
                data: { image_url: imageQuery[0].image },
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 이미지 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    deleteLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { id } = req.body

            if (trace.g_id === "123456789") {
                await recordUserLog(req, trace, "FAIL", "분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null,
                })
                return
            }

            const checkQuery = await db.querySQL("SELECT uuid FROM lostItemDB WHERE id = ?", [id], trace)

            if (!checkQuery || checkQuery.length === 0) {
                await recordUserLog(req, trace, "FAIL", "분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "게시글을 찾을 수 없습니다.",
                    error: null,
                })
                return
            }

            if (checkQuery[0].uuid !== trace.g_id) {
                await recordUserLog(req, trace, "FAIL", "분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "본인의 게시글만 삭제할 수 있습니다.",
                    error: null,
                })
                return
            }

            const now = new Date().getTime()
            const getUserData = await User.getUserData(trace.g_id, trace)

            const query = await db.querySQL(
                "UPDATE lostItemDB SET is_deleted = 1, deleted_at = ?, deleted_by = ? WHERE id = ?",
                [now, getUserData.data.name, id],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 삭제 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 삭제 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    updateLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { id, title, content, status, image_base64, product_link } = req.body

            if (trace.g_id === "123456789") {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null,
                })
                return
            }

            const isStatusOnlyUpdate = status && !title && !content && !image_base64 && !product_link

            if (!isStatusOnlyUpdate && (!title || !content)) {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_VALID_VALUE,
                    error: null,
                })
                return
            }

            if (status && status !== "찾는_중" && status !== "찾음") {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "올바른 상태를 선택해주세요.",
                    error: null,
                })
                return
            }

            const checkQuery = await db.querySQL(
                "SELECT uuid, title, content, status, image_token, product_link, name FROM lostItemDB WHERE id = ?",
                [id],
                trace,
            )

            if (!checkQuery || checkQuery.length === 0) {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "게시글을 찾을 수 없습니다.",
                    error: null,
                })
                return
            }

            if (checkQuery[0].uuid !== trace.g_id) {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: "본인의 게시글만 수정할 수 있습니다.",
                    error: null,
                })
                return
            }

            const oldPost = checkQuery[0]
            const now = new Date().getTime()

            const finalTitle = title || oldPost.title
            const finalContent = content || oldPost.content
            const finalProductLink = product_link !== undefined ? product_link : oldPost.product_link

            let newImageToken = oldPost.image_token
            if (image_base64) {
                const uploadResult = await Image.uploadImageWithBase64(image_base64, trace)
                if (uploadResult.success) {
                    newImageToken = uploadResult.data
                }
            }

            const historyRecords = []

            if (title && oldPost.title !== finalTitle) {
                historyRecords.push([
                    id,
                    trace.g_id,
                    oldPost.name,
                    "title",
                    oldPost.title,
                    finalTitle,
                    null,
                    null,
                    null,
                    null,
                    now,
                ])
            }
            if (content && oldPost.content !== finalContent) {
                historyRecords.push([
                    id,
                    trace.g_id,
                    oldPost.name,
                    "content",
                    oldPost.content,
                    finalContent,
                    null,
                    null,
                    null,
                    null,
                    now,
                ])
            }
            if (status && oldPost.status !== status) {
                historyRecords.push([
                    id,
                    trace.g_id,
                    oldPost.name,
                    "status",
                    oldPost.status,
                    status,
                    null,
                    null,
                    null,
                    null,
                    now,
                ])
            }
            if (image_base64 && oldPost.image_token !== newImageToken) {
                historyRecords.push([
                    id,
                    trace.g_id,
                    oldPost.name,
                    "image_token",
                    null,
                    null,
                    null,
                    null,
                    oldPost.image_token || null,
                    newImageToken || null,
                    now,
                ])
            }
            if (product_link !== undefined && oldPost.product_link !== finalProductLink) {
                historyRecords.push([
                    id,
                    trace.g_id,
                    oldPost.name,
                    "product_link",
                    oldPost.product_link || null,
                    finalProductLink || null,
                    null,
                    null,
                    null,
                    null,
                    now,
                ])
            }

            if (historyRecords.length > 0) {
                for (let i = 0; i < historyRecords.length; i++) {
                    const record = historyRecords[i]

                    try {
                        await db.querySQL(
                            "INSERT INTO lostItemHistoryDB (post_id, uuid, name, field_name, old_value_text, new_value_text, old_value_int, new_value_int, old_value_token, new_value_token, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            record,
                            trace,
                        )
                    } catch (historyError) {
                        // 이력 저장 실패는 무시
                    }
                }
            }

            const updateFields = []
            const updateValues = []

            updateFields.push("title = ?", "content = ?", "image_token = ?", "product_link = ?", "updated_at = ?")
            updateValues.push(finalTitle, finalContent, newImageToken, finalProductLink, now)

            if (status) {
                updateFields.push("status = ?")
                updateValues.push(status)
            }

            updateValues.push(id)

            const query = await db.querySQL(
                `UPDATE lostItemDB SET ${updateFields.join(", ")} WHERE id = ?`,
                updateValues,
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 수정 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 수정 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },
}

function buildSurveyInsert(picks, trace) {
    try {
        const ALL_ITEM_IDS = ['econ_lee_jm_1', 'econ_lee_jm_2', 'econ_lee_jm_3', 'econ_kim_ms_1', 'econ_kim_ms_2', 'econ_kim_ms_3', 'econ_lee_js_1', 'econ_lee_js_2', 'econ_kwon_yg_1', 'econ_kwon_yg_2', 'econ_kwon_yg_3', 'soc_lee_jm_1', 'soc_lee_jm_2', 'soc_lee_jm_3', 'soc_lee_jm_4', 'soc_kim_ms_1', 'soc_kim_ms_2', 'soc_lee_js_1', 'soc_lee_js_2', 'soc_kwon_yg_1', 'soc_kwon_yg_2', 'soc_kwon_yg_3', 'edu_lee_jm_1', 'edu_lee_jm_2', 'edu_lee_jm_3', 'edu_lee_jm_4', 'edu_kim_ms_1', 'edu_kim_ms_2', 'edu_kim_ms_3', 'edu_kim_ms_4', 'edu_lee_js_1', 'edu_lee_js_2', 'edu_lee_js_3', 'edu_lee_js_4', 'edu_kwon_yg_1', 'edu_kwon_yg_2', 'edu_kwon_yg_3', 'edu_kwon_yg_4', 'health_lee_jm_1', 'health_lee_jm_2', 'health_lee_jm_3', 'health_kim_ms_1', 'health_kim_ms_2', 'health_lee_js_1', 'health_lee_js_2', 'health_lee_js_3', 'health_kwon_yg_1', 'health_kwon_yg_2', 'tech_lee_jm_1', 'tech_lee_jm_2', 'tech_lee_jm_3', 'tech_kim_ms_1', 'tech_kim_ms_2', 'tech_kim_ms_3', 'tech_lee_js_1', 'tech_lee_js_2', 'tech_lee_js_3', 'tech_kwon_yg_1', 'tech_kwon_yg_2', 'tech_kwon_yg_3', 'def_lee_jm_1', 'def_lee_jm_2', 'def_lee_jm_3', 'def_lee_jm_4', 'def_kim_ms_1', 'def_kim_ms_2', 'def_kim_ms_3', 'def_kim_ms_4', 'def_lee_js_1', 'def_lee_js_2', 'def_lee_js_3', 'def_kwon_yg_1', 'def_kwon_yg_2', 'def_kwon_yg_3', 'law_lee_jm_1', 'law_lee_jm_2', 'law_lee_jm_3', 'law_lee_jm_4', 'law_lee_jm_5', 'law_kim_ms_1', 'law_kim_ms_2', 'law_kim_ms_3', 'law_lee_js_1', 'law_lee_js_2', 'law_lee_js_3', 'law_kwon_yg_1', 'law_kwon_yg_2', 'law_kwon_yg_3', 'law_kwon_yg_4', 'law_kwon_yg_5'];

        const sessionId = picks.find(p => p.type === 'session')?.session_id;
        const initialCandidate = picks.find(p => p.type === 'initial')?.candidate_id;

        const summaryObj = picks.find(p => p.type === 'summary') || {};
        const durationMs = summaryObj.duration_ms || 0;
        const finalCandidate =
            Object.entries(summaryObj.counts || {})
                .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        const chosen = new Set(
            picks.filter(p => p.type === 'policy').map(p => p.item_id)
        );

        const columns = ['session_id', 'initial_candidate', 'final_candidate', 'duration_ms'];
        const values = [trace.session_id, initialCandidate, finalCandidate, durationMs];

        ALL_ITEM_IDS.forEach(id => {
            if (chosen.has(id)) {
                columns.push(id);
                values.push(1);
            }
        });

        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO survey (${columns.join(', ')}) VALUES (${placeholders});`;

        return [sql, values];
    } catch (err) {
        return null;
    }
}

function formatNumber(number) {
    return number.toString().padStart(2, '0');
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

function msToDate(ms) {
    let date = new Date(ms);
    return date.toISOString().split('T')[0];
}

module.exports = {
    output
};
