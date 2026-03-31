"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    await init();
    await initCameraCanvas();
});

async function init() {}

function agree() {
    if (!document.getElementById("agree_input").checked) {
        alert("필수 항목에 동의해주세요.");
        return;
    }
    location.href = "/pay/facesign-2";
}

async function initCameraCanvas() {
    const canvas = document.getElementById("cameraCanvas");
    const ctx = canvas.getContext("2d");
    const guide = document.getElementById("guideCanvas");
    const gctx = guide.getContext("2d");
    const border = document.getElementById("faceStatusBorder");
    const titleEl = document.getElementById("title");
    const subEl = document.getElementById("subtitle");

    let overlay = document.getElementById("canvasOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "canvasOverlay";
        overlay.className = "absolute inset-0 bg-white/70 backdrop-blur-lg opacity-0 pointer-events-none transition-all duration-500 ease-in-out z-20";
        border.appendChild(overlay);
    }
    const showOverlay = (on) => overlay.classList.toggle("opacity-100", on) || overlay.classList.toggle("opacity-0", !on);

    const resize = () => {
        const size = Math.min(border.clientWidth, border.clientHeight);
        const dpr = window.devicePixelRatio || 1;
        [canvas, guide].forEach((c) => {
            c.width = c.height = size * dpr;
            c.style.width = c.style.height = `${size}px`;
        });
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    new ResizeObserver(resize).observe(border);

    const setBorder = (cls) => {
        const prev = [...border.classList].find((c) => c.startsWith("border-") && c !== "border-4");
        if (prev) border.classList.replace(prev, cls);
        else border.classList.add(cls);
    };
    const showGuide = (on) => guide.classList.toggle("opacity-100", on) || guide.classList.toggle("opacity-0", !on);

    const baseTitles = ["정면을 바라봐주세요.", "왼쪽 방향을 바라봐주세요.", "오른쪽 방향을 바라봐주세요."];
    const drawGuide = (s) => {
        gctx.clearRect(0, 0, guide.width, guide.height);
        if (s === "permission" || s === "processing") {
            showGuide(false);
            return;
        }
        showGuide(true);

        const dpr = window.devicePixelRatio || 1;
        const cx = guide.width / 2;
        const cy = guide.height / 2;
        const R = cx - 3 * dpr;
        gctx.setLineDash([12 * dpr, 8 * dpr]);
        gctx.lineWidth = 3 * dpr;
        gctx.lineCap = "round";
        gctx.strokeStyle = "rgba(255,255,255,0.6)";

        if (s === "front") {
            gctx.beginPath(); gctx.moveTo(cx, cy - R); gctx.lineTo(cx, cy + R); gctx.stroke();
            gctx.beginPath(); gctx.moveTo(cx - R, cy); gctx.lineTo(cx + R, cy); gctx.stroke();
            return;
        }
        const λ = s === "left" ? -25 * Math.PI / 180 : 25 * Math.PI / 180;
        gctx.beginPath();
        for (let d = -90; d <= 90; d += 3) {
            const θ = d * Math.PI / 180;
            const x = R * Math.cos(θ) * Math.sin(λ);
            const y = R * Math.sin(θ);
            d === -90 ? gctx.moveTo(cx + x, cy + y) : gctx.lineTo(cx + x, cy + y);
        }
        gctx.stroke();
    };

    const updateUI = (s) => {
        const bwBlue = "border-blue-500", bwGray = "border-gray-400";
        if (s === "permission") { setBorder(bwGray); titleEl.textContent = "촬영이 곧 시작돼요"; subEl.textContent = "카메라 접근권한을 허용해주세요."; showOverlay(false); }
        if (s === "front") { setBorder(bwBlue); titleEl.textContent = baseTitles[0]; subEl.textContent = ""; showOverlay(false); }
        if (s === "left") { setBorder(bwBlue); titleEl.textContent = baseTitles[1]; subEl.textContent = ""; showOverlay(false); }
        if (s === "right") { setBorder(bwBlue); titleEl.textContent = baseTitles[2]; subEl.textContent = ""; showOverlay(false); }
        if (s === "processing") { setBorder(bwGray); titleEl.textContent = "얼굴을 등록중이에요."; subEl.textContent = "잠시만 기다려주세요."; showOverlay(true); }
        drawGuide(s);
    };
    updateUI("permission");

    const video = document.createElement("video");
    video.autoplay = video.playsInline = video.muted = true;

    try {
        video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        await video.play();
        updateUI("front");
    } catch (err) {
        setBorder("border-red-500");
        titleEl.textContent = "카메라 실패";
        subEl.textContent = err.message;
        return;
    }

    const { FilesetResolver, FaceLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0");
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task", delegate: "GPU" },
        numFaces: 1,
        runningMode: "VIDEO"
    });

    const yawTargets = [0, -25, 25];
    const yawTolFront = 10;
    const yawTolSide = 4;
    const centerTol = 0.1;
    const minFace = 0.25;
    const maxFace = 0.6;

    const captured = [];
    const states = ["front", "left", "right", "processing"];
    let step = 0;
    let counting = false;
    let startTime = 0;

    function drawVideoCover(ctx_, vid, dw, dh) {
        const vw = vid.videoWidth;
        const vh = vid.videoHeight;
        const videoRatio = vw / vh;
        const canvasRatio = dw / dh;
        let sx = 0, sy = 0, sWidth = vw, sHeight = vh;
        if (videoRatio > canvasRatio) { sWidth = vh * canvasRatio; sx = (vw - sWidth) / 2; } 
        else { sHeight = vw / canvasRatio; sy = (vh - sHeight) / 2; }
        ctx_.drawImage(vid, sx, sy, sWidth, sHeight, 0, 0, dw, dh);
    }

    const analyse = async () => {
        const dpr = window.devicePixelRatio || 1;
        const cw = canvas.width;
        const cwCSS = cw / dpr;
        if (!video.videoWidth || !video.videoHeight) { requestAnimationFrame(analyse); return; }

        ctx.save();
        ctx.translate(cwCSS, 0);
        ctx.scale(-1, 1);
        drawVideoCover(ctx, video, cwCSS, cwCSS);
        ctx.restore();

        const sampleSize = Math.floor(cw * 0.2);
        const offset = Math.floor((cw - sampleSize) / 2);
        const data = ctx.getImageData(offset, offset, sampleSize, sampleSize).data;
        let lumSum = 0;
        for (let i = 0; i < data.length; i += 4) lumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const avgLum = lumSum / (data.length / 4);
        if (avgLum < 40) { setBorder("border-red-500"); titleEl.textContent = "얼굴이 잘 안 보여요."; subEl.textContent = "밝은 곳에서 진행해주세요."; showOverlay(true); requestAnimationFrame(analyse); return; } 
        else showOverlay(false);

        if (step < 3) {
            const res = landmarker.detectForVideo(video, performance.now());
            if (res.faceLandmarks?.length) {
                const lm = res.faceLandmarks[0];
                let yaw = 0;
                const tf = res.facialTransformationMatrixes?.[0];
                if (tf) yaw = Math.atan2(-tf[8], tf[10]) * 180 / Math_PI;
                else { const L = lm[234], R = lm[454]; if (L && R) yaw = Math.atan2(-(R.z - L.z), R.x - L.x) * 180 / Math.PI; }
                let minX = 1, maxX = 0, minY = 1, maxY = 0;
                lm.forEach((p) => { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; });
                const cx = (minX + maxX) / 2;
                const cy = (minY + maxY) / 2;
                const faceSize = maxX - minX;
                const centered = Math.abs(cx - 0.5) < centerTol && Math.abs(cy - 0.5) < centerTol;
                const distOk = faceSize > minFace && faceSize < maxFace;
                const tol = step === 0 ? yawTolFront : yawTolSide;
                const yawOk = Math.abs(yaw - yawTargets[step]) < tol;
                if (!distOk) { titleEl.textContent = "거리를 조정해주세요."; subEl.textContent = faceSize <= minFace ? "얼굴이 너무 멀어요." : "얼굴이 너무 가까워요."; setBorder("border-red-500"); counting = false; }
                else if (!centered) { titleEl.textContent = baseTitles[step]; subEl.textContent = "얼굴을 중앙에 맞춰주세요."; setBorder("border-red-500"); counting = false; }
                else if (!yawOk) { titleEl.textContent = baseTitles[step]; subEl.textContent = ""; setBorder("border-blue-500"); counting = false; }
                else {
                    if (!counting) { counting = true; startTime = performance.now(); subEl.textContent = "이 자세를 유지하세요."; setBorder("border-blue-500"); }
                    else if (performance.now() - startTime >= 3000) { captured.push(canvas.toDataURL("image/jpeg")); step++; counting = false; if (step < 3) updateUI(states[step]);
                        else { updateUI("processing"); await fetch("/pay/sign_face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imgBase64: captured[0] }) }); titleEl.textContent = "등록이 완료됐어요!"; subEl.textContent = "다음 단계로 이동할게요."; setBorder("border-blue-500"); showOverlay(false); location.href = "/pay/facesign-3"; }
                    }
                }
            }
        }
        requestAnimationFrame(analyse);
    };
    analyse();
}