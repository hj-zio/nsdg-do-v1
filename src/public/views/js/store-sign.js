'use strict';

document.addEventListener("DOMContentLoaded", async function () {
});

async function createStore() {
    const storeName = document.getElementById('input_name').value;
    if (storeName === '') {
        alert('매장명을 입력해주세요.');
        return;
    }

    const req = await fetchJSON(`/store/create-store?store_name=${storeName}`);
    if (!req.success) {
        alert(req.message);
        return;
    }

    alert(req.message);
    location.href = '/store/sign-code';
    return;
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