'use strict';

const data = [
    { "field_id": "econ", "candidate_id": "lee_jm", "item_id": "econ_lee_jm_1", "content": "개인 채무 탕감" },
    { "field_id": "econ", "candidate_id": "lee_jm", "item_id": "econ_lee_jm_2", "content": "AI 민간투자 유치" },
    { "field_id": "econ", "candidate_id": "lee_jm", "item_id": "econ_lee_jm_3", "content": "주식 원스트라이크 아웃제" },
    { "field_id": "econ", "candidate_id": "kim_ms", "item_id": "econ_kim_ms_1", "content": "법인세 및 상속세 완화" },
    { "field_id": "econ", "candidate_id": "kim_ms", "item_id": "econ_kim_ms_2", "content": "GTX 전국 확대" },
    { "field_id": "econ", "candidate_id": "kim_ms", "item_id": "econ_kim_ms_3", "content": "전통시장 활성화" },
    { "field_id": "econ", "candidate_id": "lee_js", "item_id": "econ_lee_js_1", "content": "리쇼어링 정책" },
    { "field_id": "econ", "candidate_id": "lee_js", "item_id": "econ_lee_js_2", "content": "지방별 세금·임금 자율권 확대" },
    { "field_id": "econ", "candidate_id": "kwon_yg", "item_id": "econ_kwon_yg_1", "content": "고소득층 증세" },
    { "field_id": "econ", "candidate_id": "kwon_yg", "item_id": "econ_kwon_yg_2", "content": "부유세 도입" },
    { "field_id": "econ", "candidate_id": "kwon_yg", "item_id": "econ_kwon_yg_3", "content": "금융소득세 강화" },
    { "field_id": "soc", "candidate_id": "lee_jm", "item_id": "soc_lee_jm_1", "content": "주 4.5일제 근무" },
    { "field_id": "soc", "candidate_id": "lee_jm", "item_id": "soc_lee_jm_2", "content": "돌봄 국가 책임제" },
    { "field_id": "soc", "candidate_id": "lee_jm", "item_id": "soc_lee_jm_3", "content": "장애인 이동권 보장" },
    { "field_id": "soc", "candidate_id": "lee_jm", "item_id": "soc_lee_jm_4", "content": "상병수당" },
    { "field_id": "soc", "candidate_id": "kim_ms", "item_id": "soc_kim_ms_1", "content": "중대재해처벌법 완화" },
    { "field_id": "soc", "candidate_id": "kim_ms", "item_id": "soc_kim_ms_2", "content": "주 52시간제 유연화" },
    { "field_id": "soc", "candidate_id": "lee_js", "item_id": "soc_lee_js_1", "content": "법인세·최저임금 지방 자율화" },
    { "field_id": "soc", "candidate_id": "lee_js", "item_id": "soc_lee_js_2", "content": "신·구 연금 체계 분리" },
    { "field_id": "soc", "candidate_id": "kwon_yg", "item_id": "soc_kwon_yg_1", "content": "부유세 및 상속세 강화" },
    { "field_id": "soc", "candidate_id": "kwon_yg", "item_id": "soc_kwon_yg_2", "content": "공공은행 설립" },
    { "field_id": "soc", "candidate_id": "kwon_yg", "item_id": "soc_kwon_yg_3", "content": "플랫폼 규제 강화" },
    { "field_id": "edu", "candidate_id": "lee_jm", "item_id": "edu_lee_jm_1", "content": "유치원과 어린이집 통합(유보통합)" },
    { "field_id": "edu", "candidate_id": "lee_jm", "item_id": "edu_lee_jm_2", "content": "공교육 국가책임정책" },
    { "field_id": "edu", "candidate_id": "lee_jm", "item_id": "edu_lee_jm_3", "content": "교권 보호 강화" },
    { "field_id": "edu", "candidate_id": "lee_jm", "item_id": "edu_lee_jm_4", "content": "전문교사 개별 지도" },
    { "field_id": "edu", "candidate_id": "kim_ms", "item_id": "edu_kim_ms_1", "content": "만 3~5세 유아 무상교육" },
    { "field_id": "edu", "candidate_id": "kim_ms", "item_id": "edu_kim_ms_2", "content": "교육감 직선제 폐지" },
    { "field_id": "edu", "candidate_id": "kim_ms", "item_id": "edu_kim_ms_3", "content": "지방대학 활성화" },
    { "field_id": "edu", "candidate_id": "kim_ms", "item_id": "edu_kim_ms_4", "content": "MOOC·평생교육 지원" },
    { "field_id": "edu", "candidate_id": "lee_js", "item_id": "edu_lee_js_1", "content": "교사 소송 국가책임제 도입" },
    { "field_id": "edu", "candidate_id": "lee_js", "item_id": "edu_lee_js_2", "content": "교사용 ‘마음 돌봄 휴가’ 도입" },
    { "field_id": "edu", "candidate_id": "lee_js", "item_id": "edu_lee_js_3", "content": "디텐션 제도 도입" },
    { "field_id": "edu", "candidate_id": "lee_js", "item_id": "edu_lee_js_4", "content": "전국 수학성취도 평가 의무화" },
    { "field_id": "edu", "candidate_id": "kwon_yg", "item_id": "edu_kwon_yg_1", "content": "선행교육 규제 헌법 조항 도입" },
    { "field_id": "edu", "candidate_id": "kwon_yg", "item_id": "edu_kwon_yg_2", "content": "지방대 무상교육" },
    { "field_id": "edu", "candidate_id": "kwon_yg", "item_id": "edu_kwon_yg_3", "content": "저비용 방송대 로스쿨 설치" },
    { "field_id": "edu", "candidate_id": "kwon_yg", "item_id": "edu_kwon_yg_4", "content": "사교육 규제 강화 추진" },
    { "field_id": "health", "candidate_id": "lee_jm", "item_id": "health_lee_jm_1", "content": "국민참여형 의료개혁" },
    { "field_id": "health", "candidate_id": "lee_jm", "item_id": "health_lee_jm_2", "content": "지역 공공의료 강화" },
    { "field_id": "health", "candidate_id": "lee_jm", "item_id": "health_lee_jm_3", "content": "지역 의사제 도입" },
    { "field_id": "health", "candidate_id": "kim_ms", "item_id": "health_kim_ms_1", "content": "치매국가책임제" },
    { "field_id": "health", "candidate_id": "kim_ms", "item_id": "health_kim_ms_2", "content": "간병비 건강보험 적용" },
    { "field_id": "health", "candidate_id": "lee_js", "item_id": "health_lee_js_1", "content": "지역별 의료 수가 차등화" },
    { "field_id": "health", "candidate_id": "lee_js", "item_id": "health_lee_js_2", "content": "원격의료 확대" },
    { "field_id": "health", "candidate_id": "lee_js", "item_id": "health_lee_js_3", "content": "의학대학 교육비용 국가책임제" },
    { "field_id": "health", "candidate_id": "kwon_yg", "item_id": "health_kwon_yg_1", "content": "병원비 연간 100만원 상한제" },
    { "field_id": "health", "candidate_id": "kwon_yg", "item_id": "health_kwon_yg_2", "content": "무상의료 시행" },
    { "field_id": "tech", "candidate_id": "lee_jm", "item_id": "tech_lee_jm_1", "content": "고성능 그래픽카드 확보" },
    { "field_id": "tech", "candidate_id": "lee_jm", "item_id": "tech_lee_jm_2", "content": "병역특례 통한 AI 인재 확보" },
    { "field_id": "tech", "candidate_id": "lee_jm", "item_id": "tech_lee_jm_3", "content": "AI 단과대학 신설" },
    { "field_id": "tech", "candidate_id": "kim_ms", "item_id": "tech_kim_ms_1", "content": "AI 전력 인프라 확보" },
    { "field_id": "tech", "candidate_id": "kim_ms", "item_id": "tech_kim_ms_2", "content": "과학기술부 신설" },
    { "field_id": "tech", "candidate_id": "kim_ms", "item_id": "tech_kim_ms_3", "content": "달 및 화성 탐사 추진" },
    { "field_id": "tech", "candidate_id": "lee_js", "item_id": "tech_lee_js_1", "content": "연구자 연금제도" },
    { "field_id": "tech", "candidate_id": "lee_js", "item_id": "tech_lee_js_2", "content": "과학기술 패스트트랙 제도" },
    { "field_id": "tech", "candidate_id": "lee_js", "item_id": "tech_lee_js_3", "content": "국가과학영웅 우대" },
    { "field_id": "tech", "candidate_id": "kwon_yg", "item_id": "tech_kwon_yg_1", "content": "데이터센터 재생에너지 의무 사용" },
    { "field_id": "tech", "candidate_id": "kwon_yg", "item_id": "tech_kwon_yg_2", "content": "AI 규제 기본법 개정" },
    { "field_id": "tech", "candidate_id": "kwon_yg", "item_id": "tech_kwon_yg_3", "content": "AI로 인한 창작자 피해 보상 제도" },
    { "field_id": "def", "candidate_id": "lee_jm", "item_id": "def_lee_jm_1", "content": "미중러 다자외교" },
    { "field_id": "def", "candidate_id": "lee_jm", "item_id": "def_lee_jm_2", "content": "전시작전통제권 환수" },
    { "field_id": "def", "candidate_id": "lee_jm", "item_id": "def_lee_jm_3", "content": "9·19 군사합의 복원" },
    { "field_id": "def", "candidate_id": "lee_jm", "item_id": "def_lee_jm_4", "content": "선택적 모병제" },
    { "field_id": "def", "candidate_id": "kim_ms", "item_id": "def_kim_ms_1", "content": "3축 체계 강화" },
    { "field_id": "def", "candidate_id": "kim_ms", "item_id": "def_kim_ms_2", "content": "핵잠수함 건조" },
    { "field_id": "def", "candidate_id": "kim_ms", "item_id": "def_kim_ms_3", "content": "미 전략자산 한반도 상시배치" },
    { "field_id": "def", "candidate_id": "kim_ms", "item_id": "def_kim_ms_4", "content": "화이트해커 양성" },
    { "field_id": "def", "candidate_id": "lee_js", "item_id": "def_lee_js_1", "content": "외교·통일 업무 일원화" },
    { "field_id": "def", "candidate_id": "lee_js", "item_id": "def_lee_js_2", "content": "안보부총리 신설" },
    { "field_id": "def", "candidate_id": "lee_js", "item_id": "def_lee_js_3", "content": "간첩 범위 확대" },
    { "field_id": "def", "candidate_id": "kwon_yg", "item_id": "def_kwon_yg_1", "content": "종전선언 및 평화협정 체결" },
    { "field_id": "def", "candidate_id": "kwon_yg", "item_id": "def_kwon_yg_2", "content": "주한미군 감축" },
    { "field_id": "def", "candidate_id": "kwon_yg", "item_id": "def_kwon_yg_3", "content": "평화안보법 제정" },
    { "field_id": "law", "candidate_id": "lee_jm", "item_id": "law_lee_jm_1", "content": "계엄권 통제" },
    { "field_id": "law", "candidate_id": "lee_jm", "item_id": "law_lee_jm_2", "content": "검찰·감사원 개혁" },
    { "field_id": "law", "candidate_id": "lee_jm", "item_id": "law_lee_jm_3", "content": "국회의원 국민소환제" },
    { "field_id": "law", "candidate_id": "lee_jm", "item_id": "law_lee_jm_4", "content": "국방문민화" },
    { "field_id": "law", "candidate_id": "lee_jm", "item_id": "law_lee_jm_5", "content": "온라인재판 도입" },
    { "field_id": "law", "candidate_id": "kim_ms", "item_id": "law_kim_ms_1", "content": "공수처 폐지" },
    { "field_id": "law", "candidate_id": "kim_ms", "item_id": "law_kim_ms_2", "content": "선거관리위원회 개혁" },
    { "field_id": "law", "candidate_id": "kim_ms", "item_id": "law_kim_ms_3", "content": "국회의원 불체포 특권 폐지" },
    { "field_id": "law", "candidate_id": "lee_js", "item_id": "law_lee_js_1", "content": "지방자치권 강화" },
    { "field_id": "law", "candidate_id": "lee_js", "item_id": "law_lee_js_2", "content": "3부총리 체제 도입" },
    { "field_id": "law", "candidate_id": "lee_js", "item_id": "law_lee_js_3", "content": "여가부 폐지" },
    { "field_id": "law", "candidate_id": "kwon_yg", "item_id": "law_kwon_yg_1", "content": "군사법원 폐지 및 군인권 강화" },
    { "field_id": "law", "candidate_id": "kwon_yg", "item_id": "law_kwon_yg_2", "content": "여성가족부 조직 격상" },
    { "field_id": "law", "candidate_id": "kwon_yg", "item_id": "law_kwon_yg_3", "content": "양성평등 채용 목표제 확대" },
    { "field_id": "law", "candidate_id": "kwon_yg", "item_id": "law_kwon_yg_4", "content": "차별금지법" },
    { "field_id": "law", "candidate_id": "kwon_yg", "item_id": "law_kwon_yg_5", "content": "공공기관의 청년 의무 고용 비율 확대" }
];

