'use strict';

document.addEventListener("DOMContentLoaded", async function () {
    await shuffleKeys();
});

const PIN_LEN = 4;
let pin = [];
let firstPin = '';
let stage = 1;
let frozen = false;

function shuffleKeys() {
    const keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    const btnOrder = ['btn-1', 'btn-2', 'btn-3', 'btn-4', 'btn-5', 'btn-6', 'btn-7', 'btn-8', 'btn-9', 'btn-0'];
    btnOrder.forEach((btnId, idx) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.innerText = keys[idx];
            btn.onclick = async () => await dial(keys[idx]);
        }
    });
    const backBtn = document.getElementById('btn-back');
    if (backBtn) backBtn.onclick = async () => await dial('back');
}

async function dial(value) {
    if (frozen) return;
    if (value === 'back') {
        if (pin.length) pin.pop();
    } else if (/^\d$/.test(value)) {
        if (pin.length < PIN_LEN) pin.push(value);
    }
    updateDots();

    if (pin.length === PIN_LEN) {
        if (stage === 1) {
            firstPin = pin.join('');
            pin = [];
            document.getElementById('pin_title').innerText = '다시 한번 비밀번호를';
            document.getElementById('pin_title2').innerText = '입력해주세요.';
            stage = 2;
            shuffleKeys();
            updateDots();
        } else {
            const secondPin = pin.join('');
            if (secondPin === firstPin) {
                const sign_password = await fetch("/store/sign-code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        pw: firstPin,
                    }),
                })
                .then((response) => response.json())
                .then((data) => data)
                .catch((error) => console.error(error));

                if (!sign_password.success) {
                    alert(sign_password.message);
                    return;
                }

                alert(sign_password.message);
                location.href = '/store';
                return;
            } else {
                frozen = true;
                document.getElementById('pin_title').innerText = '';
                document.getElementById('pin_title2').innerText = '처음부터 다시 진행할게요.';
                document.getElementById('pin_subtitle').innerText = '비밀번호가 일치하지 않아요.';
                setTimeout(() => {
                    pin = [];
                    stage = 1;
                    frozen = false;
                    document.getElementById('pin_title').innerText = '매장 관리 시 사용할';
                    document.getElementById('pin_title2').innerText = '비밀번호를 입력해주세요.';
                    document.getElementById('pin_subtitle').innerText = '';
                    shuffleKeys();
                    updateDots();
                }, 3000);
            }
        }
    }
}

function updateDots() {
    const dots = [];
    for (let i = 0; i < PIN_LEN; i++) {
        const el = document.getElementById(`dot-${i}`) || document.querySelectorAll('.pin-dot')[i];
        dots.push(el);
    }
    dots.forEach((dot, idx) => {
        const filled = idx < pin.length;
        dot.classList.toggle('text-gray-600', filled);
        dot.classList.toggle('text-gray-300', !filled);
    });
}