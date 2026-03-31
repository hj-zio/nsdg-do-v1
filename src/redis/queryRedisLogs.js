const { createClient } = require("redis");
const redisCon = createClient({ url: "redis://svc.sel4.cloudtype.app:30415", socket: { connectTimeout: 5_000 } });

(async () => { try { await redisCon.connect(); } catch (e) { console.error("Redis connect error", e); } })();

async function recordQueryLogRedis(command, parameters, status, result, trace) {
  const entry = {
    request_id: trace.r_id,
    u_id: trace.u_id,
    ip: trace.ip,
    status,
    endpoint: trace.endpoint,
    session_id: trace.session_id,
    query_text: command,
    query_response: status === "SUCCESS" ? result : null,
    parameters,
    request_at: trace.query_request_at,
    response_at: trace.query_response_at,
    execution_at: isNaN(trace.query_response_at - trace.query_request_at) ? null : trace.query_response_at - trace.query_request_at,
  };
  await redisCon.lPush("db_query_log", JSON.stringify(entry));
}

module.exports = { recordQueryLogRedis };