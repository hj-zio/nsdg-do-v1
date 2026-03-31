'use strict';

const startAudio = new Audio('/resources/pay_start.mp3');
const passwordAudio = new Audio('/resources/pay_password.mp3');
const successAudio = new Audio('/resources/pay_success.mp3');
const failAudio = new Audio('/resources/pay_fail.mp3');
successAudio.preload = 'auto';
failAudio.preload = 'auto';

document.addEventListener("DOMContentLoaded", async function () {
    resetCart(); startBarcodeScanner(code => productSet(code));
    localStorage.setItem("face_image_id", 'none');
    localStorage.setItem("customer_id", 'none');
    localStorage.setItem("idempotency_key", 'none');
});

async function playStartSound() {
    try {
        startAudio.pause();
        startAudio.currentTime = 0;
        await startAudio.play(); // play()는 Promise 반환하므로 await 해도 되고 무시해도 됨
    } catch (e) {
        console.warn('시작 사운드 재생 실패:', e);
    }
}

async function playPasswordSound() {
    try {
        passwordAudio.pause();
        passwordAudio.currentTime = 0;
        await passwordAudio.play();
    } catch (e) {
        console.warn('비밀번호 입력 사운드 재생 실패:', e);
    }
}

function playSuccessSound() {
    try {
        successAudio.pause();
        successAudio.currentTime = 0;
        void successAudio.play(); // play() 반환 Promise 무시
    } catch (e) {
        console.warn('성공 사운드 재생 실패:', e);
    }
}

function playFailSound() {
    try {
        failAudio.pause();
        failAudio.currentTime = 0;
        void failAudio.play();
    } catch (e) {
        console.warn('실패 사운드 재생 실패:', e);
    }
}


const PIN_LEN = 4;
let pin = [];
let frozen = false;

function shuffleKeys() {
    const keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    const btnOrder = [
        'btn-1', 'btn-2', 'btn-3',
        'btn-4', 'btn-5', 'btn-6',
        'btn-7', 'btn-8', 'btn-9',
        'btn-0'
    ];
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
        const enteredPin = pin.join('');

        const customer_id = localStorage.getItem('customer_id');
        const face_image_id = localStorage.getItem('face_image_id');
        const idempotency_key = localStorage.getItem('idempotency_key');

        const req = await payRequest(customer_id, cart, enteredPin, face_image_id, idempotency_key);
        if (req.success) {
            addHidden('passwordPage');
            removeHidden('successPage');
            playSuccessSound();
            setTimeout(() => location.reload(), 5000);
        } else {
            addHidden('passwordPage');
            removeHidden('failPage');
            playFailSound();
            document.getElementById('fail_subtitle').innerHTML = req.message;
            setTimeout(() => location.reload(), 5000);
        }
    }
}

function updateDots() {
    for (let i = 0; i < PIN_LEN; i++) {
        const dot = document.getElementById(`dot-${i}`) || document.querySelectorAll('.pin-dot')[i];
        if (!dot) continue;
        const filled = i < pin.length;
        dot.classList.toggle('text-gray-600', filled);
        dot.classList.toggle('text-gray-300', !filled);
    }
}

function passwordInit() {
    const customer_id = localStorage.getItem('customer_id');
    const face_image_id = localStorage.getItem('face_image_id');
    const idempotency_key = localStorage.getItem('idempotency_key');

    if (customer_id === 'none' || face_image_id === 'none' || idempotency_key === 'none') {
        alert('얼굴 인식이 되지 않았어요.');
        return;
    }

    if (cart.length === 0) {
        alert('결제할 상품이 없어요.');
        return;
    }

    playPasswordSound();

    shuffleKeys();
    addHidden('paymentPage');
    removeHidden('passwordPage');
}

async function getIdempotencyKey(customer_id) {
    const req = await fetchJSON(`/pay/createIdempotencyKey?customer_id=${customer_id}`);
    return req;
}

async function payRequest(customer_id, productItem, password, face_image_id, idempotency_key) {
    const req = await fetch("/pay/requestPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customer_id: customer_id,
            productItem: productItem,
            password: password,
            face_image_id: face_image_id,
            idempotency_key: idempotency_key
        })
    })
        .then((response) => response.json())
        .then((data) => data)
        .catch((error) => console.error(error));

    return req;
}

