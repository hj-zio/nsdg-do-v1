'use strict';

document.addEventListener("DOMContentLoaded", function () {
    $('input_name').addEventListener('input', nameInputHandler);
});

function $(id) { return document.getElementById(id); }
const MAX_MSG = '최대 5만원까지 충전할 수 있어요.', MIN_MSG = '최소 1000원부터 충전할 수 있어요.', UNIT_MSG = '1,000원 단위로 충전할 수 있어요.', LEN_MSG = '예금주명은 4자를 넘을 수 없어요.', JAMO_MSG = '예금주명이 올바르지 않아요.', HANGUL_MSG = '한글만 입력할 수 있어요.';
let prevNameValue = '', prevRawValue = 0, amountExceeded = false;
function setLineState(el, s) { el.classList.remove('bg-gray-300', 'bg-blue-500', 'bg-red-500'); if (s === 'gray') el.classList.add('bg-gray-300'); if (s === 'blue') el.classList.add('bg-blue-500'); if (s === 'red') el.classList.add('bg-red-500'); }
function setStatus(m) { $('status_text').textContent = m; }
const JAMO = /[\u1100-\u11FF\u3130-\u318F]/, SYL = /^[가-힣]+$/, ALLOW = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function nameInputHandler(e) {
    const inp = e.target, val = inp.value, line = $('status_line1');
    setLineState(line, 'gray'); setStatus('');
    if ([...val].length > 4) { inp.value = prevNameValue; setLineState(line, 'red'); setStatus(LEN_MSG); prevNameValue = inp.value; propagateAmount(); return; }
    const filtered = [...val].filter(ch => ALLOW.test(ch)).join('');
    if (filtered !== val) { inp.value = filtered; setLineState(line, 'red'); setStatus(HANGUL_MSG); }
    else if (val && JAMO.test(val)) { setLineState(line, 'red'); setStatus(JAMO_MSG); }
    else if (!val) { setLineState(line, 'gray'); }
    else { setLineState(line, 'blue'); }
    prevNameValue = inp.value;
    if (!$('status_text').textContent) propagateAmount();
}

function openTossApp(account = '토스뱅크 1002-0794-8738 (조민성)') {
    navigator.clipboard.writeText(account).catch(() => { });
    const deepLink = 'supertoss://toss/pay';
    const start = Date.now();
    window.location.href = deepLink;
}

function currencyInputHandler(e, hid) {
    const inp = e.target, h = $(hid), raw = inp.value.replace(/\D/g, ''), num = +raw;
    if (num > 50000) { amountExceeded = true; inp.value = prevRawValue ? new Intl.NumberFormat('ko-KR').format(prevRawValue) + ' 원' : ''; h.value = prevRawValue; }
    else { amountExceeded = false; h.value = raw; prevRawValue = num; const fmt = raw ? new Intl.NumberFormat('ko-KR').format(raw) + ' 원' : ''; const pos = inp.selectionStart; inp.value = fmt; let d = fmt.slice(0, pos).replace(/\D/g, '').length, i = 0, c = 0; while (i < fmt.length && c < d) { if (/\d/.test(fmt[i])) c++; i++; } inp.setSelectionRange(i, i); }
    propagateAmount();
}

function currencyBlurHandler(e, hid) {
    const inp = e.target, raw = $(hid).value; if (raw) inp.value = new Intl.NumberFormat('ko-KR').format(raw) + ' 원'; propagateAmount();
}

function addAmount(d) {
    const inp = $('input_amount'), h = $('amount'), cur = +h.value || 0, sum = cur + d;
    if (sum > 50000) amountExceeded = true; else { amountExceeded = false; h.value = sum; prevRawValue = sum; inp.value = new Intl.NumberFormat('ko-KR').format(sum) + ' 원'; }
    propagateAmount();
}

function propagateAmount() {
    const line = $('status_line2'), txt = $('status_text'), nameErr = [LEN_MSG, JAMO_MSG, HANGUL_MSG].includes(txt.textContent); if (nameErr) return;
    setLineState(line, 'gray'); setStatus('');
    if (amountExceeded) { setLineState(line, 'red'); setStatus(MAX_MSG); return; }
    const raw = $('amount').value; if (!raw) { setLineState(line, 'gray'); return; } const n = +raw;
    if (n < 1000) { setLineState(line, 'red'); setStatus(MIN_MSG); }
    else if (n % 1000) { setLineState(line, 'red'); setStatus(UNIT_MSG); }
    else setLineState(line, 'blue');
}

async function charge() {
    const depositor = document.getElementById('input_name').value;
    const amount = document.getElementById('amount').value;

    if (!validateForm()) {
        alert('입력 조건에 맞지 않아요.');
        return;
    }

    const charge = await fetch("/pay/charge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            depositor: depositor,
            amount: amount
        }),
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error));

    if (!charge.success) {
        alert(charge.message);
        return;
    }

    alert(charge.message);
    location.href = '/pay';
    return;
}

function validateForm() {
    nameInputHandler({ target: $('input_name') });
    propagateAmount();

    return $('status_text').textContent === '';
}