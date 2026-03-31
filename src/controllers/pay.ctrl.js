'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('../modules/user.js');
const Image = require('../modules/image.js');
const Pay = require('../modules/pay.js');

const output = {
    main: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '페이 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            if (!getUserData.data.face_feature) {
                await recordUserLog(req, req.trace, 'FAIL', '페이 페이지 접속');
                await res.redirect('/pay/facesign-1');
                return;
            }

            if (!getUserData.data.face_auth_password) {
                await recordUserLog(req, req.trace, 'FAIL', '페이 페이지 접속');
                await res.redirect('/pay/facesign-3');
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '페이 페이지 접속');
            await res.render('views/html/pay-main');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '페이 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    }, 

    charge: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '충전 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_USE_GUEST
                });
                return;
            }

            if (!getUserData.data.face_feature) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 페이지 접속');
                await res.redirect('/pay/facesign-1');
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '충전 페이지 접속');
            await res.render('views/html/pay-charge');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '충전 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    }, 

    facesign_1: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_USE_GUEST
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '얼굴 등록 페이지 접속');
            await res.render('views/html/pay-face-1');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    facesign_2: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_USE_GUEST
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '얼굴 등록 페이지 접속');
            await res.render('views/html/pay-face-2');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },
    
    facesign_3: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.SERVER_ERROR
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_USE_GUEST
                });
                return;
            }

            if (!getUserData.data.face_feature) {
                await recordUserLog(req, trace, 'FAIL', '얼굴 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.INVALID_ACCESS
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '얼굴 등록 페이지 접속');
            await res.render('views/html/pay-face-3');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    facesign_privacy: async (req, res) => {
        try {
            const trace = req.trace;
            await recordUserLog(req, trace, 'SUCCESS', '안면정보 수집동의서 페이지 접속');
            await res.render('views/html/pay-face-privacy');
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '안면정보 수집동의서 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100.CODE, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },
};

const process = {
    gerChargeList: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.isMaster === 0) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            const query = await db.querySQL("SELECT * FROM charge", [], trace);
            if (!query) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '충전 리스트 API 호출');
            await res.send({
                success: true,
                data: query,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '충전 리스트 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1400.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getUserBalance: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '사용자 잔액 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '사용자 잔액 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const get_user_balance = await Pay.getBalanceForTransaction(trace.u_id, trace);
            if (!get_user_balance.success) {
                await recordUserLog(req, trace, 'FAIL', '사용자 잔액 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: get_user_balance.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '사용자 잔액 조회 API 호출');
            await res.send({
                success: true,
                data: get_user_balance.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '사용자 잔액 조회 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2400.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getUserTransaction: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '사용자 거래내역 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '사용자 거래내역 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const get_user_transaction = await db.querySQL(`SELECT * FROM payments WHERE status = 'processed' AND customer_id = ?`, [trace.u_id], trace);
            if (!get_user_transaction) {
                await recordUserLog(req, trace, 'FAIL', '사용자 거래내역 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '사용자 거래내역 조회 API 호출');
            await res.send({
                success: true,
                data: get_user_transaction,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '사용자 거래내역 조회 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2700.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getStoreName: async (req, res) => {
        try {
            const trace = req.trace;
            const { store_id } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '매장명 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '매장명 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const getStoreName = await Pay.getStoreName(store_id, trace);
            if (!getStoreName.success) {
                await recordUserLog(req, trace, 'FAIL', '매장명 조회 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getStoreName.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '매장명 조회 API 호출');
            await res.send({
                success: true,
                data: getStoreName.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '매장명 조회 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1800.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    approveCharge: async (req, res) => {
        try {
            const trace = req.trace;
            const { charge_id } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '충전 승인 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.isMaster === 0) {
                await recordUserLog(req, trace, 'FAIL', '충전 승인 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            const approve_charge = await Pay.approveCharge(charge_id, trace);
            if (!approve_charge.success) {
                await recordUserLog(req, trace, 'FAIL', '충전 승인 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: approve_charge.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '충전 승인 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '충전 승인 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1500.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    rejectCharge: async (req, res) => {
        try {
            const trace = req.trace;
            const { charge_id } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '충전 거부 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.isMaster === 0) {
                await recordUserLog(req, trace, 'FAIL', '충전 거부 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_PERMISSION,
                    error: null
                });
                return;
            }

            const reject_charge = await Pay.rejectCharge(charge_id, trace);
            if (!reject_charge.success) {
                await recordUserLog(req, trace, 'FAIL', '충전 거부 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: reject_charge.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '충전 거부 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '충전 거부 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1600.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getProductName: async (req, res) => {
        try {
            const trace = req.trace;
            const { barcode } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품명 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품명 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const getProductName = await Pay.getProductNameByBarcode(barcode, trace);
            if (!getProductName.success) {
                await recordUserLog(req, trace, 'FAIL', '상품명 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getProductName.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품명 검색 API 호출');
            await res.send({
                success: true,
                data: getProductName.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품명 검색 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2000.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getProductInfoByBarcode: async (req, res) => {
        try {
            const trace = req.trace;
            const { barcode } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 정보 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 정보 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const get_product_info = await Pay.getProductInfoByBarcode(barcode, trace);
            if (!get_product_info.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 정보 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: get_product_info.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품 정보 검색 API 호출');
            await res.send({
                success: true,
                data: get_product_info.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 정보 검색 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    getAllProductList: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 전체 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 전체 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
            if (!query) {
                await recordUserLog(req, req.trace, 'FAIL', '상품 전체 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            if (query.length !== 1) {
                await recordUserLog(req, req.trace, 'FAIL', '상품 전체 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.STORE_NOT_FOUND,
                    error: null
                });
                return;
            }

            const store_id = query[0].store_id;

            const query2 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND is_active = 1', [store_id], trace);
            if (!query2) {
                await recordUserLog(req, req.trace, 'FAIL', '상품 전체 리스트 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, req.trace, 'SUCCESS', '상품 전체 리스트 API 호출');
            await res.send({
                success: true,
                data: query2,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 전체 리스트 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    queryProductInfo: async (req, res) => {
        try {
            const trace = req.trace;
            const { queryContent } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const getProductInfo = await Pay.getProductInfo(queryContent, trace);
            if (!getProductInfo.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 검색 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getProductInfo.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품 검색 API 호출');
            await res.send({
                success: true,
                data: getProductInfo.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 검색 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    createIdempotencyKey: async (req, res) => {
        try {
            const trace = req.trace;
            const { customer_id } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '멱등키 생성 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getUserData.message,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '멱등키 생성 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
            if (!query) {
                await recordUserLog(req, trace, 'FAIL', '멱등키 생성 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            if (query.length !== 1) {
                await recordUserLog(req, trace, 'FAIL', '멱등키 생성 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.STORE_NOT_FOUND,
                    error: null
                });
                return;
            }

            const store_id = query[0].store_id;

            const createIdempotencyKey = await Pay.createIdempotencyKey(null, store_id, customer_id, trace);
            if (!createIdempotencyKey.success) {
                await recordUserLog(req, trace, 'FAIL', '멱등키 생성 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: createIdempotencyKey.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '멱등키 생성 API 호출');
            await res.send({
                success: true,
                data: createIdempotencyKey.data[0].idempotency_key,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '멱등키 생성 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_2500.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    charge: async (req, res) => {
        try {
            const trace = req.trace;
            const { depositor, amount } = req.body; 

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const query = await db.querySQL("SELECT * FROM charge WHERE u_id = ? AND status = 'pending'", [trace.u_id], trace);
            if (!query) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            if (query.length !== 0) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.PENDING_CHARGE,
                    error: null
                });
                return;
            }

            const query2 = await db.querySQL('INSERT INTO charge (u_id, g_id, depositor, amount) VALUES (?, ?, ?, ?)', [trace.u_id, trace.g_id, depositor, amount], trace);
            if (!query2) {
                await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '충전 요청 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '충전 요청 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_600.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    requestPayment: async (req, res) => {
        try {
            const trace = req.trace;
            const { customer_id, productItem, password, face_image_id, idempotency_key } = req.body; 

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '결제 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '결제 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const requestPayment = await Pay.requestPayment(customer_id, productItem, password, face_image_id, idempotency_key, null, trace);
            if (!requestPayment.success) {
                await recordUserLog(req, trace, 'FAIL', '결제 요청 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: requestPayment.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '결제 요청 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '결제 요청 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_600.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    compare_face: async (req, res) => {
        try {
            const { imgBase64 } = req.body; 
            const trace = req.trace;
            
            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 비교 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 비교 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const compare = await Pay.compareEmbeding(imgBase64, trace);
            if (!compare.success) {
                await res.send({
                    success: false,
                    data: null,
                    message: compare.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, req.trace, 'SUCCESS', '얼굴 비교 API 호출');
            await res.send({
                success: true,
                data: compare.data,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '얼굴 비교 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
            return;
        }
    },

    sign_face: async (req, res) => {
        try {
            const { imgBase64 } = req.body; 
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const sign_face = await Pay.signFace(imgBase64, trace);
            if (!sign_face.success) {
                await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: sign_face.message,
                    error: null
                });
                return;
            }
            
            await recordUserLog(req, req.trace, 'SUCCESS', '얼굴 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '얼굴 등록 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
            return;
        }
    },

    sign_password: async (req, res) => {
        try {
            const { pw } = req.body; 
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, req.trace, 'FAIL', '비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, req.trace, 'FAIL', '비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            if (!getUserData.data.face_feature) {
                await recordUserLog(req, req.trace, 'FAIL', '비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.INVALID_ACCESS,
                    error: null
                });
                return;
            }

            const signHashedPassword = await Pay.signHashedPassword(pw, trace);
            if (!signHashedPassword.success) {
                await recordUserLog(req, req.trace, 'FAIL', '비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: signHashedPassword.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, req.trace, 'SUCCESS', '비밀번호 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '비밀번호 등록 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_100.CODE, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
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
        await db.recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, request.trace);
        return null;
    }
}

module.exports = {
    output, process
}