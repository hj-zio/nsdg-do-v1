'use strict';

const axios = require('axios');
const db = require('../config/db.js');
const { keys } = require('../config/keys.js');
const { notice } = require('../config/notice.js');

const NEIS_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const MEAL_INDEX = { '1': 0, '2': 1, '3': 2 };
const DAY_MS = 24 * 60 * 60 * 1000;
const KST_MS = 9 * 60 * 60 * 1000;

function toDateString(date) {
    return new Date(date.getTime() + KST_MS).toISOString().slice(0, 10);
}

function getWeekRange(weekOffset) {
    const today = new Date(`${toDateString(new Date())}T00:00:00+09:00`);
    const weekday = (new Date(today.getTime() + KST_MS).getUTCDay() + 6) % 7;
    const monday = new Date(today.getTime() + (weekOffset * 7 - weekday) * DAY_MS);
    const sunday = new Date(monday.getTime() + 6 * DAY_MS);
    return [toDateString(monday), toDateString(sunday)];
}

function hasMeal(data) {
    return Array.isArray(data) && data.some(day => Array.isArray(day) && day.some(Boolean));
}

function isFilledRow(row) {
    try {
        return hasMeal(JSON.parse(row.data));
    } catch (e) {
        return true;
    }
}

async function fetchWeeklyMeal(startDate, endDate) {
    const start = new Date(`${startDate}T00:00:00+09:00`);
    const days = [...Array(7)].map((_, i) => toDateString(new Date(start.getTime() + i * DAY_MS)).replace(/-/g, ''));

    const { data } = await axios.get(NEIS_URL, {
        timeout: 5000,
        params: {
            KEY: keys.api.MEAL_API_KEY,
            Type: 'json',
            pIndex: 1,
            pSize: 100,
            ATPT_OFCDC_SC_CODE: keys.school.OFFICE_ID,
            SD_SCHUL_CODE: keys.school.ID,
            MLSV_FROM_YMD: days[0],
            MLSV_TO_YMD: endDate.replace(/-/g, '')
        }
    });

    if (data.RESULT && data.RESULT.CODE !== 'INFO-200') {
        throw new Error(`NEIS 오류: ${data.RESULT.CODE} ${data.RESULT.MESSAGE}`);
    }

    const result = days.map(() => [null, null, null]);
    const rows = data.mealServiceDietInfo?.[1]?.row ?? [];

    for (const row of rows) {
        const d = days.indexOf(row.MLSV_YMD);
        const m = MEAL_INDEX[row.MMEAL_SC_CODE];
        if (d < 0 || m === undefined) continue;

        result[d][m] = row.DDISH_NM
            .split(/<br\s*\/?>/i)
            .map(s => s.trim().replace(/\(([\d.\s]+)\)/g, (_, c) => `(${c.replace(/\./g, ',').replace(/\s/g, '')})`))
            .filter(Boolean)
            .join('\n');
    }

    return result;
}

async function syncWeek(startDate, endDate, isCurrentWeek, trace) {
    const saved = await db.querySQL('SELECT data FROM MEALDB WHERE startDate = ? AND endDate = ?', [startDate, endDate], trace);
    if (!saved) {
        throw new Error('MEALDB 조회 실패');
    }

    if (saved.some(isFilledRow)) {
        return '이미 있음';
    }

    const meal = await fetchWeeklyMeal(startDate, endDate);

    if (saved.length) {
        if (!hasMeal(meal)) {
            return '나이스에 아직 없음';
        }
        const update = await db.querySQL('UPDATE MEALDB SET data = ? WHERE startDate = ? AND endDate = ?', [JSON.stringify(meal), startDate, endDate], trace);
        if (!update) {
            throw new Error('MEALDB 수정 실패');
        }
        return '빈 데이터 채움';
    }

    if (!hasMeal(meal) && !isCurrentWeek) {
        return '나이스에 아직 없음';
    }

    const insert = await db.querySQL('INSERT INTO MEALDB (data, startDate, endDate) VALUES (?, ?, ?);', [JSON.stringify(meal), startDate, endDate], trace);
    if (!insert) {
        throw new Error('MEALDB 저장 실패');
    }
    return hasMeal(meal) ? '저장' : '빈 주 저장';
}

async function syncMeal() {
    const trace = {
        r_id: await db.getUUID(),
        u_id: 'system',
        g_id: 'system',
        ip: null,
        session_id: null,
        endpoint: 'CRON /meal-sync',
        activity: '급식 자동 등록',
        request_at: Date.now()
    };

    const results = [];
    for (const weekOffset of [0, 1]) {
        const [startDate, endDate] = getWeekRange(weekOffset);
        try {
            const status = await syncWeek(startDate, endDate, weekOffset === 0, trace);
            results.push(`${startDate}~${endDate} ${status}`);
        } catch (e) {
            await db.recordErrorLog(notice.MEAL.GET_100, e.message, e.stack, trace);
            results.push(`${startDate}~${endDate} 실패`);
        }
    }

    console.log(`[급식 자동 등록] ${results.join(' | ')}`);
    return results;
}

module.exports = { syncMeal };
