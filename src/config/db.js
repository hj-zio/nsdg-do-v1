'use strict';

const mysql = require('mysql');
const queryRedisLogs = require('../redis/queryRedisLogs.js');

const { keys } = require('./keys.js');
const { notice } = require('./notice.js');

let connection;

function handleDisconnect() {
    connection = mysql.createConnection({
        host: keys.db.HOST,
        user: keys.db.USER,
        password: keys.db.PASSWORD,
        database: keys.db.DATABASE,
        port: keys.db.PORT,
        charset: 'utf8mb4'
    });

    connection.connect((err) => {
        if (err) {
            console.error('DB와의 연결을 실패했습니다. 서비스를 다시 시작합니다.');
            process.exit(1);
        }
    });

    connection.on('error', (err) => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('DB와의 연결을 실패했습니다. 서비스를 다시 시작합니다.');
            process.exit(1);
        } else {
            throw err;
        }
    });
}

handleDisconnect();

/**
 * 요청한 쿼리 실행하는 함수
 * 
 * @param {string} command
 * @param {object} parameters
 * @param {object} trace
 */

async function querySQL(command, parameters, trace) {
    try {
        const query_request_at = getNowTime();

        const query = await new Promise((resolve, reject) => {
            connection.query(command, parameters, function (err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const query_response_at = getNowTime();

        trace.query_request_at = query_request_at;
        trace.query_response_at = query_response_at;

        if (JSON.stringify(query).length > 30000) {
            await recordQueryLog(command, parameters, 'SUCCESS', 'SERVICE MAX_BYTES_LOCK OVER 30000 Bytes', trace);
            return query;
        }

        await recordQueryLog(command, parameters, 'SUCCESS', query, trace);
        return query;
    } catch (e) {
        await recordQueryLog(command, parameters, 'FAIL', null, trace);
        await recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, trace);
        return null;
    }
}

/**
 * 요청한 쿼리 실행하는 함수 For Metrics
 * 
 * @param {string} command
 * @param {object} parameters
 * @param {object} trace
 */

async function querySQLForMetrics(command, parameters) {
    try {
        const query = await new Promise((resolve, reject) => {
            connection.query(command, parameters, function (err, results) {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        return query;
    } catch (e) {
        await recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, null);
        return null;
    }
}

/**
 * 트랜잭션으로 다중 쿼리를 수행하는 함수
 * @param {object} commands
 * @param {object} parameters 
 * @param {object} trace 
 * @returns 
 */
async function querySQLTransaction(commands, parameters, trace) {
    let transactionStarted = false;
    try {
        if (!Array.isArray(commands) || !Array.isArray(parameters)) {
            throw new Error(notice.client.INVALID_TYPE_DATA);
        }
        if (commands.length !== parameters.length) {
            throw new Error('command 배열과 parameters 배열은 길이가 같아야 해요.');
        }

        const query_request_at = getNowTime();

        await new Promise((resolve, reject) => {
            connection.beginTransaction(function (err) {
                if (err) {
                    reject(err);
                } else {
                    transactionStarted = true;
                    resolve();
                }
            });
        });

        const results = [];

        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const params = Array.isArray(parameters[i]) ? parameters[i] : [];
            const res = await new Promise((resolve, reject) => {
                connection.query(cmd, params, function (err, queryResult) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(queryResult);
                    }
                });
            });
            results.push(res);
        }

        await new Promise((resolve, reject) => {
            connection.commit(function (err) {
                if (err) {
                    return connection.rollback(function () {
                        transactionStarted = false;
                        reject(err);
                    });
                }
                resolve();
            });
        });

        const query_response_at = getNowTime();

        trace.query_request_at = query_request_at;
        trace.query_response_at = query_response_at;

        const serialized = JSON.stringify(results);
        if (serialized.length > 30000) {
            await recordQueryLog(commands, parameters, 'SUCCESS', 'SERVICE MAX_BYTES_LOCK OVER 30000 Bytes', trace);
            return results;
        }

        await recordQueryLog(commands, parameters, 'SUCCESS', results, trace);
        return results;
    } catch (e) {
        if (transactionStarted) {
            try {
                await new Promise((resolve) => {
                    connection.rollback(function () {
                        resolve();
                    });
                });
            } catch (_) {}
        }

        await recordQueryLog(commands, parameters, 'FAIL', null, trace);
        await recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, trace);
        return null;
    }
}

/**
 * 요청한 쿼리 기록하는 함수
 * 
 * @param {string} command
 * @param {object} parameters
 * @param {string} status
 * @param {object} result
 * @param {object} trace
 */
async function recordQueryLog(command, parameters, status, result, trace) {
    try {
        const queryRedis = await queryRedisLogs.recordQueryLogRedis(command, parameters, status, result, trace);

        // 2025.05.09 (Redis로 일괄처리 전 코드임.)
        // const query = await new Promise((resolve, reject) => {
        //     connection.query(
        //         `INSERT INTO DB_QUERY_LOG (request_id, u_id, status, endpoint, session_id, query_text, query_response, parameters, request_at, response_at, execution_at) 
        //             VALUES (
        //             ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        //             );`,
        //         [trace.r_id, trace.u_id, status, trace.endpoint, trace.session_id, command, status === 'SUCCESS' ? JSON.stringify(result) : null, JSON.stringify(parameters), formatTimestamp(trace.query_request_at), formatTimestamp(trace.query_response_at), isNaN(trace.query_response_at - trace.query_request_at) ? null : trace.query_response_at - trace.query_request_at],
        //         function (err, results) {
        //             if (err) {
        //                 reject(err);
        //             } else {
        //                 resolve(results);
        //             }
        //         }
        //     );
        // });

        return queryRedis;
    } catch (e) {
        await recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, trace);
        return null;
    }
}

async function recordUserLog(request, trace) {
    try {
        await querySQL('UPDATE USERDB SET recentDate = NOW() WHERE uuid = ?', [trace.u_id], trace);
        const query = await new Promise((resolve, reject) => {
            connection.query(
                `INSERT INTO USER_LOG (request_id, u_id, status, endpoint, ip, session_id, activity, request_at, response_at, execution_at) 
                    VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    );`,
                [trace.r_id, trace.u_id, trace.status, trace.endpoint, trace.ip, trace.session_id, trace.activity, formatTimestamp(trace.request_at), formatTimestamp(trace.response_at), isNaN(trace.response_at - trace.request_at) ? null : trace.response_at - trace.request_at],
                function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
        return query;
    } catch (e) {
        await recordErrorLog(notice.QUERY.REQEUST_100.CODE, e.message, e.stack, trace);
        return null;
    }
}

/**
 * 발생한 에러 기록하는 함수
 * 
 * @param {string} error_code 
 * @param {string} error_message 
 * @param {string} error_stack 
 * @returns 
 */
async function recordErrorLog(error_code, error_message, error_stack, trace) {
    try {
        const query = await new Promise((resolve, reject) => {
            connection.query(
                `INSERT INTO ERROR_LOG (request_id, u_id, status, endpoint, session_id, error_code, error_message, error_stack, request_at, error_at, execution_at) 
                 VALUES (
                 ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                 );`,
                [trace.r_id, trace.u_id, 'FAIL', trace.endpoint, trace.session_id, error_code.CODE, error_message, error_stack, formatTimestamp(trace.request_at), formatTimestamp(getNowTime()), getNowTime() - trace.request_at],
                function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
        return;
    } catch (e) {
        return;
    }
}

async function getUUID() {
    try {
        const query = await new Promise((resolve, reject) => {
            connection.query(
                `SELECT UUID();`,
                [],
                function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
        return query[0]['UUID()'];
    } catch (e) {
        return null;
    }
}

function getNowTime() {
    return new Date().getTime();
}

function formatTimestamp(ms) {
    const date = new Date(ms);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
    querySQL,
    querySQLForMetrics,
    querySQLTransaction,
    recordQueryLog,
    recordUserLog,
    recordErrorLog,
    getUUID
};