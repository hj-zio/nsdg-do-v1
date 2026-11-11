'use strict';

const axios = require('axios');
const { keys } = require('../config/keys.js');

const NEIS_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const MEAL_INDEX = { '1': 0, '2': 1, '3': 2 };
const cache = new Map();
const CACHE_MS = 60 * 60 * 1000;

function toYMD(date) {
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(/-/g, '');
}

async function getWeeklyMeal(startDate) {
    const hit = cache.get(startDate);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

    const start = new Date(`${startDate}T00:00:00+09:00`);
    const days = [...Array(7)].map((_, i) => toYMD(new Date(start.getTime() + i * 86400000)));

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
            MLSV_TO_YMD: days[6],
        },
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

    cache.set(startDate, { at: Date.now(), data: result });
    return result;
}

module.exports = { getWeeklyMeal };
