'use strict';

let currentRating = null;
let currentMealData = null;

document.addEventListener("DOMContentLoaded", async function () {
    await initializeTabs(); 
    await getMeal();
    initializeRatingModal();
});

async function initializeTabs() {
    const tabs = document.querySelectorAll('#tabs button');
    const contents = document.querySelectorAll('#tab-content [data-content]');
    
    function activateTab(index) {
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.classList.add('bg-blue-600', 'text-white');
                tab.classList.remove('text-gray-400', 'hover:text-gray-500');
            } else {
                tab.classList.remove('bg-blue-600', 'text-white');
                tab.classList.add('text-gray-400', 'hover:text-gray-500');
            }
        });
        
        contents.forEach((content, i) => {
            if (i === index) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }
    
    let now = new Date();
    let day = now.getDay();
    if (now.getHours() > 19 && day !== 0) {
        day = day === 6 ? 0 : day + 1;
    }
    let defaultIndex = day === 0 ? 6 : day - 1;
    activateTab(defaultIndex);
    
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', function () {
            activateTab(i);
        });
    });
}

async function getMeal() {

    try {
        const get_current_week_range = getCurrentWeekRange();
        const startDate = get_current_week_range[0];
        const endDate = get_current_week_range[1];

        const get_user_data = await fetchJSON('/api/getUserData');
        if (!get_user_data.success) {
            alert(get_user_data.message);
            return;
        }

        const allergyStr = get_user_data.data.allergy;
        const allergySet = (typeof allergyStr === "string" && allergyStr.trim() !== "")
            ? new Set(allergyStr.split(",").map(s => s.trim()).filter(Boolean))
            : null;

        const get_meal = await fetchJSON(`/api/getMeal?startDate=${startDate}&endDate=${endDate}`);
        if (!get_meal.success) {
            alert(get_meal.message);
            return;
        }

        const data = get_meal.data;
        const dayLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const mealSuffix = ['m', 'l', 'd'];

        const formatMealInfo = info => {
            if (!info || !info.trim()) return { html: "정보없음", hasAllergy: false };
            const parts = info.split("\n").map(s => s.trim()).filter(Boolean);

            let mealHasAllergy = false;
            const processed = parts.map(item => {
                let matched = new Set();
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
                    mealHasAllergy = true;
                    const names = Array.from(matched)
                        .sort((a,b)=>Number(a)-Number(b))
                        .map(code => (typeof allergyCode === "object" && allergyCode ? allergyCode[code] : null))
                        .filter(Boolean);
                    const tip = names.length ? `${names.join(", ")} 포함` : `알레르기 포함`;
                    return `<span class="text-yellow-500 pretendard-700" title="${tip}" aria-label="${tip}">${display}</span>`;
                }
                return display;
            });

            let result = [];
            for (let i = 0; i < processed.length; i += 2) {
                result.push(i + 1 < processed.length ? `${processed[i]}, ${processed[i + 1]}` : processed[i]);
            }
            return { html: result.join("<br>"), hasAllergy: mealHasAllergy };
        };

        (data.length ? data : dayLetters).forEach((d, i) => {
            for (let j = 1; j <= 3; j++) {
                const el = document.getElementById(dayLetters[i] + j);
                if (!el) continue;

                const mealContent = data.length ? formatMealInfo(d[j - 1]) : "정보없음";
                el.innerHTML = mealContent;
                
                // 급식 메뉴 클릭 이벤트 추가 (정보없음이 아닌 경우에만)
                if (mealContent !== "정보없음") {
                    el.addEventListener('click', function() {
                        openRatingModal(el.dataset.day, el.dataset.meal, mealContent);
                    });
                }

                if (data.length) {
                    const { html, hasAllergy } = formatMealInfo(d[j - 1]);
                    el.innerHTML = html;

                    if (hasAllergy) {
                        const badge = document.getElementById(`${i}_${mealSuffix[j - 1]}`);
                        if (badge) badge.classList.remove('hidden');
                    }
                } else {
                    el.innerHTML = "정보없음";
                }
            }
        });

    } catch (error) {
        console.error(error);
    }
}

function initializeRatingModal() {
    const modal = document.getElementById('ratingModal');
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const cancelBtn = document.getElementById('cancelRating');
    const submitBtn = document.getElementById('submitRating');
    
    // 평가 버튼 클릭 이벤트
    ratingBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 이전 선택 해제
            ratingBtns.forEach(b => {
                b.classList.remove('border-blue-500', 'bg-blue-100');
                b.classList.add('border-gray-200');
            });
            
            // 현재 선택 활성화
            this.classList.remove('border-gray-200');
            this.classList.add('border-blue-500', 'bg-blue-100');
            
            currentRating = parseInt(this.dataset.rating);
            submitBtn.disabled = false;
        });
    });
    
    // 취소 버튼
    cancelBtn.addEventListener('click', closeRatingModal);
    
    // 제출 버튼
    submitBtn.addEventListener('click', submitRating);
    
    // 모달 배경 클릭시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeRatingModal();
        }
    });
}

function openRatingModal(day, meal, content) {
    const modal = document.getElementById('ratingModal');
    const modalMealInfo = document.getElementById('modalMealInfo');
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const submitBtn = document.getElementById('submitRating');
    
    // 모달 정보 설정
    modalMealInfo.textContent = `${day}요일 ${meal}`;
    currentMealData = { day, meal, content };
    
    // 선택 초기화
    ratingBtns.forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-100');
        btn.classList.add('border-gray-200');
    });
    
    currentRating = null;
    submitBtn.disabled = true;
    
    // 모달 표시
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    currentRating = null;
    currentMealData = null;
}

async function submitRating() {
    if (!currentRating || !currentMealData) return;
    
    const submitBtn = document.getElementById('submitRating');
    const originalText = submitBtn.textContent;
    
    try {
        // 로딩 상태
        submitBtn.textContent = '제출 중...';
        submitBtn.disabled = true;
        
        // API 호출 (실제 API 엔드포인트로 변경 필요)
        const response = await fetchJSON('/api/submitMealRating', {
            method: 'POST',
            body: JSON.stringify({
                day: currentMealData.day,
                meal: currentMealData.meal,
                content: currentMealData.content,
                rating: currentRating,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.success) {
            // 성공 메시지
            alert('평가가 성공적으로 제출되었습니다!');
            closeRatingModal();
        } else {
            alert('평가 제출에 실패했습니다: ' + response.message);
        }
    } catch (error) {
        console.error('Rating submission error:', error);
        alert('평가 제출 중 오류가 발생했습니다.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function getCurrentWeekRange() {
    const now = new Date(), diff = now.getDay() ? now.getDay() - 1 : 6;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + 1);
    const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff + 7);
    return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
}

async function fetchJSON(url, options = {}) {
    try {
        const defaultOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        return await response.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}