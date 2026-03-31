'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await setTimetable(); await setMeal(); await setSchedule();
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
        const sc = document.getElementById('schedule_content');
        if (scheduleByDay[todayStr]) {
            const [, m, d] = todayStr.split('-');
            sc.innerHTML = `<span class="text-[14px] sm:text-[16px] text-gray-700 pretendard-500">${scheduleByDay[todayStr].join('<br>')}</span>`;
        } else {
            sc.innerHTML = `<span class="text-[14px] sm:text-[16px] text-gray-700 pretendard-500">등록된 학사일정이 없어요.</span>`;
        }
    } catch (error) {
        console.log(error);
    }
}

async function setTimetable() {
    try {
        const get_timetable = await fetchJSON('/api/getTimetable');
        if (!get_timetable.success) {
            //alert(get_timetable.message);
            return;
        }

        const data = get_timetable.data;
        const dayLetter = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' }[new Date().getDay()];
        for (let i = 0; i < 7; i++) {
            document.getElementById('t' + (i+1)).innerHTML = '공강';
        }        
        if (dayLetter) {
            data.filter(e => e.symbol.startsWith(dayLetter))
                .forEach(e => {
                    document.getElementById('t' + e.symbol.slice(1)).innerHTML = shortenSubjectName(e.subject.replace(/[A-Za-z].*$/, ''));
                });
        }
    } catch (error) {
        console.log(error);
    }
}

async function setMeal() {
    try {
        const get_current_week_range = getCurrentWeekRange();
        const startDate = get_current_week_range[0];
        const endDate = get_current_week_range[1];

        const escapeHTML = (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const allergyBadgeHTML = '<span class="w-fit px-3 py-1 text-[14px] sm:text-[16px] bg-yellow-100 rounded-full text-yellow-600 pretendard-700">알레르기</span>';

        let allergySet = null;
        try {
            const get_user_data = await fetchJSON('/api/getUserData');
            if (get_user_data && get_user_data.success) {
                const allergyStr =
                    (get_user_data.data && get_user_data.data[0] && get_user_data.data[0].allergy) ??
                    (get_user_data.data && get_user_data.data.allergy);
                if (typeof allergyStr === "string" && allergyStr.trim() !== "") {
                    allergySet = new Set(allergyStr.split(",").map(s => s.trim()).filter(Boolean));
                }
            }
        } catch (_) { }

        const get_meal = await fetchJSON(`/api/getMeal?startDate=${startDate}&endDate=${endDate}`);
        if (!get_meal.success) {
            return;
        }

        const data = get_meal.data;
        const now = new Date(), m = now.getHours() * 60 + now.getMinutes(), d = (now.getDay() + 6) % 7;
        let day = d;
        const meal = m < 470 ? 0 : m < 810 ? 1 : (d === 6 || m < 1140 ? 2 : (day = (d + 1) % 7, 0)),
              title = m < 470 ? '오늘의 조식' : m < 810 ? '오늘의 중식' : (d === 6 || m < 1140 ? '오늘의 석식' : '내일의 조식');

        const raw = (data[day][meal] || '정보없음');
        let s = '정보없음';
        let hasAllergyMatch = false;

        if (raw && raw.trim() !== '' && raw !== '정보없음') {
            const parts = raw.split('\n').map(v => v.trim()).filter(Boolean);

            const processed = parts.map(item => {
                const matched = new Set();
                if (allergySet) {
                    item.replace(/\(([^)]*)\)/g, (_, inner) => {
                        if (!inner) return _;
                        inner.split(/[.,]/).map(x => x.trim()).filter(Boolean).forEach(code => {
                            if (allergySet.has(code)) matched.add(code);
                        });
                        return _;
                    });
                }
                const display = item.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

                if (matched.size > 0) {
                    hasAllergyMatch = true;
                    const sorted = Array.from(matched).sort((a, b) => Number(a) - Number(b));
                    const names = sorted
                        .map(code => (typeof allergyCode === "object" && allergyCode ? allergyCode[code] : null))
                        .filter(Boolean);
                    const tip = names.length ? `${names.join(", ")} 포함` : `알레르기 포함`;
                    return `<span class="text-yellow-500 pretendard-700" title="${escapeHTML(tip)}" aria-label="${escapeHTML(tip)}">${escapeHTML(display)}</span>`;
                }
                return escapeHTML(display);
            });

            s = processed.reduce((r, v, i, a) =>
                i % 2 === 0 ? r + v + (i + 1 < a.length ? `, ${a[i + 1]}` : '') + '<br>' : r, ''
            );
        }

        const titleEl = document.getElementById('meal_title');
        titleEl.innerHTML = `<span>${title}</span>`;
        if (allergySet && hasAllergyMatch) {
            titleEl.innerHTML += ` ${allergyBadgeHTML}`;
        }

        document.getElementById('meal_content').innerHTML = s;
    } catch (error) {
        console.log(error);
    }
}

function shortenSubjectName(subject) {
    return subject
        .replace('언어와매체', '언매')
        .replace('화법과작문', '화작')
        .replace('확률과통계', '확통')
        .replace('고전읽기', '고읽')
        .replace('심화국어', '심국')
        .replace('미적분', '미적')
        .replace('심화수학', '심수')
        .replace('진로영어', '진영')
        .replace('영어독해와작문', '영독작')
        .replace('영어문화', '영문')
        .replace('물리학', '물리')
        .replace('생명과학', '생명')
        .replace('지구과학', '지구')
        .replace('융합물리', '융물')
        .replace('융합화학', '융화')
        .replace('융합생명', '융생')
        .replace('융합지구', '융지')
        .replace('한국지리', '한지')
        .replace('세계지리', '세지')
        .replace('정치와법', '정법')
        .replace('사회문화', '사문')
        .replace('생활과윤리', '생윤')
        .replace('윤리와사상', '윤사')
        .replace('사회문제탐구', '사문탐')
        .replace('고전과윤리', '고윤')
        .replace('지역이해', '지역')
        .replace('현대세계의변화', '현세변')
        .replace('교육학', '교육')
        .replace('심리학', '심리')
        .replace('일본어', '일어')
        .replace('일본문화', '일문')
        .replace('중국어', '중어')
        .replace('중국문화', '중문')
        .replace('인공지능기초', '인공기')
        .replace('인공피지컬', '인공피')
        .replace('빅데이터분석', '빅데분')
        .replace('프로그래밍', '프로')
        .replace('데이터과학과머신러닝', '데이터')
        .replace('정보과학', '정보과')
        .replace('운동과건강', '운동')
        .replace('문학과매체', '문학')
        .replace('심화수학', '심수')
        .replace('수학과제탐구', '수과탐')
        .replace('영어권문화', '영문')
        .replace('심화영어독해', '심영독')
        .replace('사회과제연구', '사과연')
        .replace('융합과학', '융과')
        .replace('심화영어', '심영')
}

function getCurrentWeekRange() {
    const now = new Date(), diff = now.getDay() ? now.getDay() - 1 : 6;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + 1);
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + 7);

    return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
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

const allergyCode = { "1": "난류", "2": "우유", "3": "메밀", "4": "땅콩", "5": "대두", "6": "밀", "7": "고등어", "8": "게", "9": "새우", "10": "돼지고기", "11": "복숭아", "12": "토마토", "13": "아황산염", "14": "호두", "15": "닭고기", "16": "소고기", "17": "오징어", "18": "조개류(굴, 전복, 홍합 포함)", "19": "잣" }