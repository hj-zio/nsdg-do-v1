'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await getInsData();
});

async function getInsData() {
    const insList = await fetchJSON(`/admin/querySQL?c=SELECT * FROM INSDB;&p=[]`);
    if (!insList.success) return alert(insList.message);

    createTable(insList.data);
}

async function registerInsSchedule() {
    const id = document.getElementById('ins-id').value;
    const endpoint = document.getElementById('ins-endpoint').value;
    const type = document.getElementById('ins-type').value;
    const status = document.getElementById('ins-status').value;
    const startDate = document.getElementById('ins-startDate').value;
    const endDate = document.getElementById('ins-endDate').value;
    const duration = diffStr(startDate, endDate);

    if (!endpoint || !type || !status || !startDate || !endDate) return alert('모든 필드가 입력되지 않았어요.');

    let method, idQuery;
    if (!id) {
        method = 'create';
        idQuery = '';
    } else {
        method = 'update';
        idQuery = `id=${id}`;
    }

    const updateInsSchedule = await fetch(`/admin/${method}InsSchedule?${idQuery}&endpoint=${endpoint}&type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&duration=${duration}`, {
        method: 'GET'
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error));

    if (!updateInsSchedule.success) {
        alert(updateInsSchedule.message);
        return;
    }

    alert(updateInsSchedule.message)
}

const diffStr = (s, e) => {
    const toDate = (val) =>
        typeof val === "string" ? new Date(val.replace(" ", "T")) : new Date(val);
    const d = Math.abs(toDate(s) - toDate(e));
    const days = Math.floor(d / 86400000);
    const hours = Math.floor((d % 86400000) / 3600000);
    const minutes = Math.floor((d % 3600000) / 60000);
    return `${days ? days + '일 ' : ''}${hours}시간 ${minutes}분`;
  };

function createTable(data) {
    try {
        if (!data.length) {
            document.getElementById('result').innerHTML = '<span class="text-[16px] text-gray-600 pretendard-600">해당하는 데이터가 없습니다.</span>';
            return;
        }
        const keys = Object.keys(data[0]);
        const headerHTML = `<div class="flex border-t border-gray-300 sticky top-0 z-10">` +
            keys.map(key =>
                `<div class="flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">
                    ${key}
                </div>`
            ).join('') +
            `</div>`;
        const rowsHTML = data.map((row, index) => {
            const borderClass = index === data.length - 1 ? 'border-y' : 'border-t';
            return `<div class="flex ${borderClass} border-gray-300">` +
                keys.map(key =>
                    `<div class="flex-1 px-4 py-3 bg-white text-[14px] text-gray-700 relative group overflow-hidden text-ellipsis whitespace-nowrap">
                        ${row[key]}
                        <div class="absolute left-0 top-full mt-1 hidden group-hover:block z-20 p-2 bg-white border border-gray-300 shadow-md whitespace-normal break-all">
                            ${row[key]}
                        </div>
                    </div>`
                ).join('') +
                `</div>`;
        }).join('');

        document.getElementById('result').innerHTML = headerHTML + rowsHTML;
        return true;
    } catch (e) {
        console.error(e);
        return false;
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