'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await loadStudentList();
});

async function loadStudentList() {
    try {
        const data = await fetch('/api/getAllSelectData', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((data) => data)
            .catch((error) => console.error(error));

        const userDataResponse = data.data;
        userDataResponse.sort((a, b) => a.schoolNum.localeCompare(b.schoolNum));

        if (!data.success) {
            createToast('error', data.message);
            return;
        }

        let userInfo = '';

        for (let i = 0; i < userDataResponse.length; i++) {
            const { uuid, name, email, schoolNum, data, updated_at } = userDataResponse[i];

            userInfo += `
            <tr id="admin_user_${uuid}">
                <td class="d-none">${data}</td>
                <td class="align-middle">${name}</td>
                <td class="align-middle">${schoolNum}</td>
                <td class="align-middle">${email}</td>
                <td class="align-middle">${new Date(updated_at).toISOString().split('T')[0]}</td>
                <td>
                    <button class="button text-white is-small --f-midium --bg-blue" onclick="showModal('${String(uuid)}')">
                        <span>확인</span>
                    </button>
                </td>
            </tr>
            `;
        }

        document.getElementById('memberInfo').innerHTML = userInfo;
    } catch (e) {
        return;
    }
}

async function showModal(uuid) {
    try {
        const result = [];
        const userdata = getTDValuesById(`admin_user_${uuid}`);
        const data = JSON.parse(userdata[0]);
        for (let i = 0; i < semesterArray.length; i++) {
            let str = semesterArray[i].replace('SO', '2학년 1학기').replace('ST', '2학년 2학기').replace('SG', '2학년 (학년)').replace('TO', '3학년 1학기').replace('TT', '3학년 2학기').replace('TG', '3학년 (학년)');
            for (let x = 0; x < data[semesterArray[i]].length; x++) {
                str += ('<br>' + subject[data[semesterArray[i]][x]]);
            }
            result.push(str);
        }
        const message = result.join('<br><br>');

        document.getElementById('admin_modal').style.display = 'block';
        document.getElementById('admin_data').innerHTML = message;
        return;
    } catch (e) {
        return;
    }
}

function getTDValuesById(trId) {
    const trElement = document.getElementById(trId);
    const tdElements = trElement.getElementsByTagName("td");

    let tdValues = [];
    for (let i = 0; i < tdElements.length; i++) {
        tdValues.push(tdElements[i].innerText);
    }

    return tdValues;
}

function closeModal() {
    document.getElementById('admin_modal').style.display = 'none';
}
const semesterArray = ["SO", "ST", "TO", "TT", "SOY", "STY", "TOY", "TTY"]
const group = {
  국어: ["E1", "F1", "F2", "H1", "H2"],
  수학: ["E2", "F3", "F4", "G1", "H3"],
  영어: ["E3", "F5", "G2", "H4", "H5"],
  사회: ["E4", "E5", "E6", "E7", "E8", "F6", "F7", "F8", "F9", "G3", "G4", "G5", "G6", "I1", "I2"],
  과학: ["E9", "E10", "E11", "E12", "F10", "F11", "F12", "F13", "G7", "G8", "G9", "G10", "I3", "I4"],
  과학2: ["F10", "F11", "F12", "F13", "G7", "G8", "G9", "G10"],
  기술가정: ["E13", "F14", "F15", "G13", "I5"],
  제2외국어: ["E14", "E15", "F16", "F17", "G11", "G12", "I6", "I7"],
  교양: ["D1", "D2", "D3", "D4"],
  예술: ["A1", "A2", "A3", "B1", "B2", "C1", "C2"],
}

const subject = {
  A1: "음악",
  A2: "미술",
  A3: "삶과 종교",
  B1: "음악 연주와 창작",
  B2: "미술 창작",
  C1: "음악 감상과 비평",
  C2: "미술 감상과 비평",
  D1: "교육의 이해",
  D2: "인간과 철학",
  D3: "논술",
  D4: "인간과 심리",
  E1: "주제 탐구 독서",
  E2: "인공지능 수학",
  E3: "영어 발표와 토론",
  E4: "세계시민과 지리",
  E5: "세계사",
  E6: "사회와 문화",
  E7: "정치",
  E8: "현대사회와 윤리",
  E9: "물리학",
  E10: "화학",
  E11: "생명과학",
  E12: "지구과학",
  E13: "프로그래밍",
  E14: "일본어",
  E15: "중국어",
  F1: "매체 의사소통",
  F2: "독서 토론과 글쓰기",
  F3: "기하",
  F4: "수학과 문화",
  F5: "심화 영어",
  F6: "한국지리 탐구",
  F7: "동아시아 역사 기행",
  F8: "법과 사회",
  F9: "윤리와 사상",
  F10: "역학과 에너지",
  F11: "물질과 에너지",
  F12: "세포와 물질대사",
  F13: "지구시스템과학",
  F14: "정보과학",
  F15: "소프트웨어와 생활",
  F16: "일본어 회화",
  F17: "중국어 회화",
  G1: "미적분Ⅱ",
  G2: "심화 영어 독해와 작문",
  G3: "도시의 미래 탐구",
  G4: "역사로 탐구하는 현대 세계",
  G5: "경제",
  G6: "인문학과 윤리",
  G7: "전자기와 양자",
  G8: "화학 반응의 세계",
  G9: "생물의 유전",
  G10: "행성우주과학",
  G11: "일본 문화",
  G12: "중국 문화",
  G13: "데이터 과학",
  H1: "문학과 영상",
  H2: "언어생활 탐구",
  H3: "수학과제 탐구",
  H4: "세계 문화와 영어",
  H5: "미디어 영어",
  I1: "사회문제 탐구",
  I2: "윤리문제 탐구",
  I3: "융합과학 탐구",
  I4: "기후변화와 환경생태",
  I5: "인공지능 일반",
  I6: "심화 일본어",
  I7: "심화 중국어",
}