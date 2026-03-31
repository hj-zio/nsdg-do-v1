'use strict';

const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const User = require('./user.js');

const crypto = require('crypto');
const request = require('request-promise-native');
const axios = require('axios');
const cheerio = require('cheerio');
const { error } = require('console');

/**
 * 이미지 임베딩 추출하는 함수
 * @param {string} imgBase64 
 * @param {object} trace 
 * @returns data: [embeding, face_id]
 */
async function getEmbedding(imgBase64, trace) {
    try {
        const options = {
            method: 'POST',
            uri: keys.pay.EMBED_URL,
            json: {
                image: imgBase64
            }
        };

        const reqData = await request(options);
        if (!reqData.success) {
            return {
                success: false,
                data: null,
                message: notice.client.SERVER_ERROR,
                error: null
            };
        }

        const query = await db.querySQL('INSERT INTO face_images (u_id, g_id, image_base64) VALUES (?, ?, ?) RETURNING id;', [trace.u_id, trace.g_id, imgBase64], trace);
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
            data: [reqData.embedding, query],
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 이미지 임베딩 비교하는 함수 (코사인 유사도)
 * @param {object} imgBase64 
 * @param {object} trace 
 * @returns 
 */
async function compareEmbeding(imgBase64, trace) {
    try {
        const get_embeding = await getEmbedding(imgBase64, trace);
        if (!get_embeding.success) {
            return {
                success: false,
                data: null,
                message: notice.client.FACE_NOT_DETECT,
                error: null
            };
        }

        const query = await db.querySQL('SELECT uuid, name, profileImage, face_feature FROM USERDB;', [], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const rankedResult = query
            .filter(r => r.face_feature)
            .map(({ uuid, name, profileImage, face_feature }) => {
                const f = Array.isArray(face_feature) ? face_feature : JSON.parse(face_feature);
                return { uuid, name, profileImage, match_ratio: +cosineSimilarity(get_embeding.data[0], f).toFixed(6) };
            })
            .sort((a, b) => b.match_ratio - a.match_ratio);

        return {
            success: true,
            data: [rankedResult, get_embeding.data[1][0].id],
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_200.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 얼굴을 등록하는 함수
 * @param {string} imgBase64 
 * @param {object} trace 
 * @returns 
 */
async function signFace(imgBase64, trace) {
    try {
        const get_embedding = await getEmbedding(imgBase64, trace);
        if (!get_embedding.success) {
            return {
                success: false,
                data: null,
                message: get_embedding.message,
                error: null
            };
        }

        const query = await db.querySQL('UPDATE USERDB SET face_image_id = ?, face_feature = ? WHERE g_id = ?', [get_embedding.data[1][0].id, JSON.stringify(get_embedding.data[0]), trace.g_id], trace);
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
        await db.recordErrorLog(notice.PAY.REQEUST_300.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 비밀번호를 해시화하는 함수
 * @param {string} password 
 * @param {string} salt 
 * @returns 
 */
async function hashPassword(password, salt) {
    try {
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        return {
            success: true,
            data: hash.toString('hex'),
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_500.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 해시화 된 비밀번호를 등록하는 함수
 * @param {string} targetPassword 
 * @param {object} trace 
 * @returns 
 */
async function signHashedPassword(targetPassword, trace) {
    try {
        if (targetPassword.length !== 4 || !/^[0-9]+$/.test(targetPassword)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_ACCESS,
                error: null
            };
        }

        const query = await db.querySQL('SELECT salt FROM USERDB WHERE uuid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const targetPassword_hashed = await hashPassword(targetPassword, query[0].salt);
        if (!targetPassword_hashed.success) {
            return {
                success: false,
                data: null,
                message: targetPassword_hashed.message,
                error: null
            };
        }

        const query2 = await db.querySQL('UPDATE USERDB SET face_auth_password = ? WHERE uuid = ?', [targetPassword_hashed.data, trace.u_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
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
        await db.recordErrorLog(notice.PAY.REQEUST_400.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 해시화 된 매장 비밀번호를 등록하는 함수
 * @param {string} targetPassword 
 * @param {object} trace 
 * @returns 
 */
async function signHashedStorePassword(targetPassword, trace) {
    try {
        if (targetPassword.length !== 4 || !/^[0-9]+$/.test(targetPassword)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_ACCESS,
                error: null
            };
        }

        const query = await db.querySQL('SELECT salt FROM USERDB WHERE uuid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const targetPassword_hashed = await hashPassword(targetPassword, query[0].salt);
        if (!targetPassword_hashed.success) {
            return {
                success: false,
                data: null,
                message: targetPassword_hashed.message,
                error: null
            };
        }

        const query2 = await db.querySQL('UPDATE stores SET password = ? WHERE owner_uid = ?;', [targetPassword_hashed.data, trace.u_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
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
        await db.recordErrorLog(notice.PAY.REQEUST_500.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 해시화 된 비밀번호의 일치 여부를 반환하는 함수
 * @param {string} targetPassword 
 * @param {string} customer_id
 * @param {object} trace 
 * @returns 
 */
async function compareHashedPassword(targetPassword, customer_id, trace) {
    try {
        if (targetPassword.length !== 4 || !/^[0-9]+$/.test(targetPassword)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }

        const query = await db.querySQL('SELECT salt, face_auth_password FROM USERDB WHERE uuid = ?', [customer_id], trace);
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
                success: false,
                data: null,
                message: notice.client.USER_NOT_FOUND,
                error: null
            };
        }

        const targetPassword_hashed = await hashPassword(targetPassword, query[0].salt);
        if (!targetPassword_hashed.success) {
            return {
                success: false,
                data: null,
                message: targetPassword_hashed.message,
                error: null
            };
        }

        if (targetPassword_hashed.data !== query[0].face_auth_password) {
            return {
                success: true,
                data: false,
                message: notice.client.NOT_MATCH_PASSWORD,
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
        await db.recordErrorLog(notice.PAY.REQEUST_400.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 해시화 된 매장 비밀번호의 일치 여부를 반환하는 함수
 * @param {string} targetPassword 
 * @param {object} trace 
 * @returns 
 */
async function compareHashedStorePassword(targetPassword, trace) {
    try {
        if (targetPassword.length !== 4 || !/^[0-9]+$/.test(targetPassword)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_ACCESS,
                error: null
            };
        }

        const query = await db.querySQL('SELECT salt FROM USERDB WHERE uuid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const query2 = await db.querySQL('SELECT password FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const targetPassword_hashed = await hashPassword(targetPassword, query[0].salt);
        if (!targetPassword_hashed.success) {
            return {
                success: false,
                data: null,
                message: targetPassword_hashed.message,
                error: null
            };
        }

        if (targetPassword_hashed.data !== query2[0].password) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_400.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 매장을 생성하는 함수
 * @param {string} store_name 
 * @param {object} trace 
 * @returns 
 */
async function createStore(store_name, trace) {
    try {
        if (!store_name || store_name === '' || typeof(store_name) != 'string') {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }

        const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 0) { /// 매장은 1인당 1개까지 개설 가능함
            return {
                success: false,
                data: null,
                message: notice.client.STORE_MAX_ONE,
                error: null
            }
        }

        const query2 = await db.querySQL('INSERT INTO stores (store_name, owner_uid) VALUES (?, ?)', [store_name, trace.u_id], trace);
        if (!query2) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_800.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 매장을 삭제하는 함수
 * @param {object} trace 
 * @returns 
 */
async function deleteStore(trace) {
    try {
        const query = await db.querySQL("SELECT * FROM stores WHERE owner_uid = ?", [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length === 0) { /// 매장을 등록하지 않았다면
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const query2 = await db.querySQL("DELETE FROM stores WHERE owner_uid = ?", [trace.u_id], trace);
        if (!query2) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_900.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 매장을 조회하는 함수
 * @param {object} trace 
 * @returns 
 */
async function queryStore(trace) {
    try {
        const query = await db.querySQL("SELECT store_id, store_name, owner_uid, created_at, updated_at FROM stores WHERE owner_uid = ?;", [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length === 0) { /// 매장을 등록하지 않았다면
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: query[0],
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_1800.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

async function getStoreName(store_id, trace) {
    try {
        const query = await db.querySQL(`SELECT * FROM stores WHERE store_id = ?`, [store_id], trace);
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
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: query[0].store_name,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_1800.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품을 등록하는 함수
 * @param {string} store_id 
 * @param {string} product_name 
 * @param {number} product_price 
 * @param {string} product_description 
 * @param {string} product_barcode 
 * @param {object} trace 
 * @returns 
 */
async function createProduct(product_name, product_price, product_description, product_barcode, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 등록된 매장이 없어서 상품을 등록할 수 없음
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        if (product_barcode === '' || product_name === '' || product_price === '' || product_barcode.length > 20 || product_name.length > 50 || !/^\d+$/.test(product_price)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }

        const store_id = query[0].store_id;
        const query2 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND barcode = ? AND is_active = 1', [store_id, product_barcode], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query2.length !== 0) { /// 이미 동일한 바코드로 등록된 상품이 있어 등록할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_MAX_ONE,
                error: null
            }
        }

        const query3 = await db.querySQL('INSERT INTO products (store_id, name, description, price, barcode) VALUES (?, ?, ?, ?, ?)', [store_id, product_name, product_description, product_price, product_barcode], trace);
        if (!query3) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_1000.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품을 정보를 변경하는 함수
 * @param {string} product_id 
 * @param {string} product_name 
 * @param {number} product_price 
 * @param {string} product_description 
 * @param {object} trace 
 * @returns 
 */
async function changeProduct(product_id, product_name, product_price, product_description, product_barcode, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 등록된 매장이 없어서 상품을 변경할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        if (product_barcode === '' || product_name === '' || product_price === '' || product_barcode.length > 20 || product_name.length > 50 || !/^\d+$/.test(product_price)) {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }

        const store_id = query[0].store_id;

        const query2 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND product_id = ? AND is_active = 1', [store_id, product_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query2.length !== 1) { /// 등록된 상품이 없어서 상품을 변경할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_NOT_FOUND,
                error: null
            };
        }

        const query3 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND product_id != ? AND barcode = ? AND is_active = 1', [store_id, product_id, product_barcode], trace);
        if (!query3) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query3.length !== 0) { /// 이미 변경하고자 하는 바코드로 등록된 상품이 있는지
            return {
                success: false,
                data: null,
                message: notice.client.DUPLICATE_PRODUCT_BARCODE,
                error: null
            };
        }

        const query4 = await db.querySQL('UPDATE products SET name = ?, description = ?, price = ?, barcode = ? WHERE product_id = ? AND is_active = 1', [product_name, product_description, product_price, product_barcode, product_id], trace);
        if (!query4) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_1100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품을 삭제하는 함수 (비활성화)
 * @param {string} barcode 
 * @param {object} trace 
 * @returns 
 */
async function deleteProduct(barcode, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 등록된 매장이 없어서 상품을 삭제할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query[0].store_id;

        const query2 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND barcode = ? AND is_active = 1', [store_id, barcode], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query2.length !== 1) { /// 등록된 상품이 없어서 상품을 삭제할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_NOT_FOUND,
                error: null
            };
        }

        const query3 = await db.querySQL('UPDATE products SET is_active = 0 WHERE store_id = ? AND barcode = ? AND is_active = 1', [store_id, barcode], trace);
        if (!query3) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_1200.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품을 조회하는 함수 (by 바코드)
 * @param {string} barcode 
 * @param {object} trace 
 * @returns 
 */
async function queryProduct(barcode, trace) {
    try {
        const query = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 등록된 매장이 없어서 상품을 조회할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query[0].store_id;

        const query2 = await db.querySQL('SELECT * FROM products WHERE store_id = ? AND barcode = ? AND is_active = 1', [store_id, barcode], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query2.length === 0) { /// 등록된 상품이 없어서 상품을 조회할 수 없음.
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: query2,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_1300.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 충전을 승인하는 함수
 * @param {string} charge_id
 * @param {object} trace
 */
async function approveCharge(charge_id, trace) {
    try {
        const query = await db.querySQL(`SELECT * FROM charge WHERE id = ? AND status = 'pending'`, [charge_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 처리 가능한 충전신청 건이 없을 경우
            return {
                success: false,
                data: null,
                message: notice.client.CHARGE_NOT_FOUND,
                error: null
            };
        }

        const transaction = await createPaymentTransaction('deposit', null, query[0].u_id, null, [{ barcode: '1234567890', quantity: query[0].amount }], '관리자 승인 충전', trace);
        if (!transaction.success) {
            return {
                success: false,
                data: null,
                message: transaction.message,
                error: null
            };
        }

        const pay_id = transaction.data[0].pay_id;

        const commands = [
            `UPDATE charge
            SET status = ?, pay_id = ?, processed_by = ?, processed_at = NOW() 
            WHERE id = ? AND status = 'pending'`,

            `UPDATE payments 
            SET idempotency_key = ?, status = ?, face_image_id = ?, fail_reason = ?, cancel_reason = ?
            WHERE pay_id = ? AND store_id = ? AND status = 'pending'`,
        ];

        const parameters = [
            ['approved', pay_id, trace.u_id, charge_id],
            [null, 'processed', null, null, null, pay_id, 'c208650f-6847-11f0-909d-da898dd8ec7f']
        ];

        const query2 = await db.querySQLTransaction(commands, parameters, trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: query2.message,
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
        await db.recordErrorLog(notice.PAY.REQEUST_1500.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 충전을 거부하는 함수
 * @param {string} charge_id
 * @param {object} trace
 */
async function rejectCharge(charge_id, trace) {
    try {
        const query = await db.querySQL(`SELECT * FROM charge WHERE id = ? AND status = 'pending'`, [charge_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) { /// 처리 가능한 충전신청 건이 없을 경우
            return {
                success: false,
                data: null,
                message: notice.client.CHARGE_NOT_FOUND,
                error: null
            };
        }

        const transaction = await createPaymentTransaction('deposit', null, query[0].u_id, null, [{ barcode: '1234567890', quantity: query[0].amount }], '관리자 승인 충전', trace);
        if (!transaction.success) {
            return {
                success: false,
                data: null,
                message: transaction.message,
                error: null
            };
        }

        const pay_id = transaction.data[0].pay_id;
        
        const commands = [
            `UPDATE charge
            SET status = ?, pay_id = ?, processed_by = ?, processed_at = NOW() 
            WHERE id = ? AND status = 'pending'`,

            `UPDATE payments 
            SET idempotency_key = ?, status = ?, face_image_id = ?, fail_reason = ?, cancel_reason = ?
            WHERE pay_id = ? AND store_id = ? AND status = 'pending'`,
        ];

        const parameters = [
            ['rejected', pay_id, trace.u_id, charge_id],
            [null, 'failed', null, notice.client.CHECK_CHARGE, null, pay_id, 'c208650f-6847-11f0-909d-da898dd8ec7f']
        ];

        const query2 = await db.querySQLTransaction(commands, parameters, trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: query2.message,
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
        await db.recordErrorLog(notice.PAY.REQEUST_1600.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 거래 트랜잭션 생성하는 함수
 * @param {string} pay_type
 * @param {string} customer_id
 * @param {object} product_items
 * @param {string} memo 
 * @param {object} trace
 * @returns 기록된 트랜잭션의 pay_id를 반환함.
 */
async function createPaymentTransaction(pay_type, idempotency_key, customer_id, face_image_id, product_items, memo, trace) {
    try {
        const query1 = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query1) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query1.length !== 1) { /// 등록된 매장이 없는 경우
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query1[0].store_id;

        const totalAmount = await getTotalAmount(store_id, product_items, trace);
        if (!totalAmount.success) {
            return {
                success: false,
                data: null,
                message: totalAmount.message,
                error: null
            };
        }

        const query2 = await db.querySQL('INSERT INTO payments (pay_type, store_id, idempotency_key, status, customer_id, face_image_id, fail_reason, cancel_reason, cancel_at, amount, product_items, is_settled, settled_at, memo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING pay_id', [pay_type, store_id, idempotency_key, 'pending', customer_id, face_image_id, null, null, null, totalAmount.data, JSON.stringify(product_items), 0, null, memo], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        return {
            success: true,
            data: query2,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_700.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품 총합 계산해주는 함수.
 * @param {string} store_id 
 * @param {object} product_items
 * @param {object} trace 
 */
async function getTotalAmount(store_id, product_items, trace) {
    try {
        if (!Array.isArray(product_items) || product_items.length === 0) { /// product_items의 포맷이 유효하지 않으면
            return {
                success: false,
                data: null,
                message: notice.client.NOT_VALID_VALUE,
                error: null
            };
        }

        if (product_items.some(item => typeof item.barcode !== 'string' || typeof item.quantity !== 'number' || isNaN(item.quantity))) { /// product_items의 내부 데이터 자료형이 유효하지 않다면
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }

        const barcodes = product_items.map(item => item.barcode);
        const placeholders = barcodes.map(() => '?').join(',');
        const query = await db.querySQL(`SELECT barcode, price FROM products WHERE store_id = ? AND is_active = 1 AND barcode IN (${placeholders})`, [store_id, ...barcodes], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        const found = query.map(r => r.barcode);
        const missing = barcodes.filter(b => !found.includes(b));
        if (missing > 0) { /// Product_id가 사용자 요청 정보와 DB 등록된 정보가 다르다면
            return {
                success: false,
                data: null,
                message: notice.client.NOT_MATCH_ORDER,
                error: null
            };
        }

        const priceMap = new Map(query.map(r => [r.barcode, r.price]));
        let total = 0;
        for (const { barcode, quantity } of product_items) {
            total += priceMap.get(barcode) * quantity;
        }

        if (!total) { /// 만약 가격이 정상적으로 계산되지 않았다면
            return {
                success: false,
                data: null,
                message: notice.client.PRICE_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: total,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_1700.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 바코드를 기반으로 상품명 추출하는 함수 (beepscan)
 * @param {string} barcode 
 * @param {object} trace 
 * @returns 
 */
async function getProductNameByBarcode(barcode, trace) {
    try {
        if (typeof(barcode) !== 'string') {
            return {
                success: false,
                data: null,
                message: notice.client.INVALID_TYPE_DATA,
                error: null
            };
        }
        const url = `https://www.beepscan.com/barcode/${barcode}`;

        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const barcodeNumber = $('div').filter((i, el) => $(el).text().includes('▸ Result')).first().text().replace(/\D/g, '');
        const name = $('div.container p b').first().text().trim();

        if (!name || name.length === 0) {
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_NAME_NOT_FOUND,
                error: null
            }
        }

        return {
            success: true,
            data: name,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2000.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품 정보를 검색하는 함수 (바코드, 상품명 기반)
 * @param {string} query 
 * @param {object} trace 
 */
async function getProductInfo(query, trace) {
    try {
        const query1 = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query1) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query1.length !== 1) { /// 등록된 매장을 찾을 수 없는 경우
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query1[0].store_id;

        const query2 = await db.querySQL('SELECT * FROM products WHERE (name LIKE ? OR barcode LIKE ?) AND store_id = ? AND is_active = 1;', [query, query, store_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        return {
            success: true,
            data: query2,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 상품 정보를 검색하는 함수 (바코드 기반)
 * @param {string} barcode 
 * @param {object} trace 
 */
async function getProductInfoByBarcode(barcode, trace) {
    try {
        const query1 = await db.querySQL('SELECT * FROM stores WHERE owner_uid = ?', [trace.u_id], trace);
        if (!query1) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query1.length !== 1) { /// 등록된 매장을 찾을 수 없는 경우
            return {
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query1[0].store_id;

        const query2 = await db.querySQL('SELECT * FROM products WHERE barcode = ? AND store_id = ? AND is_active = 1;', [barcode, store_id], trace);
        if (!query2) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query2.length !== 1) {
            return {
                success: false,
                data: null,
                message: notice.client.PRODUCT_NOT_FOUND,
                error: null
            };
        }

        return {
            success: true,
            data: query2,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2100.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 트랜잭션 상에서의 잔액 조회하는 함수 (유효성 검증용)
 * @param {string} customer_id 
 * @param {object} trace 
 * @returns 
 */
async function getBalanceForTransaction(customer_id, trace) {
    try {
        const query = await db.querySQL(`SELECT COALESCE(SUM(CASE WHEN pay_type='deposit' THEN amount WHEN pay_type='withdrawal' THEN -amount END),0) AS balance FROM payments WHERE status='processed' AND customer_id = ?;`, [customer_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) {
            return {
                success: false,
                data: null,
                message: notice.client.AMOUNT_NOT_FOUND_ON_TRANSACTION,
                error: null
            };
        }
        
        const balance = Number(query[0].balance);
        if (Number.isNaN(balance)) {
            return {
                success: false,
                data: null,
                message: notice.client.AMOUNT_NOT_FOUND_ON_TRANSACTION,
                error: null
            };
        }

        return {
            success: true,
            data: balance,
            message: notice.client.SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2400.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 멱등키를 생성하는 함수
 * @param {string} pay_id 
 * @param {string} store_id 
 * @param {string} customer_id 
 * @param {object} trace 
 * @returns 
 */
async function createIdempotencyKey(pay_id, store_id, customer_id, trace) {
    try {
        const query = await db.querySQL('INSERT INTO idempotency_keys (pay_id, status, store_id, customer_id) VALUES (?, ?, ?, ?) RETURNING idempotency_key;', [pay_id, 'pending', store_id, customer_id], trace);
        if (!query) {
            return {
                success: false,
                data: null,
                message: notice.client.QUERY_ERROR,
                error: null
            };
        }

        if (query.length !== 1) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_2500.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 멱등키 사용 처리하는 함수
 * @param {string} pay_id 
 * @param {string} store_id 
 * @param {string} customer_id 
 * @param {string} idempotency_key 
 * @param {object} trace 
 * @returns 
 */
async function consumeIdempotencyKey(pay_id, store_id, customer_id, idempotency_key, trace) {
    try {
        const query = await db.querySQL(`SELECT * FROM idempotency_keys WHERE idempotency_key = ?`, [idempotency_key], trace);
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
                success: false,
                data: null,
                message: notice.client.IDEM_KEY_NOT_FOUND,
                error: null
            };
        }

        if (query[0].status === 'processed') {
            return {
                success: false,
                data: null,
                message: notice.client.NOT_REUSE_IDEM_KEY,
                error: null
            };
        }

        if (query[0].store_id !== store_id) { /// 멱등키에 등록된 store_id와 결제요청 시 들어온 store_id가 다르다면
            return {
                success: false,
                data: null,
                message: notice.client.NOT_MATCH_STORE_ID_IN_IDEM_KEY,
                error: null
            };
        }

        if (query[0].customer_id !== customer_id) { /// 멱등키에 등록된 customer_id와 결제요청 시 들어온 customer_id가 다르다면
            return {
                success: false,
                data: null,
                message: notice.client.NOT_MATCH_CUSTOMER_ID_IN_IDEM_KEY,
                error: null
            };
        }

        const query2 = await db.querySQL(`UPDATE idempotency_keys SET pay_id = ?, status = ?, store_id = ?, customer_id = ? WHERE idempotency_key = ? AND status = 'pending';`, [pay_id, 'processed', store_id, customer_id, idempotency_key], trace);
        if (!query2) {
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
        await db.recordErrorLog(notice.PAY.REQEUST_2600.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

/**
 * 결제요청을 처리하는 함수
 * @param {string} customer_id 
 * @param {object} product_items 
 * @param {string} password 
 * @param {string} face_image_id 
 * @param {string} idempotency_key 
 * @param {string} memo 
 * @param {object} trace 
 * @returns 
 */
async function requestPayment(customer_id, product_items, password, face_image_id, idempotency_key, memo, trace) {
    try {
        const query = await db.querySQL(`SELECT * FROM stores WHERE owner_uid = ?`, [trace.u_id], trace);
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
                success: false,
                data: null,
                message: notice.client.STORE_NOT_FOUND,
                error: null
            };
        }

        const store_id = query[0].store_id;

        const consume_idempotency_key = await consumeIdempotencyKey(null, store_id, customer_id, idempotency_key, trace);
        if (!consume_idempotency_key.success) {
            return {
                success: false,
                data: null,
                message: consume_idempotency_key.message,
                error: null
            };
        }

        const create_payment_transaction = await createPaymentTransaction('withdrawal', idempotency_key, customer_id, face_image_id, product_items, memo, trace);
        if (!create_payment_transaction.success) {
            return {
                success: false,
                data: null,
                message: create_payment_transaction.message,
                error: null
            };
        }

        const pay_id = create_payment_transaction.data[0].pay_id;

        const compare_hashed_password = await compareHashedPassword(password, customer_id, trace);
        if (!compare_hashed_password.success || !compare_hashed_password.data) {
            const query2 = await db.querySQL(`UPDATE payments SET status = ?, fail_reason = ? WHERE pay_id = ?`, ['failed', '비밀번호가 일치하지 않습니다.', pay_id], trace);
            if (!query2) {
                return {
                    success: false,
                    data: null,
                    message: notice.client.QUERY_ERROR,
                    error: null
                };
            }
            
            return {
                success: false,
                data: null,
                message: compare_hashed_password.message,
                error: null
            };
        }

        const get_total_amount = await getTotalAmount(store_id, product_items, trace);
        if (!get_total_amount.success) {
            return {
                success: false,
                data: null,
                message: get_total_amount.message,
                error: null
            };
        }

        const get_balance_for_transaction = await getBalanceForTransaction(customer_id, trace);
        if (!get_balance_for_transaction.success) {
            return {
                success: false,
                data: null,
                message: get_balance_for_transaction.message,
                error: null
            };
        }

        if (Number(get_balance_for_transaction.data) - Number(get_total_amount.data) < 0) {
            return {
                success: false,
                data: null,
                message: notice.client.INSUFFICIENT_BALANCE,
                error: null
            }
        }

        const change_payment_transaction = await db.querySQL(`UPDATE payments SET status = ? WHERE pay_id = ? AND status = 'pending'`, ['processed', pay_id], trace);
        if (!change_payment_transaction) {
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
            message: notice.client.PAY_SUCCESS,
            error: null
        };
    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2200.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

async function refundPayment() {
    try {

    } catch (e) {
        await db.recordErrorLog(notice.PAY.REQEUST_2300.CODE, e.message, e.stack, trace);
        return {
            success: false,
            data: null,
            message: notice.client.SERVER_ERROR,
            error: null
        };
    }
}

function cosineSimilarity(a, b) {
    let d = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; nA += a[i] ** 2; nB += b[i] ** 2; }
    return d / (Math.sqrt(nA) * Math.sqrt(nB));
}

module.exports = {
    getEmbedding, compareEmbeding, signFace, hashPassword, signHashedPassword, signHashedStorePassword, 
    compareHashedPassword, compareHashedStorePassword, createStore, deleteStore, queryStore, getStoreName, createProduct, changeProduct, deleteProduct, queryProduct,
    approveCharge, rejectCharge, createPaymentTransaction, getTotalAmount,
    getProductNameByBarcode, getProductInfo, getProductInfoByBarcode,
    getBalanceForTransaction, createIdempotencyKey, consumeIdempotencyKey, requestPayment, refundPayment
}