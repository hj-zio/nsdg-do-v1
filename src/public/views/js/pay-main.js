'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await initializeTabs(); await getUserBalance(); await getUserTransaction();
});

async function getUserBalance() {
    const req = await fetchJSON('/pay/getUserBalance');
    if (!req.success) {
        alert(req.message);
        return;
    }

    document.getElementById('pay_balance').innerHTML = Number(req.data).toLocaleString('ko-KR') + '원';
}

async function getStoreName(store_id) {
    return await fetchJSON(`/pay/getStoreName?store_id=${store_id}`);
}

async function getUserTransaction() {
    const req = await fetchJSON('/pay/getUserTransaction');
    if (!req.success) {
        alert(req.message);
        return;
    }

    if (req.data.length === 0) {
        return;
    }

    const escapeHTML = (str) =>
        String(str ?? '').replace(/[&<>"']/g, (c) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
        );

    const nf = new Intl.NumberFormat('ko-KR');

    const transactions = Array.isArray(req.data) ? [...req.data] : [];
    transactions.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let runningBalance = 0;
    for (const t of transactions) {
        if (t.pay_type === 'deposit') {
            runningBalance += Number(t.amount) || 0;
        } else {
            runningBalance -= Number(t.amount) || 0;
        }
        t.runningBalance = runningBalance;
    }

    const storeNameCache = {};
    async function resolveStoreName(store_id) {
        if (storeNameCache[store_id]) return storeNameCache[store_id];
        try {
            const res = await getStoreName(store_id);
            if (!res.success) {
                alert(res.message);
                storeNameCache[store_id] = store_id;
            } else {
                storeNameCache[store_id] = res.data;
            }
        } catch (e) {
            storeNameCache[store_id] = store_id;
        }
        return storeNameCache[store_id];
    }

    const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    });
    const ymdComparator = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
    });
    const mdFormatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        month: '2-digit',
        day: '2-digit',
    });

    const todayYMD = ymdComparator.format(new Date());

    const htmlArr = await Promise.all(
        transactions
            .slice()
            .reverse()
            .map(async (item) => {
                const isDeposit = item.pay_type === 'deposit';
                const sign = isDeposit ? '+' : '-';
                const amountNum = Number(item.amount) || 0;
                const amountFormatted = sign + nf.format(amountNum) + '원';

                const date = new Date(item.created_at);
                const transYMD = ymdComparator.format(date);
                const hhmm = timeFormatter.format(date);
                let displayTime;
                if (transYMD === todayYMD) {
                    displayTime = hhmm;
                } else {
                    const parts = mdFormatter.formatToParts(date);
                    const month = parts.find((p) => p.type === 'month')?.value || '';
                    const day = parts.find((p) => p.type === 'day')?.value || '';
                    displayTime = `${month}/${day} ${hhmm}`;
                }

                const balanceNum = Number(item.runningBalance) || 0;
                const balanceFormatted =
                    (balanceNum < 0 ? '-' : '') + nf.format(Math.abs(balanceNum)) + '원';

                const topAmountClass = isDeposit
                    ? 'text-blue-500 pretendard-700'
                    : 'text-gray-700 pretendard-700';

                let topLeftLabel;
                if (item.memo && /충전/i.test(item.memo)) {
                    topLeftLabel = '페이머니 충전';
                } else {
                    topLeftLabel = await resolveStoreName(item.store_id);
                }

                const topLeftHTML = `
<span class="flex-1 text-[16px] sm:text-[18px] text-gray-700 pretendard-600 text-left">
  ${escapeHTML(topLeftLabel)}
  <span class="ms-2 cursor-pointer text-[14px] sm:text-[16px] text-gray-400 pretendard-600 hover:text-gray-500 transition-all ease-in-out duration-100" onclick="showPayTransaction('${escapeHTML(
                    item.pay_id
                )}')">&gt;</span>
</span>`.trim();

                return `
<div class="flex flex-col w-full h-fit justify-start items-start px-5 py-4">
  <div class="flex flex-row w-full h-fit justify-between items-start">
    ${topLeftHTML}
    <span class="flex-1 text-[16px] sm:text-[18px] ${topAmountClass} text-right">${amountFormatted}</span>
  </div>
  <div class="flex flex-row w-full h-fit justify-between items-start mt-1">
    <span class="flex-1 text-[14px] sm:text-[16px] text-gray-500 pretendard-400 text-left">${displayTime}</span>
    <span class="flex-1 text-[14px] sm:text-[16px] text-gray-500 pretendard-400 text-right">${escapeHTML(
                    balanceFormatted
                )}</span>
  </div>
</div>`;
            })
    );

    const container = document.getElementById('pay_history');
    if (container) {
        container.innerHTML = htmlArr.join('');
    }
}

async function initializeTabs() {
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    
    const tabs = document.querySelectorAll('#tabs button');
    const contents = document.querySelectorAll('#tab-content [data-content]');
    
    function activateTab(index) {
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.classList.add('bg-blue-600', 'text-white');
                tab.classList.remove('text-gray-500', 'hover:text-gray-600');
            } else {
                tab.classList.remove('bg-blue-600', 'text-white');
                tab.classList.add('text-gray-500', 'hover:text-gray-600');
            }
        });
        
        contents.forEach((content, i) => {
            if (i === index) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }
    
    activateTab(0);
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            activateTab(index);
        });
    });
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