'use strict';

document.addEventListener("DOMContentLoaded", async function () {});

async function setSchoolNum() {
    try {
        const gradeNum = document.getElementById('select-grade').value;
        const classNum = document.getElementById('select-class').value;
        const numberNum = document.getElementById('select-number').value;

        if (!gradeNum || !classNum || !numberNum) {
            alert('선택되지 않은 영역이 있어요.');
            return;
        }

        const set_school_number = await fetchJSON(`/api/setSchoolNum?gradeNum=${gradeNum}&classNum=${classNum}&numberNum=${numberNum}`);
        alert(set_school_number.message);
        if (set_school_number.success) {
            location.href = '/';
        }
        return;
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