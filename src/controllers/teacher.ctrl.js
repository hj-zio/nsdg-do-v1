'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('../modules/user.js');
const Image = require('../modules/image.js');
const Timetable = require('../modules/timetable.js');

const xlsx = require('xlsx');

const output = {
    studentTimetableForTeacher: async (req, res) => {
        try {
            const trace = req.trace;

            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 학생 시간표 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선생님용 학생 시간표 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '선생님용 학생 시간표 페이지 접속');
            await res.render('views/html/teacher-timetable');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선생님용 학생 시간표 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    teacherChoose: async (req, res) => {
        try {
            const trace = req.trace;

            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 선택과목 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선생님용 선택과목 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '선생님용 선택과목 페이지 접속');
            await res.render('views/html/teacherChoose');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선생님용 선택과목 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    }
};

const process = {
    getStudentList: async (req, res) => {
        try {
            const trace = req.trace;
            
            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 학생목록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선생님용 학생목록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            const query = await db.querySQL('SELECT schoolNum, name FROM personalSelectSubject_2', [], trace);
            const query2 = await db.querySQL('SELECT schoolNum, name FROM personalSelectSubject_3', [], trace);

            if (!query || !query2) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 학생목록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }
            
            const result = [...query, ...query2];

            await recordUserLog(req, trace, 'SUCCESS', '선생님용 학생목록 API 호출');
            await res.send({
                success: true,
                data: result, 
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선생님용 학생목록 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    },

    getTimetableForTeacher: async (req, res) => {
        try {
            const trace = req.trace;
            const schoolNum = req.query.schoolNum;
            
            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 시간표 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선생님용 시간표 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }
            
            const [gradeNum, classNum, numberNum] = extractSchoolNum(schoolNum);

            const getTimetable = await Timetable.getTimetable(gradeNum, classNum, numberNum, schoolNum, trace);
            if (!getTimetable.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 시간표 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getTimetable.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '선생님용 시간표 API 호출');
            await res.send({
                success: true,
                data: getTimetable.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선생님용 시간표 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    },

    chooseDownload: async (req, res) => {
        try { 
            const trace = req.trace;
            
            const check_permission = await User.checkPermission(trace.g_id, trace);
            if (!check_permission.success) {
                await recordUserLog(req, trace, 'FAIL', '선생님용 선택과목 다운로드 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            if (check_permission.data !== 'TEACHER' && check_permission.data !== 'ADMIN') {
                await recordUserLog(req, trace, 'FAIL', '선생님용 선택과목 다운로드 API 호출');
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

            query.sort((a, b) => a.schoolNum - b.schoolNum);
            const subject = { A1: "음악", A2: "미술", A3: "삶과 종교", B1: "음악 연주와 창작", B2: "미술 창작", C1: "음악 감상과 비평", C2: "미술 감상과 비평", D1: "교육의 이해", D2: "인간과 철학", D3: "논술", D4: "인간과 심리", E1: "주제 탐구 독서", E2: "인공지능 수학", E3: "영어 발표와 토론", E4: "세계시민과 지리", E5: "세계사", E6: "사회와 문화", E7: "정치", E8: "현대사회와 윤리", E9: "물리학", E10: "화학", E11: "생명과학", E12: "지구과학", E13: "프로그래밍", E14: "일본어", E15: "중국어", F1: "매체 의사소통", F2: "독서 토론과 글쓰기", F3: "기하", F4: "수학과 문화", F5: "심화 영어", F6: "한국지리 탐구", F7: "동아시아 역사 기행", F8: "법과 사회", F9: "윤리와 사상", F10: "역학과 에너지", F11: "물질과 에너지", F12: "세포와 물질대사", F13: "지구시스템과학", F14: "정보과학", F15: "소프트웨어와 생활", F16: "일본어 회화", F17: "중국어 회화", G1: "미적분Ⅱ", G2: "심화 영어 독해와 작문", G3: "도시의 미래 탐구", G4: "역사로 탐구하는 현대 세계", G5: "경제", G6: "인문학과 윤리", G7: "전자기와 양자", G8: "화학 반응의 세계", G9: "생물의 유전", G10: "행성우주과학", G11: "일본 문화", G12: "중국 문화", G13: "데이터 과학", H1: "문학과 영상", H2: "언어생활 탐구", H3: "수학과제 탐구", H4: "세계 문화와 영어", H5: "미디어 영어", I1: "사회문제 탐구", I2: "윤리문제 탐구", I3: "융합과학 탐구", I4: "기후변화와 환경생태", I5: "인공지능 일반", I6: "심화 일본어", I7: "심화 중국어"}
            const workbook = xlsx.utils.book_new();
            ['SO', 'ST', 'TO', 'TT', 'SOY', 'STY', 'TOY', 'TTY'].forEach(sheetName => {
                let sheetName2 = sheetName.replace('SO', '2학년 1학기').replace('ST', '2학년 2학기').replace('TO', '3학년 1학기').replace('TT', '3학년 2학기').replace('SOY', '2학년 1학기 (예술)').replace('STY', '2학년 2학기 (예술)').replace('TOY', '3학년 1학기 (예술)').replace('TTY', '3학년 2학기 (예술)')
                const sheetData = [['학번', '이름', '과목']];
                query.forEach(user => {
                    const subjectArray = JSON.parse(user.data)[sheetName];
                    const transformedData = subjectArray.map(item => subject[item] || item);
                    if (transformedData.length > 0) {
                        sheetData.push([user.schoolNum, user.name, ...transformedData]);
                    }
                });

                const worksheet = xlsx.utils.aoa_to_sheet(sheetData);
                xlsx.utils.book_append_sheet(workbook, worksheet, sheetName2);
            });

            const buffer = xlsx.write(workbook, { type: 'buffer' });

            res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(buffer);
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '선생님용 선택과목 다운로드 API 호출');
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null
            });
        }
    }
}

function extractSchoolNum(schoolNum) {
    return [parseInt(schoolNum[0], 10), parseInt(schoolNum[1], 10), parseInt(schoolNum.slice(2), 10)];
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
    output, process
}