let questions = [];
let currentIdx = 0;
const picks = [];
var ageGroup = null;
var supportCandidate = null;
var supportLabel = null;
var startTime = null;

const imgMap = { lee_jm: 'ljm.png', kim_ms: 'kms.png', lee_js: 'ljs.png', kwon_yg: 'guk.png' };
const nameMap = { lee_jm: '이재명', kim_ms: '김문수', lee_js: '이준석', kwon_yg: '권영국' };

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

function getRandomOptions(field, usedSet) {
    const pool = shuffle(data.filter(d => d.field_id === field));
    const seen = new Set();
    const opts = [];
    for (const item of pool) {
        if (usedSet.has(item.item_id) || seen.has(item.candidate_id)) continue;
        usedSet.add(item.item_id);
        seen.add(item.candidate_id);
        opts.push(item);
        if (opts.length === 4) break;
    }
    return opts;
}

function generateQuestions() {
    const fields = ['econ', 'soc', 'edu', 'health', 'tech', 'def', 'law'];
    const seq = shuffle(fields.flatMap(f => [f, f]));
    const used = {};
    seq.forEach(f => {
        used[f] ??= new Set();
        questions.push({ field: f, options: getRandomOptions(f, used[f]) });
    });
}

function optionSpan(text, handler) {
    const s = document.createElement('span');
    s.className =
        'flex w-[350px] h-[50px] justify-center items-center text-[18px] sm:text-[20px] text-gray-600 pretendard-500 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 active:scale-95 transition-all ease-in-out duration-100';
    s.textContent = text;
    s.onclick = handler;
    return s;
}

