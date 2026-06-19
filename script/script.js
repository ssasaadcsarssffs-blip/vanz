// ==========================================================================
// 1. ANIMASI LOADING SCREEN TIMEOUT
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
    }, 2000); // Menampilkan loading screen selama 2 detik
});

// ==========================================================================
// 2. NAVIGASI ANTAR HALAMAN (HOME <-> AI VANZZ AI)
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
// 3. PENGATURAN TEMA (DARK / LIGHT MODE)
// ==========================================================================
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>'; // Berubah jadi logo bulan
        } else {
            body.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>'; // Berubah jadi logo matahari
        }
    });
}

// ==========================================================================
// 4. LOGIKA DRAG AND DROP KARTU ID BADGE (NAME TAG)
// ==========================================================================
const draggable = document.getElementById('draggable-tag');
const sandbox = document.getElementById('sandbox');
let isDragging = false;
let offsetX, offsetY;

if (draggable && sandbox) {
    // Posisikan kartu di tengah-tengah sandbox secara otomatis saat dimuat
    window.addEventListener('load', () => {
        const sRect = sandbox.getBoundingClientRect();
        const dRect = draggable.getBoundingClientRect();
        draggable.style.left = ((sRect.width - dRect.width) / 2) + 'px';
        draggable.style.top = '30px';
    });

    // Fungsi Ketika Klik Dimulai (Mouse / Sentuhan HP)
    const startDrag = (e) => {
        isDragging = true;
        draggable.style.transition = 'none'; // Matikan transisi biar pergerakan responsif kursor
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const rect = draggable.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
    };

    // Fungsi Saat Kartu Digeser
    const doDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

        const sRect = sandbox.getBoundingClientRect();
        
        let newLeft = clientX - sRect.left - offsetX;
        let newTop = clientY - sRect.top - offsetY;

        // Batasi pergerakan agar kartu tidak keluar dari kotak sandbox
        const maxLeft = sRect.width - draggable.offsetWidth;
        const maxTop = sRect.height - draggable.offsetHeight;

        if (newLeft < 0) newLeft = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        if (newTop < 0) newTop = 0;
        if (newTop > maxTop) newTop = maxTop;

        draggable.style.left = newLeft + 'px';
        draggable.style.top = newTop + 'px';
    };

    // Lepas Klik/Sentuhan
    const endDrag = () => {
        isDragging = false;
    };

    // Event Listener khusus PC (Mouse)
    draggable.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    // Event Listener khusus HP (Touchscreen)
    draggable.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', doDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

// ==========================================================================
// 5. INTEGRASI API CHATBOX VANZZ AI (CLAUDE)
// ==========================================================================
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');

// Auto prompt rahasia penentu identitas AI
const autoPrompt = "Kamu adalah VanzZ Ai, sebuah asisten kecerdasan buatan pintar yang diciptakan oleh developer handal bernama Vanz. Jawablah setiap pertanyaan user dengan gaya bahasa anak muda yang santai, gaul, agak berwibawa, keren, memakai lo-gue, dan ringkas.";

async function pemicuAI() {
    const userText = chatInput.value.trim();
    if (!userText) return; // Abaikan jika input kosong

    // Tampilkan pesan kiriman user ke layar chat
    appendMessage(userText, 'user');
    chatInput.value = '';

    // Buat efek loading teks sementara menunggu kiriman API
    const loadingId = appendMessage('VanzZ Ai sedang berpikir...', 'bot');

    try {
        // Gabungkan perintah rahasia (auto prompt) dengan ketikan pertanyaan user
        const pesanLengkap = `${autoPrompt}\n\nPertanyaan: ${userText}`;
        
        // Panggil endpoint Claude API sesuai permintaan
        const tanggapan = await fetch(`https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(pesanLengkap)}`);
        const data = await tanggapan.json();

        // Cari element loading yang dibuat tadi untuk ditimpa dengan jawaban asli
        const botMessageElement = document.getElementById(loadingId);
        
        // Cek isi properti data keluaran dari struktur API
        if (data && data.result) {
            botMessageElement.innerText = data.result;
        } else if (data && data.message) {
            botMessageElement.innerText = "Sistem Error: " + data.message;
        } else {
            botMessageElement.innerText = "Gagal memproses jawaban. Silakan coba kirim ulang chat, Bang.";
        }

    } catch (error) {
        console.error("Kesalahan API:", error);
        const botMessageElement = document.getElementById(loadingId);
        botMessageElement.innerText = "Waduh, server otak VanzZ Ai lagi ngadat atau offline nih, Bang!";
    }
}

// Fungsi pembantu membuat bubble chat baru di layar
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 4);
    
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.id = uniqueId;
    msgDiv.innerText = text;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll ke pesan paling bawah
    return uniqueId;
}

// Pemicu Klik tombol atau tekan tombol enter di keyboard
if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', pemicuAI);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pemicuAI();
    });
}