function startBarcodeScanner(onScan, { timeout = 80, minLength = 3, suffixKey = "Enter" } = {}) {
    let buffer = "";
    let flushTimer = null;

    function flush() {
        if (buffer.length >= minLength) onScan(buffer);
        buffer = "";
    }

    function handler(e) {
        if (e.key === suffixKey) {
            e.preventDefault();
            clearTimeout(flushTimer);
            flush();
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            buffer += e.key;
            clearTimeout(flushTimer);
            flushTimer = setTimeout(flush, timeout);
        }
    }

    window.addEventListener("keydown", handler, { passive: true });
    return () => window.removeEventListener("keydown", handler);
}

async function fetchJSON(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        return await response.json();
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

async function scanFace() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/png");
    stream.getTracks().forEach(t => t.stop());
    return base64Image;
}

async function payInit() {
    try {        
        localStorage.setItem("face_image_id", 'none');
        localStorage.setItem("customer_id", 'none');
        localStorage.setItem("idempotency_key", 'none');

        document.getElementById("face_content").textContent = "얼굴인식중";
        document.getElementById("face_img").src = "/resources/profile.png";
        const base64Image = await scanFace();
        const compareFace = await fetch("/pay/compare_face", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imgBase64: base64Image })
        }).then(r => r.json()).catch(e => console.error(e));

        if (!compareFace.success) {
            localStorage.setItem("face_image_id", 'none');
            localStorage.setItem("customer_id", 'none');
            localStorage.setItem("idempotency_key", 'none');
            document.getElementById("face_content").textContent = compareFace.message;
            document.getElementById("face_img").src = "/resources/profile.png";
            await payInit();
            return;
        }

        const data = compareFace.data[0].slice().sort((a, b) => b.match_ratio - a.match_ratio);
        const highMatchData = data.filter(item => item.match_ratio > 0.8);

        if (highMatchData.length === 0) {
            localStorage.setItem("face_image_id", 'none');
            localStorage.setItem("customer_id", 'none');
            localStorage.setItem("idempotency_key", 'none');
            document.getElementById("face_content").textContent = "얼굴인식중";
            document.getElementById("face_img").src = "/resources/profile.png";
            await payInit();
            return;
        }

        if (highMatchData.length > 1) {
            localStorage.setItem("face_image_id", 'none');
            localStorage.setItem("customer_id", 'none');
            localStorage.setItem("idempotency_key", 'none');
            document.getElementById("face_content").textContent = "얼굴인식중";
            document.getElementById("face_img").src = "/resources/profile.png";
            createUserModal(highMatchData, face_image_id);
            return;
        }

        const get_idempotency_key = await getIdempotencyKey(data[0].uuid);
        if (!get_idempotency_key.success) {
            alert('인증키 발급과정에서 문제가 발생했어요.');
            return;
        }

        localStorage.setItem("face_image_id", compareFace.data[1]);
        localStorage.setItem("customer_id", data[0].uuid);
        localStorage.setItem("idempotency_key", get_idempotency_key.data);
        document.getElementById("face_content").textContent = `${data[0].name}님, 안녕하세요.`;
        document.getElementById("face_img").src = `/i?id=${data[0].profileImage}`;
    } catch (e) {
        console.error(e);
    }
}

async function manualUser(customer_id, name, profileImage, face_image_id) {
    const get_idempotency_key = await getIdempotencyKey(customer_id);
    if (!get_idempotency_key.success) {
        alert('인증키 발급과정에서 문제가 발생했어요.');
        return;
    }

    localStorage.setItem("face_image_id", face_image_id);
    localStorage.setItem("customer_id", customer_id);
    localStorage.setItem("idempotency_key", get_idempotency_key.data);
    document.getElementById("face_content").textContent = `${name}님, 안녕하세요.`;
    document.getElementById("face_img").src = `/i?id=${profileImage}`;
}