function humanField(id) {
    const m = {
        econ: '경제',
        soc: '사회',
        edu: '교육',
        health: '보건',
        tech: '과학·기술',
        def: '외교·안보',
        law: '법·제도'
    };
    return m[id] || id;
}

function setTitle(t) {
    document.getElementById('title').textContent = t;
}
function setSubtitle(t = '') {
    document.getElementById('subtitle').textContent = t;
}
function clearSubtitle() {
    setSubtitle('');
}
function setOptions(arr, cb) {
    const box = document.getElementById('contentBox');
    box.innerHTML = '';
    arr.forEach(item => {
        const [label, val] = Array.isArray(item) ? item : [item, item];
        box.appendChild(optionSpan(label, () => cb(item)));
    });
}

async function renderAge() {
    setTitle('연령대를 선택해주세요.');
    clearSubtitle();
    setOptions(['10~20대', '30~40대', '50~60대', '60대 이상'], async label => await handleAge(label));
}

async function renderSupport() {
    setTitle('평소 지지하던 후보는 누구입니까?');
    clearSubtitle();
    setOptions(
        [
            ['이재명', 'lee_jm'],
            ['김문수', 'kim_ms'],
            ['이준석', 'lee_js'],
            ['권영국', 'kwon_yg']
        ],
        async ([label, id]) => await handleSupport(id, label)
    );
}

