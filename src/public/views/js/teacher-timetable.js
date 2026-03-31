'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await renderStudentList();
});

function extractSchoolNum(schoolNum) {
    const schoolNumStr = schoolNum.toString();
    return [parseInt(schoolNumStr[0], 10), parseInt(schoolNumStr[1], 10), parseInt(schoolNumStr.slice(2), 10)];
}

async function renderTimetable() {
    try {
        const schoolNum = document.getElementById('student-select').value;
        const get_timetable = await fetchJSON(`/teacher/getStudentTimetable?schoolNum=${schoolNum}`);
        if (!get_timetable.success) {
            alert(get_timetable.message);
            return;
        }
        
        const data = get_timetable.data;
        ["A","B","C","D","E"].forEach(r=>{for(let i=1;i<=7;i++){["subject","classCode","teacher"].forEach(p=>{const el=document.getElementById(p+r+i); el && (el.innerText = p==="subject"?"공강":"")})}})
        data.forEach(({ symbol, subject, teacher }) => {
            let [s, c = ''] = subject.split(/(?=[A-Za-z])/);
            document.getElementById(`subject${symbol}`).innerHTML = shortenSubjectName(s);
            document.getElementById(`classCode${symbol}`).innerHTML = c;
            document.getElementById(`teacher${symbol}`).innerHTML = teacher;
        });
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
        .replace('음악연주와창작', '음연창')
        .replace('주제탐구독서', '주탐독')
        .replace('독서와작문', '독작')
        .replace('과학과제연구', '과과연')
        .replace('현대사회와윤리', '현사윤')
        .replace('세계시민과지리', '세지');
}

async function renderStudentList() {
    try {
        const get_studentlist = await fetchJSON('/teacher/getStudentList');
        if (!get_studentlist.success) {
            alert(get_studentlist.message);
            return;
        }

        const data = get_studentlist.data;
        for (let i = 0; i < data.length; i++) {
            const schoolNum = data[i].schoolNum;
            const name = data[i].name;
            const [gradeNum, classNum, numberNum] = extractSchoolNum(schoolNum);
            document.getElementById('student-select').innerHTML += `
            <option value="${schoolNum}">${gradeNum}학년 ${classNum}반 ${name}</option>
            `
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