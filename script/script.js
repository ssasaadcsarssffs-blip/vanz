// ==========================================================================
// 1. ANIMASI LOADING SCREEN TIMEOUT
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
    }, 2000);
});

// ==========================================================================
// 2. NAVIGASI ANTAR HALAMAN (HOME <-> VANZ Z AI)
// ==========================================================================
const btnHome = document.getElementById('btn-home');
const btnAi = document.getElementById('btn-ai');
const pageHome = document.getElementById('page-home');
const pageAi = document.getElementById('page-ai');

if (btnHome && btnAi && pageHome && pageAi) {
    btnHome.addEventListener('click', () => {
        btnHome.classList.add('active');
        btnAi.classList.remove('active');
        pageHome.classList.add('active');
        pageAi.classList.remove('active');
    });

    btnAi.addEventListener('click', () => {
        btnAi.classList.add('active');
        btnHome.classList.remove('active');
        pageAi.classList.add('active');
        pageHome.classList.remove('active');
    });
}

// ==========================================================================
// 3. PENGATURAN SWITCH TEMA (DARK / LIGHT MODE)
// ==========================================================================
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });
}

// ==========================================================================
// 4. LOGIKA DRAG AND DROP + SVG CURVE LANYARD DYNAMIC
// ==========================================================================
const draggable = document.getElementById('draggable-tag');
const scene = document.getElementById('lanyard-scene');
const pathL = document.getElementById('l-rope-L');
const pathR = document.getElementById('l-rope-R');
const dRing = document.getElementById('l-dring');

let isDragging = false;
let offsetX, offsetY;

if (draggable && scene && pathL && pathR && dRing) {
    
    // Fungsi kalkulasi tali melengkung dinamis berbasis titik koordinat kartu
    const updateLanyardPhysics = () => {
        const sRect = scene.getBoundingClientRect();
        
        // Titik asal gantungan atas kiri dan kanan di dalam sandbox scene
        const anchorLX = sRect.width * 0.35;
        const anchorRX = sRect.width * 0.65;
        const anchorY = 0;

        // Cari titik tengah d-ring penjepit tepat di atas kartu id badge
        const cardLeft = parseFloat(draggable.style.left) || 0;
        const cardTop = parseFloat(draggable.style.top) || 0;
        const cardW = draggable.offsetWidth;

        const targetX = cardLeft + (cardW / 2);
        const targetY = cardTop - 6; // Posisi ring tepat menempel di klip atas kartu

        // Geser element logam penahan d-ring mengikuti posisi kartu
        dRing.setAttribute('transform', `translate(${targetX}, ${targetY})`);

        // Rumus matematika kurva meliuk menggunakan Cubic Bezier
        const cp1LX = anchorLX;
        const cp1LY = anchorY + (targetY - anchorY) * 0.5;
        const cp2LX = targetX - 15;
        const cp2LY = targetY - 20;

        const cp1RX = anchorRX;
        const cp1RY = anchorY + (targetY - anchorY) * 0.5;
        const cp2RX = targetX + 15;
        const cp2LY = targetY - 20;

        pathL.setAttribute('d', `M ${anchorLX} ${anchorY} C ${cp1LX} ${cp1LY}, ${cp2LX} ${cp2LY}, ${targetX} ${targetY}`);
        pathR.setAttribute('d', `M ${anchorRX} ${anchorY} C ${cp1RX} ${cp1RY}, ${cp2RX} ${cp2LY}, ${targetX} ${targetY}`);
    };

    // Taruh posisi kartu di tengah area saat pertama kali dibuka
    window.addEventListener('load', () => {
        const sRect = scene.getBoundingClientRect();
        const dRect = draggable.getBoundingClientRect();
        draggable.style.left = ((sRect.width - dRect.width) / 2) + 'px';
        draggable.style.top = '140px'; // Diberi space jarak vertikal dari ceiling tali
        updateLanyardPhysics();
    });

    const startDrag = (e) => {
        isDragging = true;
        draggable.style.transition = 'none';
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const rect = draggable.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const sRect = scene.getBoundingClientRect();
        
        let newLeft = clientX - sRect.left - offsetX;
        let newTop = clientY - sRect.top - offsetY;

        const maxLeft = sRect.width - draggable.offsetWidth;
        const maxTop = sRect.height - draggable.offsetHeight;

        if (newLeft < 0) newLeft = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        if (newTop < 80) newTop = 80; // Cegah d-ring menembus ceiling
        if (newTop > maxTop) newTop = maxTop;

        draggable.style.left = newLeft + 'px';
        draggable.style.top = newTop + 'px';

        // Segarkan bentuk jalinan tali mengikuti tarikan kursor
        updateLanyardPhysics();
    };

    const endDrag = () => { isDragging = false; };

    // Handler Desktop
    draggable.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    // Handler Smartphone (Touchscreen)
    draggable.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    // Sinkronisasi ulang jika ukuran layar diputar (resize)
    window.addEventListener('resize', updateLanyardPhysics);
}

// ==========================================================================
// 5. INTEGRASI CHAT INTERFACES CLAUDE DENGAN AUTO PROMPT VANZZ AI
// ==========================================================================
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');

// Auto Prompt pengatur jati diri AI di belakang layar
const autoPrompt = "Kamu adalah VanzZ Ai, sebuah asisten kecerdasan buatan pintar yang diciptakan oleh developer handal bernama Vanz. Jawablah setiap pertanyaan user dengan gaya bahasa anak muda yang santai, gaul, agak berwibawa, keren, memakai lo-gue, dan ringkas.";

async function pemicuAI() {
    const userText = chatInput.value.trim();
    if (!userText) return;

    // Masukkan chat ketikan user ke boks chat
    appendMessage(userText, 'user');
    chatInput.value = '';

    // Buat balon teks respons tunggu sementara
    const loadingId = appendMessage('VanzZ Ai sedang berpikir...', 'bot');

    try {
        // Tempel instruksi rahasia identitas didepan query pertanyaan user
        const fullPrompt = `${autoPrompt}\n\nPertanyaan: ${userText}`;
        
        // Kirim request ke API eksternal Claude Azbry
        const requestUrl = `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(fullPrompt)}`;
        const respon = await fetch(requestUrl);
        const data = await respon.json();

        const botMessageElement = document.getElementById(loadingId);
        
        // Pilah data sesuai format struktur API
        if (data && data.result) {
            botMessageElement.innerText = data.result;
        } else if (data && data.message) {
            botMessageElement.innerText = "Sistem Error: " + data.message;
        } else {
            botMessageElement.innerText = "Gagal memproses jawaban dari otak AI.";
        }

    } catch (error) {
        console.error("Gagal Fetch API:", error);
        const botMessageElement = document.getElementById(loadingId);
        botMessageElement.innerText = "Waduh, server VanzZ Ai tampaknya lagi offline nih, Bang!";
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 4);
    
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.id = uniqueId;
    msgDiv.innerText = text;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Tarik scroll otomatis kebawah
    return uniqueId;
}

if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', pemicuAI);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pemicuAI();
    });
}
