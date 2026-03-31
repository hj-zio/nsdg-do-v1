'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('../modules/user.js');
const Pay = require('../modules/pay.js');

const output = {
    main: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.NOT_USE_GUEST
                });
                return;
            }

            const queryStore = await Pay.queryStore(trace);
            if (!queryStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 페이지 접속');
                await res.redirect('/store/sign');
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '스토어 페이지 접속');
            await res.render('views/html/store-main');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    sign: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '스토어 등록 페이지 접속');
            await res.render('views/html/store-sign');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    signCode: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            const queryStore = await Pay.queryStore(trace);
            if (!queryStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: notice.client.INVALID_ACCESS
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '스토어 비밀번호 등록 페이지 접속');
            await res.render('views/html/store-sign-code');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 비밀번호 등록 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    manageProduct: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 관리 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 관리 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            const queryStore = await Pay.queryStore(trace);
            if (!queryStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 관리 페이지 접속');
                await res.redirect('/store/sign');
                return;
            }

            /// 추후 비밀번호 검증 넣어야 함.

            await recordUserLog(req, trace, 'SUCCESS', '스토어 관리 페이지 접속');
            await res.render('views/html/store-manage-product');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 관리 페이지 접속');
            await db.recordErrorLog(notice.PAGE.RENDER_100, e.message, e.stack, req.trace);
            await res.render('views/html/error', {
                title: notice.client.REQ_ERROR,
                subtitle: notice.client.SERVER_ERROR
            });
            return;
        }
    },

    kiosk: async (req, res) => {
        try {
            const trace = req.trace;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 키오스크 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 키오스크 페이지 접속');
                await res.render('views/html/error', {
                    title: notice.client.REQ_ERROR,
                    subtitle: getUserData.message
                });
                return;
            }

            const queryStore = await Pay.queryStore(trace);
            if (!queryStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 키오스크 페이지 접속');
                await res.redirect('/store/sign');
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '스토어 키오스크 페이지 접속');
            await res.render('views/html/store-kiosk');
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 키오스크 페이지 접속');
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
    createProduct: async (req, res) => {
        try {
            const trace = req.trace;
            const { barcode, name, price } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const createProduct = await Pay.createProduct(name, price, null, barcode, trace);
            if (!createProduct.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: createProduct.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 등록 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1000, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    changeProduct: async (req, res) => {
        try {
            const trace = req.trace;
            const { originBarcode, barcode, name, price } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 변경 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 변경 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const getProductInfo = await Pay.getProductInfo(originBarcode, trace);
            if (!getProductInfo.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 변경 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: getProductInfo.message,
                    error: null
                });
                return;
            }

            const product_id = getProductInfo.data.find(item => item.barcode === originBarcode)?.product_id || null;
            if (!product_id) {
                await recordUserLog(req, trace, 'FAIL', '상품 변경 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.INVALID_ACCESS,
                    error: null
                });
                return;
            }

            const changeProduct = await Pay.changeProduct(product_id, name, price, null, barcode, trace);
            if (!changeProduct.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 변경 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: changeProduct.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품 변경 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 변경 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1100, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const trace = req.trace;
            const { barcodeArray } = req.body;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '상품 삭제 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '상품 삭제 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            for (const barcode of barcodeArray) {
                const deleteProduct = await Pay.deleteProduct(barcode, trace);
                if (!deleteProduct.success) {
                    await recordUserLog(req, trace, 'FAIL', '상품 삭제 API 호출');
                    return res.send({
                        success: false,
                        data: null,
                        message: deleteProduct.message,
                        error: null
                    });
                }
            }

            await recordUserLog(req, trace, 'SUCCESS', '상품 삭제 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '상품 삭제 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1200, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    createStore: async (req, res) => {
        try {
            const trace = req.trace;
            const { store_name } = req.query;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const createStore = await Pay.createStore(store_name, trace);
            if (!createStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: createStore.message,
                    error: null
                });
                return;
            }

            await recordUserLog(req, trace, 'SUCCESS', '스토어 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 등록 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_800, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
        }
    },

    signCode: async (req, res) => {
        try {
            const trace = req.trace;
            const { pw } = req.body;

            const getUserData = await User.getUserData(trace.g_id, trace);
            if (!getUserData.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.SERVER_ERROR,
                    error: null
                });
                return;
            }

            if (getUserData.data.g_id === '123456789') {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.NOT_USE_GUEST,
                    error: null
                });
                return;
            }

            const queryStore = await Pay.queryStore(trace);
            if (!queryStore.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: notice.client.INVALID_ACCESS,
                    error: null
                });
                return;
            }

            const signHashedStorePassword = await Pay.signHashedStorePassword(pw, trace);
            if (!signHashedStorePassword.success) {
                await recordUserLog(req, trace, 'FAIL', '스토어 비밀번호 등록 API 호출');
                await res.send({
                    success: false,
                    data: null,
                    message: signHashedStorePassword.message,
                    error: null
                });
                return;
            } 

            await recordUserLog(req, trace, 'SUCCESS', '스토어 비밀번호 등록 API 호출');
            await res.send({
                success: true,
                data: null,
                message: notice.client.SUCCESS,
                error: null
            });
            return;
        } catch (e) {
            await recordUserLog(req, req.trace, 'FAIL', '스토어 비밀번호 등록 API 호출');
            await db.recordErrorLog(notice.PAY.REQEUST_1900, e.message, e.stack, req.trace);
            await res.send({
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            });
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
    output, process
}