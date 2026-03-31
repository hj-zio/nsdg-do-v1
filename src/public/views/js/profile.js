'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await getUserData();
});

async function getUserData() {
    try {
        const get_user_data = await fetchJSON('/api/getUserData');
        if (!get_user_data.success) {
            alert('사용자 정보를 불러오던 중 오류가 발생했어요.');
            return;
        }

        const data = get_user_data.data;
        const school_detail = JSON.parse(data.schoolDetail);
        const badge = data.isMaster === 1 ? '관리자' : (data.isTeacher === 1 ? '교사': '학생');
        const numbers = data.isTeacher === 1 ? "선생님 모드로 전환되어 있어요." : school_detail.grade ? `${school_detail.grade}학년 ${school_detail.class}반 ${school_detail.number}번` : "학번을 등록해주세요.";
        const img_url = data.profileImage ? `/i?id=${data.profileImage}` : `/resources/profile.png`;

        const user_name = document.getElementById('user_name');
        const user_badge = document.getElementById('user_badge');
        const user_numbers = document.getElementById('user_numbers');
        const user_profile = document.getElementById('profile_img');

        user_name.innerHTML = data.name;
        user_badge.innerHTML = badge;
        user_numbers.innerHTML = numbers;
        user_profile.src = img_url;
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
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