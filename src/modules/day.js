const dayjs = require('dayjs');

// 한글 요일 → 숫자 (0=일, 1=월, ...)
const weekMap = {
    '일': 0,
    '월': 1,
    '화': 2,
    '수': 3,
    '목': 4,
    '금': 5,
    '토': 6
};

/**
 * 기준 날짜가 속한 주의 특정 요일에 해당하는 날짜를 반환 (사용자 기준: 월~일)
 * @param {string} startDate - 기준 날짜 (YYYY-MM-DD)
 * @param {string} koreanDay - '월', '화' 등의 요일
 * @returns {string} YYYY-MM-DD 형식 날짜
 */
async function getDateFromWeekday(startDate, koreanDay) {
    const targetDow = weekMap[koreanDay];
    if (targetDow === undefined) {
        throw new Error(`잘못된 요일: ${koreanDay}`);
    }

    const startDay = dayjs(startDate);
    let date = startDay.day(targetDow);

    if (targetDow === 0 && startDay.day() !== 0) {
        date = date.add(7, 'day');
    }

    return date.format('YYYY-MM-DD');
}

module.exports = {
    getDateFromWeekday
}