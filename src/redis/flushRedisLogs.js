'use strict';

const cron = require('node-cron');
const { createClient } = require('redis');
const mysql = require('mysql');
const { keys } = require('../config/keys.js');

const REDIS_BATCH = parseInt(process.env.REDIS_BATCH ?? '1000', 10);
const MYSQL_BATCH = parseInt(process.env.MYSQL_BATCH ?? '250', 10);

const redis = createClient({
  url: 'redis://svc.sel4.cloudtype.app:30415',
  disableOfflineQueue: true
});
redis.connect().catch(console.error);

const pool = mysql.createPool({
  host: keys.db.HOST,
  user: keys.db.USER,
  password: keys.db.PASSWORD,
  database: keys.db.DATABASE,
  port: keys.db.PORT,
  charset: 'utf8mb4',
  connectionLimit: 5,
  timezone: '+09:00'
});

const POP_N_LUA = `
  local n = tonumber(ARGV[1])
  local size = redis.call('LLEN', KEYS[1])
  if size == 0 then return {} end
  if n > size then n = size end
  local data = redis.call('LRANGE', KEYS[1], 0, n-1)
  redis.call('LTRIM', KEYS[1], n, -1)
  return data
`;

function query(conn, sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

function toValueArray(rows) {
  return rows.map(r => [
    r.request_id,
    r.u_id,
    r.status,
    r.endpoint,
    r.session_id,
    r.query_text,
    r.query_response ? JSON.stringify(r.query_response) : null,
    JSON.stringify(r.parameters),
    new Date(r.request_at),
    new Date(r.response_at),
    r.execution_at
  ]);
}

async function flushOnce() {
  let raw = [];
  try {
    raw = await redis.eval(POP_N_LUA, {
      keys: ['db_query_log'],
      arguments: [REDIS_BATCH.toString()]
    });

    if (!raw.length) return;

    const rows = raw.map(JSON.parse);

    const bad = rows.filter(entry => entry.request_id == null);
    if (bad.length) {
      console.error('flushOnce 오류: request_id가 null인 항목들 발견', bad);
    }

    const values = toValueArray(rows);

    await new Promise((resolve, reject) => {
      pool.getConnection(async (connErr, conn) => {
        if (connErr) return reject(connErr);
        try {
          for (let i = 0; i < values.length; i += MYSQL_BATCH) {
            const slice = values.slice(i, i + MYSQL_BATCH);
            await query(
              conn,
              `INSERT INTO DB_QUERY_LOG
               (request_id, u_id, status, endpoint, session_id,
                query_text, query_response, parameters,
                request_at, response_at, execution_at) VALUES ?`,
              [slice]
            );
          }
          conn.release();
          console.log(`[${new Date().toISOString()}] 로그 ${values.length}건이 MySQL로 플러시되었습니다.`);
          resolve();
        } catch (e) {
          conn.release();
          reject(e);
        }
      });
    });
  } catch (err) {
    if (raw.length) await redis.rPush('db_query_log', raw);
    console.error('flushOnce 오류', err);
    throw err;
  }
}

async function flush() {
  while (true) {
    const before = Date.now();
    await flushOnce();
    if (Date.now() - before < 50) break;
  }
}

if (process.env.NODE_ENV === 'production') {
  cron.schedule('*/10 * * * *', flush, { timezone: 'Asia/Seoul' });
}

module.exports = { flush };