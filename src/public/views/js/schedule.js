'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await setSchedule();
});

async function setSchedule() {
    try {
        const get_user_data = await fetchJSON('/api/getUserData');
        if (!get_user_data.success) {
            alert(get_user_data.message);
            return;
        }

        const user_grade = JSON.parse(get_user_data.data.schoolDetail).grade;

        const get_schedule = await fetchJSON('/api/getSchedule');
        if (!get_schedule.success) {
            alert(get_schedule.message);
            return;
        }

        const data = get_schedule.data;

        if (!data.length) {
            document.getElementById('CONTENT_AREA').innerHTML = `<div class="w-full flex flex-col bg-white rounded-lg px-5 py-3">
                <span class="text-[16px] sm:text-[18px] text-gray-700 pretendard-500">등록된 학사일정이 없어요.</span>
            </div>`;
        } else {
            const scheduleByDay = {};
            data.forEach(({ title, start, end }) => {
                if (title.includes('자감') && user_grade) {
                    const g = parseInt(user_grade, 10);
                    if ([1, 2, 3].includes(g)) {
                        let seg = title.replace('자감:', '').split('|')[g - 1];
                        if (seg) {
                            seg = seg.trim();
                            title = seg.startsWith('자습감독:') ? seg : '자습감독: ' + seg;
                        } else {
                            return;
                        }
                    }
                }
                for (let d = new Date(start), endDate = new Date(end); d < endDate; d.setDate(d.getDate() + 1)) {
                    const localDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
                    const key = localDate.toISOString().slice(0, 10);
                    scheduleByDay[key] = (scheduleByDay[key] || []).concat(title);
                }
            });
            const today = new Date();
            const todayLocal = new Date(today.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
            const todayStr = todayLocal.toISOString().slice(0, 10);
            const scheduleHTML = Object.keys(scheduleByDay)
                .filter(day => day >= todayStr)
                .sort()
                .map(day => {
                    const [, m, d] = day.split('-');
                    return `<div class="w-full flex flex-col bg-white rounded-lg px-5 py-3">
                                <span class="text-[16px] sm:text-[18px] text-gray-800 pretendard-600">${parseInt(m)}월 ${parseInt(d)}일</span>
                                <span class="text-[16px] sm:text-[18px] text-gray-600 pretendard-400">${scheduleByDay[day].join('<br>')}</span>
                            </div>`;
                })
                .join('');
            document.getElementById('CONTENT_AREA').innerHTML = scheduleHTML || `<div class="w-full flex flex-col bg-white rounded-lg px-5 py-3">
                <span class="text-[16px] sm:text-[18px] text-gray-700 pretendard-500">등록된 학사일정이 없어요.</span>
            </div>`;
        }
    } catch (error) {
        console.log(error);
    }
}

async function fetchJSON(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}