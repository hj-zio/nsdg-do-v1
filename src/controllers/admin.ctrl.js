const db = require("../config/db.js")
const { keys } = require("../config/keys.js")
const { notice } = require("../config/notice.js")

const App = require("../../app.js")
const User = require("../modules/user.js")

const xlsx = require("xlsx")

const output = {
    main: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 메인 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 메인 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 메인 페이지 접속")
            await res.render("views/html/admin")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 메인 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    db: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 DB 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 DB 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 DB 페이지 접속")
            await res.render("views/html/admin-db")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 DB 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    server: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 서버 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 서버 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 서버 페이지 접속")
            await res.render("views/html/admin-server")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 서버 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    ins: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 점검 페이지 접속")
            await res.render("views/html/admin-ins")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 점검 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    meal: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 급식 페이지 접속")
            await res.render("views/html/admin-meal")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 급식 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    mealRating: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 평가 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 평가 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 급식 평가 페이지 접속")
            await res.render("views/html/admin-mealRating")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 급식 평가 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },
    lostItem: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: check_permission.message,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 분실물 페이지 접속")
            await res.render("views/html/admin-lostItem")
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 분실물 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },
}

const process = {
    charge: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 충전 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 충전 페이지 접속")
                await res.render("views/html/error", {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_PERMISSION,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 충전 페이지 접속")
            await res.render("views/html/admin-charge")
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 충전 페이지 접속")
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace)
            await res.render("views/html/error", {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR,
            })
            return
        }
    },

    getServerStatus: async (req, res) => {
        try {
            const trace = req.trace
            const t = Number(req.query.t) / 1000

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 서버 상태 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 서버 상태 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(
                "SELECT timestamp, cpu_usage, memory_usage, memory_total, disk_usage, disk_total, network_in, network_out, network_in_rate, network_out_rate FROM system_metrics WHERE timestamp >= (CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND) ORDER BY timestamp ASC;",
                [t],
                trace,
            )
            const query2 = await db.querySQL(
                "SELECT status, endpoint, activity, request_at, execution_at FROM USER_LOG WHERE request_at >= (CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND) ORDER BY request_at ASC;",
                [t],
                trace,
            )
            const query3 = await db.querySQL(
                "SELECT endpoint, error_code, error_message, error_stack, execution_at FROM ERROR_LOG WHERE request_at >= (CURRENT_TIMESTAMP(3) - INTERVAL ? SECOND) ORDER BY request_at ASC;",
                [t],
                trace,
            )

            if (!query || !query2 || !query3) {
                await recordUserLog(req, trace, "FAIL", "관리자 서버 상태 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 서버 상태 API 호출")
            await res.send({
                success: true,
                data: [query, query2, query3],
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 서버 상태 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null,
            })
            return
        }
    },

    createInsSchedule: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const { endpoint, type, status, startDate, endDate, duration } = req.query
            if (!endpoint || !type || !status || !startDate || !endDate || !duration) {
                await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_VALID_VALUE,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(
                "INSERT INTO INSDB (endpoint, ins_type, ins_status, ins_start, ins_end, ins_duration) VALUES (?, ?, ?, ?, ?, ?)",
                [endpoint, type, status, startDate, endDate, duration],
                trace,
            )
            if (!query) {
                await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, req.trace, "SUCCESS", "관리자 점검 스케쥴 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null,
            })
            return
        }
    },

    updateInsSchedule: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const { id, endpoint, type, status, startDate, endDate, duration } = req.query
            if (!id || !endpoint || !type || !status || !startDate || !endDate || !duration) {
                await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_VALID_VALUE,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(
                "INSERT INTO INSDB (id, endpoint, ins_type, ins_status, ins_start, ins_end, ins_duration) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE endpoint = VALUES(endpoint), ins_type = VALUES(ins_type), ins_status = VALUES(ins_status), ins_start = VALUES(ins_start), ins_end = VALUES(ins_end), ins_duration = VALUES(ins_duration);",
                [id, endpoint, type, status, startDate, endDate, duration],
                trace,
            )
            if (!query) {
                await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, req.trace, "SUCCESS", "관리자 점검 스케쥴 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 점검 스케쥴 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null,
            })
            return
        }
    },

    querySQL: async (req, res) => {
        try {
            const trace = req.trace
            const command = req.query.c
            const param = JSON.parse(req.query.p.replace(/'/g, '"'))

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 쿼리 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 쿼리 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(command, param, trace)
            if (!query) {
                await recordUserLog(req, trace, "FAIL", "관리자 쿼리 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 쿼리 API 호출")
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 쿼리 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null,
            })
            return
        }
    },

    uploadMeal: async (req, res) => {
        try {
            const trace = req.trace
            const startDate = req.query.startDate
            const endDate = req.query.endDate

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 등록 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 등록 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            if (!req.body.file) {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 등록 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_UPLOAD_FILE,
                    error: null,
                })
                return
            }

            const fileBuffer = Buffer.from(req.body.file, "base64")
            const workbook = xlsx.read(fileBuffer, { type: "buffer" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            const extractedData = []
            const columns = ["B", "C", "D", "E", "F", "G", "H"]
            const rows = [4, 5, 6]

            columns.forEach((col) => {
                const rowData = rows.map((row) => {
                    const cellAddress = col + row
                    const value = sheet[cellAddress] ? sheet[cellAddress].v : null
                    return typeof value === "string"
                        ? value
                            .replace(/$$([^)]*)$$/g, (match, inner) =>
                                /^[0-9]+(\.[0-9]+)*$/.test(inner.trim()) ? "(" + inner.replace(/\./g, ",") + ")" : "",
                            )
                            .replace(/ㆍ/g, "")
                            .trim()
                        : value
                })
                extractedData.push(rowData)
            })

            const query = await db.querySQL(
                "INSERT INTO MEALDB (data, startDate, endDate) VALUES (?, ?, ?);",
                [JSON.stringify(extractedData), startDate, endDate],
                trace,
            )
            if (!query) {
                await recordUserLog(req, trace, "FAIL", "관리자 급식 등록 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 급식 등록 API 호출")
            await res.send({
                success: true,
                data: extractedData,
                message: notice.client.SUCCESS,
                error: null,
            })
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 급식 등록 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null,
            })
            return
        }
    },

    getMealRating: async (req, res) => {
        try {
            const trace = req.trace
            const { date } = req.query
            if (!date) {
                return res.send({ success: false, data: null, message: "날짜를 입력해주세요.", error: null })
            }

            const getMealTypeKey = (koreanMealType) => {
                const mapping = {
                    조식: "breakfast",
                    중식: "lunch",
                    석식: "dinner",
                }
                return mapping[koreanMealType] || koreanMealType
            }

            // 해당 날짜의 급식 평가 데이터 조회
            const sql = `
            SELECT 
                meal_type,
                rating,
                COUNT(*) as count
            FROM mealRating 
            WHERE DATE(meal_date) = ?
            GROUP BY meal_type, rating
            ORDER BY meal_type, rating
        `

            const queryResult = await db.querySQL(sql, [date], trace)

            if (!queryResult) {
                return res.send({ success: false, data: null, message: "데이터 조회 중 오류가 발생했습니다.", error: null })
            }

            // 데이터를 meal_type별로 그룹화하여 차트 데이터 형태로 변환
            const chartData = {
                breakfast: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                lunch: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                dinner: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            }

            queryResult.forEach((row) => {
                const mealType = getMealTypeKey(row.meal_type)
                const rating = row.rating
                const count = row.count

                if (chartData[mealType]) {
                    chartData[mealType][rating] = count
                }
            })

            // 총 평가 수와 평균 평점 계산
            const summaryData = {}
            Object.keys(chartData).forEach((mealType) => {
                const ratings = chartData[mealType]
                let totalCount = 0
                let totalScore = 0

                Object.keys(ratings).forEach((rating) => {
                    const count = ratings[rating]
                    totalCount += count
                    totalScore += Number.parseInt(rating) * count
                })

                summaryData[mealType] = {
                    totalCount,
                    averageRating: totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0,
                }
            })

            return res.send({
                success: true,
                data: {
                    chartData,
                    summaryData,
                    date,
                },
                message: "데이터 조회 성공",
                error: null,
            })
        } catch (e) {
            await db.recordErrorLog("ADMIN_MEAL_RATING_001", e.message, e.stack, req.trace)
            return res.send({ success: false, data: null, message: "서버에서 오류가 발생했습니다.", error: null })
        }
    },
    getAllLostItems: async (req, res) => {
        try {
            const trace = req.trace

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success || check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 목록 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

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
                    l.is_hidden,
                    l.is_deleted,
                    l.created_at,
                    l.updated_at,
                    l.deleted_at,
                    l.deleted_by,
                    u.schoolDetail,
                    u.email
                FROM lostItemDB l
                LEFT JOIN USERDB u ON l.uuid COLLATE utf8mb4_general_ci = u.g_id
                ORDER BY l.created_at DESC`,
                [],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 목록 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 분실물 목록 조회 API 호출")
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 분실물 목록 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    getLostItemHistory: async (req, res) => {
        try {
            const trace = req.trace
            const { id } = req.params

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success || check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 이력 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(
                `SELECT * FROM lostItemHistoryDB WHERE post_id = ? ORDER BY created_at DESC`,
                [id],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 수정 이력 조회 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 수정 이력 조회 API 호출")
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 수정 이력 조회 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    hideLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { id, is_hidden } = req.body

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success || check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "분실물 숨김 처리 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const query = await db.querySQL(
                "UPDATE lostItemDB SET is_hidden = ? WHERE id = ?",
                [is_hidden ? 1 : 0, id],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 숨김 처리 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 숨김 처리 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 숨김 처리 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },

    adminDeleteLostItem: async (req, res) => {
        try {
            const trace = req.trace
            const { id } = req.body

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success || check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const getUserData = await User.getUserData(trace.g_id, trace)
            if (!getUserData.success) {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null,
                })
                return
            }

            const now = new Date().getTime()

            const query = await db.querySQL(
                "UPDATE lostItemDB SET is_deleted = 1, deleted_at = ?, deleted_by = ? WHERE id = ?",
                [now, getUserData.data.name, id],
                trace,
            )

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "관리자 분실물 삭제 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "관리자 분실물 삭제 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "관리자 분실물 삭제 API 호출")
            await db.recordErrorLog(notice.API.REQEUST_100, e.message, e.stack, req.trace)
            await res.send({
                success: false,
                data: null,
                message: notice.service.SERVER_ERROR,
                error: null,
            })
        }
    },
    updateLostItemStatus: async (req, res) => {
        try {
            const trace = req.trace
            const { id, status } = req.body

            const check_permission = await User.checkPermission(trace.g_id, trace)
            if (!check_permission.success || check_permission.data !== "ADMIN") {
                await recordUserLog(req, trace, "FAIL", "분실물 상태 변경 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null,
                })
                return
            }

            const query = await db.querySQL("UPDATE lostItemDB SET status = ? WHERE id = ?", [status, id], trace)

            if (!query) {
                await recordUserLog(req, trace, "FAIL", "분실물 상태 변경 API 호출")
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null,
                })
                return
            }

            await recordUserLog(req, trace, "SUCCESS", "분실물 상태 변경 API 호출")
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null,
            })
            return
        } catch (e) {
            await recordUserLog(req, req.trace, "FAIL", "분실물 상태 변경 API 호출")
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

async function recordUserLog(request, trace, status, activity) {
    try {
        trace.response_at = new Date().getTime()
        trace.status = status
        trace.execution_at = trace.response_at - trace.request_at
        trace.activity = activity
        request.trace = trace
        const record_user_log = await db.recordUserLog(request, request.trace)
        return record_user_log
    } catch (e) {
        await db.recordErrorLog(notice.QUERY.REQEUST_100, e.message, e.stack, request.trace)
        return null
    }
}

module.exports = {
    output,
    process,
}