async function renderPolicy() {
    const q = questions[currentIdx];
    setTitle(`『${humanField(q.field)}』 부문에서 가장 필요한 정책은 무엇입니까?`);
    setSubtitle(`${currentIdx + 1}/${questions.length}`);
    const box = document.getElementById('contentBox');
    box.innerHTML = '';
    q.options.forEach(opt => box.appendChild(optionSpan(opt.content, async () => await handlePolicy(opt))));
}

async function handleAge(label) {
    ageGroup = label;
    await renderSupport();
}

async function handleSupport(id, label) {
    supportCandidate = id;
    supportLabel = label;
    picks.push({ type: 'initial', candidate_id: id });
    generateQuestions();
    await renderPolicy();
}

async function handlePolicy(opt) {
    picks.push({
        type: 'policy',
        candidate_id: opt.candidate_id,
        item_id: opt.item_id,
        field_id: opt.field_id
    });
    currentIdx++;
    currentIdx < questions.length ? await renderPolicy() : await showResult();
}

async function showResult() {
    const counts = picks.reduce((acc, sel) => {
        const id = sel.candidate_id;
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});
    const duration = Date.now() - startTime;
    picks.push({ type: 'summary', counts, duration_ms: duration });

    const [topId, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    const topName = nameMap[topId] || topId || '';

    setTitle('당신이 가장 선호한 후보는?');
    setSubtitle(topId === supportCandidate ? '평소 본인 생각과 똑같아요.' : '평소 본인 생각과 달라요.');

    const box = document.getElementById('contentBox');
    box.innerHTML = '';

    if (topId) {
        const img = document.createElement('img');
        img.src = `/resources/${imgMap[topId] || 'placeholder.png'}`;
        img.alt = topName;
        img.style.width = '200px';
        img.style.height = 'auto';
        img.className = 'mx-auto mb-4 rounded-lg object-contain';
        box.appendChild(img);

        const caption = document.createElement('div');
        caption.className = 'text-[18px] sm:text-[20px] text-gray-500 pretendard-500 text-center';
        caption.innerHTML =
            topId === supportCandidate
                ? `${topName} 후보를 가장 많이 골랐어요. (${topCount}회)`
                : `처음에 골랐던 후보는 <strong class="text-gray-600">${supportLabel}</strong> 후보인데,<br><strong class="text-gray-600">${topName}</strong> 후보를 가장 많이 골랐어요. (${topCount}회)`;
        box.appendChild(caption);
    }

    const submitSurvey = await fetch("/api/submitSurvey", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            data: picks,
        }),
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error))

   

    setTimeout(() => {
        document.getElementById('subtitle').innerHTML = '응답이 완료되었어요.';
        document.getElementById('contentBox').innerHTML = '';
        setTimeout(() => {
        window.location.href = '/';
        }, 3000);
    }, 5000);
}

async function init() {
    startTime = Date.now();
    await renderAge();
}