function createUserModal(data, face_image_id) {
    document.getElementById("modal_title").textContent = "사용자 선택";
    const userCards = data.map(user => `
        <div
            class="w-fit px-3 py-2 bg-blue-100 text-blue-500 rounded-xl transition-all duration-100 ease-in-out hover:bg-blue-200 active:scale-95 cursor-pointer"
            onclick="manualUser('${user.uuid}', '${user.name}', '${user.profileImage}', '${face_image_id}'); closeModal();"
        >
            ${user.name}
        </div>
    `).join('');
    const modalContent = `
        <div class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-3">
                <div class="flex flex-col space-y-1 text-[16px] sm:text-[18px] text-gray-600 pretendard-500">
                    <span class="text-[14px] sm:text-[16px] text-gray-600 pretendard-500 leading-none">
                        얼굴이 비슷한 유저가 총 ${data.length}명 있어요.
                    </span>
                    <span class="text-[14px] sm:text-[16px] text-blue-500 pretendard-500 leading-none">
                        본인 이름을 선택해주세요.
                    </span>
                </div>
                <div class="flex flex-row flex-wrap gap-x-2 gap-y-3">
                    ${userCards}
                </div>
            </div>
            <div class="flex flex-row space-x-2">
                <button
                    onclick="closeModal()"
                    class="ml-auto px-4 py-2 bg-gray-100 text-gray-500 rounded-lg transition-all duration-100 ease-in-out hover:bg-gray-200 active:scale-95"
                >
                    닫기
                </button>
            </div>
        </div>
    `;
    document.getElementById("modal_content").innerHTML = modalContent;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

async function productSet(barcode) {
    let p;
    if (productCache[barcode]) {
        p = productCache[barcode];
    } else {
        const res = await fetchJSON(`/pay/getProductInfoByBarcode?barcode=${barcode}`);
        if (!res.success) {
            alert(res.message);
            return;
        }
        p = res.data[0];
        productCache[barcode] = p;
    }
    addToCart({ product_id: p.product_id, name: p.name, price: p.price, barcode: barcode });
}

function addToCart(item) {
    const existing = cart.find(i => i.product_id === item.product_id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    renderCart();
}

function removeProduct(productId) {
    const idx = cart.findIndex(i => i.product_id === productId);
    if (idx !== -1) {
        cart.splice(idx, 1);
        renderCart();
    }
}

function incrementQuantity(productId) {
    const item = cart.find(i => i.product_id === productId);
    if (item) {
        item.quantity++;
        renderCart();
    }
}

function decrementQuantity(productId) {
    const item = cart.find(i => i.product_id === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
    } else {
        removeProduct(productId);
        return;
    }
    renderCart();
}

function renderCart() {
    const html = cart.map(p => `
        <div class="flex flex-row justify-between items-center w-full h-fit space-x-5 px-4 py-3 bg-white rounded-lg">
            <div class="flex flex-row justify-center items-center space-x-3">
                <span
                    class="flex justify-center items-center w-6 h-6 text-[14px] sm:text-[16px] text-white pretendard-700 bg-red-500 rounded-full transition-all duration-100 ease-in-out hover:bg-red-600 active:scale-95 cursor-pointer select-none"
                    onclick="removeProduct('${p.product_id}')"
                >✕</span>
                <div class="flex flex-col">
                    <span class="text-[16px] sm:text-[18px] text-gray-600 pretendard-400">${p.name}</span>
                    <span class="text-[16px] sm:text-[18px] text-gray-600 pretendard-600">${p.price.toLocaleString()}원</span>
                </div>
            </div>
            <div class="flex flex-row justify-center items-center">
                <span
                    class="select-none p-3 text-[16px] sm:text-[18px] text-gray-600 pretendard-600 rounded-l-xl bg-gray-100 transition-all duration-100 ease-in-out hover:bg-gray-200 active:scale-95 cursor-pointer"
                    onclick="decrementQuantity('${p.product_id}')"
                >-</span>
                <span
                    id="qty_${p.product_id}"
                    class="p-4 text-[16px] sm:text-[18px] text-gray-600 pretendard-600 rounded-xl bg-white"
                >${p.quantity.toLocaleString()}</span>
                <span
                    class="select-none p-3 text-[16px] sm:text-[18px] text-gray-600 pretendard-600 rounded-r-xl bg-gray-100 transition-all duration-100 ease-in-out hover:bg-gray-200 active:scale-95 cursor-pointer"
                    onclick="incrementQuantity('${p.product_id}')"
                >+</span>
            </div>
        </div>
    `).join('');
    document.getElementById("product_list").innerHTML = html;
    renderCartTotals();
}

function renderCartTotals() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
    document.getElementById("total_quantity").textContent = totalQty.toLocaleString();
    document.getElementById("total_price").textContent = totalPrice.toLocaleString() + "원";
}

function addHidden(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
}

function removeHidden(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
}

function resetCart() {
    cart.length = 0;
    renderCart();
}

const cart = [];
const productCache = {};