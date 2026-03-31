'use strict';

document.addEventListener("DOMContentLoaded", async function () { });

async function searchDB() {
    const database = document.getElementById('db-select').value.trim();
    const table = document.getElementById('db-table').value.trim();
    const where1_column = document.getElementById('where1-column').value.trim();
    const where1_operand = document.getElementById('where1-operand').value.trim();
    const where1_value = document.getElementById('where1-value').value.trim();
    const where2_column = document.getElementById('where2-column').value.trim();
    const where2_operand = document.getElementById('where2-operand').value.trim();
    const where2_value = document.getElementById('where2-value').value.trim();
    const manualQuery = document.getElementById('query-input').value.trim();
    const limit = document.getElementById('limit-input').value.trim();

    // Manual Query 우선 처리
    if (manualQuery) {
        const query = await fetchJSON(`/admin/querySQL?c=${manualQuery};&p=[]`);
        if (!query.success) return alert(query.message);
        if (!createTable(query.data)) {
            document.getElementById('result').innerHTML = `<div class="text-[14px] text-gray-600 pretendard-600">${JSON.stringify(query.data)}</div>`;
        }
        return;
    }

    // DB와 테이블은 필수
    if (!database || !table) return alert('DB와 테이블은 필수항목입니다.');

    // 조건 배열에 유효한 값이 있을 때만 조건 문자열 생성
    const conditions = [
        where1_column && where1_operand && where1_value && `${where1_column}${where1_operand}${where1_value}`,
        where2_column && where2_operand && where2_value && `${where2_column}${where2_operand}${where2_value}`
    ].filter(Boolean);
    const finalQuery = `SELECT * FROM ${table}` +
        (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '') +
        (limit ? ` LIMIT ${limit}` : '');

    const query = await fetchJSON(`/admin/querySQL?c=${finalQuery};&p=[]`);
    if (!query.success) return alert(query.message);
    createTable(query.data);
}

async function getTableList() {
    const db = document.getElementById('db-select').value.trim();
    if (!db) return alert('DB를 먼저 선택해주세요.');

    const tableList = await fetchJSON(`/admin/querySQL?c=SHOW TABLES FROM ${db};&p=[]`);
    if (!tableList.success) return alert(tableList.message);

    const tables = tableList.data.map(item => item.Tables_in_DB);
    const tableElement = document.getElementById('db-table');
    if (!tables.every(tbl => tableElement.outerHTML.includes(`value="${tbl}"`))) {
        tableElement.innerHTML = tables.map(tbl => `<option value="${tbl}">${tbl}</option>`).join('');
    }
}

async function getColumnList() {
    const db = document.getElementById('db-select').value.trim();
    const table = document.getElementById('db-table').value.trim();
    if (!db || !table) return alert('DB와 테이블을 먼저 선택해주세요.');

    const columnList = await fetchJSON(`/admin/querySQL?c=SHOW COLUMNS FROM ${table};&p=[]`);
    if (!columnList.success) return alert(columnList.message);

    const columns = columnList.data.map(item => item.Field);
    const columnElement = document.getElementById('where1-column');
    const column2Element = document.getElementById('where2-column');
    if (!columns.every(col => columnElement.outerHTML.includes(`value="${col}"`))) {
        columnElement.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
    }
    if (!columns.every(col => column2Element.outerHTML.includes(`value="${col}"`))) {
        column2Element.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
    }
}

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