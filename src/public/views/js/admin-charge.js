'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    await getChargeList();
});

async function approve(charge_id) {
    try {
        const res = await fetchJSON(`/pay/approveCharge?charge_id=${charge_id}`);
        alert(res.message);
        location.href='/admin/charge';
    } catch (e) {
        console.log(e);
    }
}

async function reject(charge_id) {
    try {
        const res = await fetchJSON(`/pay/rejectCharge?charge_id=${charge_id}`);
        alert(res.message);
        location.href='/admin/charge';
    } catch (e) {
        console.log(e);
    }
}

async function getChargeList() {
    try {
        const res = await fetchJSON('/pay/getChargeList');
        if (!res.success) {
            alert(res.message);
            return;
        }
        const data = res.data;
        const statusStyle = {
            pending: 'text-gray-500 bg-gray-100',
            approved: 'text-blue-500 bg-blue-100',
            rejected: 'text-red-500 bg-red-100'
        };
        const statusLabel = {
            pending: '대기',
            approved: '승인',
            rejected: '거부'
        };
        const headerRow = `
            <div class="flex border-t border-gray-300 sticky top-0 z-10">
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">id</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">상태</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">예금주</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">충전금액</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">거래ID</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">처리시각</div>
                <div class="flex flex-row items-center flex-1 px-4 py-3 bg-gray-100 text-[14px] text-gray-600 pretendard-600 overflow-hidden text-ellipsis whitespace-nowrap">승인&nbsp;|&nbsp;거부</div>
            </div>
        `;
        const rows = data.map((item, idx) => {
            const rowBorder = idx === data.length - 1 ? 'border-y' : 'border-t';
            const amountStr = item.amount !== null ? item.amount.toLocaleString('ko-KR') + '원' : 'null';
            const payIdStr = item.pay_id ?? 'null';
            const processedAtStr = item.processed_at ?? 'null';
            const statusSpan = `
                <span class="rounded-full px-2 py-1 text-[12px] sm:text-[14px] pretendard-700 ${statusStyle[item.status] || ''}">
                    ${statusLabel[item.status] ?? item.status}
                </span>
            `;
            return `
                <div class="flex ${rowBorder} border-gray-300">
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">${item.id}</div>
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 overflow-hidden text-ellipsis whitespace-nowrap">${statusSpan}</div>
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">${item.depositor}</div>
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">${amountStr}</div>
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">${payIdStr}</div>
                    <div class="flex flex-row items-center flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">${processedAtStr}</div>
                    <div class="flex flex-row items-center space-x-1 flex-1 px-4 py-3 bg-white text-[12px] sm:text-[14px] pretendard-500 text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                        <span class="inline-block rounded-xl px-2 py-1 text-[12px] sm:text-[14px] pretendard-500 text-white bg-blue-500 transition-all duration-100 ease-in-out hover:bg-blue-600 active:scale-90 cursor-pointer" onclick="approve(${item.id})">승인</span>
                        <span class="inline-block rounded-xl px-2 py-1 text-[12px] sm:text-[14px] pretendard-500 text-white bg-red-500 transition-all duration-100 ease-in-out hover:bg-red-600 active:scale-90 cursor-pointer" onclick="reject(${item.id})">거부</span>
                    </div>
                </div>
            `;
        }).join('');
        document.getElementById('result').innerHTML = headerRow + rows;
    } catch (e) {
        console.error(e);
    }
}

async function fetchJSON(url) {
    try {
        const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
        return await res.json();
    } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
    }
}