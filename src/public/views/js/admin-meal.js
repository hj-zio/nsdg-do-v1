'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await getMealList();
});

async function getMealList() {
    const mealList = await fetchJSON(`/admin/querySQL?c=SELECT data, startDate, endDate FROM MEALDB;&p=[]`);
    if (!mealList.success) return alert(mealList.message);

    createTable(mealList.data);
}

function handleFileChange(event) {
    const input = event.target;
    const fileText = document.getElementById('meal-file-text');
    if (input.files && input.files.length > 0) {
        const fileName = input.files[0].name;
        fileText.textContent = fileName;
        fileText.classList.remove('text-gray-400');
        fileText.classList.add('text-gray-700');
    } else {
        fileText.textContent = '파일을 선택해주세요.';
        fileText.classList.remove('text-gray-700');
        fileText.classList.add('text-gray-400');
    }
}

async function uploadMealFile() {
    let input = document.getElementById('meal-file');
    let file = input.files[0];

    let startDate = document.getElementById("meal-start").value;
    let endDate = document.getElementById("meal-end").value;

    if (!file || !startDate || !endDate) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        let base64String = reader.result.split(",")[1];

        let response = await fetch(`/admin/uploadMeal?startDate=${startDate}&endDate=${endDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: base64String })
        });

        let result = await response.json();
        if (response.ok) {
            alert(result.message);
        }
    };
    reader.onerror = function (error) {
        console.error("파일 읽기 오류:", error);
        alert("파일을 읽는 중 오류가 발생했습니다.");
    };
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