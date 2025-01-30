// Ambil elemen kotak yang ingin dibuat interaktif
const box = document.querySelector('.center-box');

// Fungsi untuk mendeteksi pergerakan kursor saat berada di dalam kotak
box.addEventListener('mousemove', function(event) {
    const boxRect = box.getBoundingClientRect();
    const boxCenterX = boxRect.left + boxRect.width / 4;
    const boxCenterY = boxRect.top + boxRect.height / 4;

    // Hitung jarak antara kursor dan pusat kotak
    const deltaX = event.clientX - boxCenterX;
    const deltaY = event.clientY - boxCenterY;

    // Perbesar efek rotasi dengan angka lebih tinggi
    const angleX = (deltaY / boxRect.height) * 30;  // Rotasi vertikal lebih besar
    const angleY = (deltaX / boxRect.width) * -30;  // Rotasi horizontal lebih besar

    // Terapkan rotasi pada kotak (baik horizontal dan vertikal)
    box.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.05)`; // Menambahkan efek zoom sedikit
});

// Reset rotasi ketika mouse keluar dari kotak
box.addEventListener('mouseleave', function() {
    box.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';  // Reset rotasi dan zoom
});

const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle properties
const particles = [];
const particleCount = 300;  // Jumlah partikel yang lebih banyak untuk animasi lebih kaya

// Random characters (untuk mengganti partikel menjadi angka atau simbol)
const characters = '0123456789@#&*%!'.split('');

// Position of the cursor (for magnet effect)
let cursorX = -1000;
let cursorY = -1000;

// Particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 10; // Ukuran teks partikel
        this.speedX = Math.random() * 2 - 1; // Gerakan horizontal
        this.speedY = Math.random() * 2 - 1; // Gerakan vertikal
        this.character = characters[Math.floor(Math.random() * characters.length)]; // Pilih karakter acak
        this.color = 'rgba(0, 255, 0, 0.8)'; // Warna hijau cerah
        this.life = Math.random() * 100 + 100; // Berapa lama partikel bertahan
        this.distance = 0;
        this.maxSpeed = 2;
        this.angle = Math.random() * Math.PI * 2;  // Menggunakan sudut acak untuk ombak
        this.initialX = this.x; // Menyimpan posisi awal X
        this.initialY = this.y; // Menyimpan posisi awal Y
        this.smoothFactor = 0.05;  // Kecepatan transisi halus
    }

    // Fungsi untuk melakukan interpolasi (lerp) antara dua nilai
    lerp(start, end, t) {
        return start + (end - start) * t;
    }

    update() {
        // Jika kursor ada, tarik partikel ke arah kursor (efek magnet)
        if (cursorX !== -1000 && cursorY !== -1000) {
            const dx = cursorX - this.x;
            const dy = cursorY - this.y;
            this.distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            const speed = Math.min(this.distance / 50, this.maxSpeed); // Kecepatan partikel terpengaruh jarak
            this.x += Math.cos(angle) * speed;
            this.y += Math.sin(angle) * speed;
        } else {
            // Jika kursor keluar, pergerakan ombak ke kiri-kanan
            this.x += Math.sin(this.angle) * 3;  // Menambahkan pergerakan sinusoidal untuk ombak
            this.angle += 0.05;  // Kecepatan gelombang

            // Menjaga partikel tetap dalam batas layar
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;

            // Jika kursor keluar, interpolasi ke posisi awal
            this.x = this.lerp(this.x, this.initialX, this.smoothFactor);
            this.y = this.lerp(this.y, this.initialY, this.smoothFactor);
        }

        // Jika partikel keluar dari area canvas, reset posisi
        if (this.y > canvas.height || this.y < 0) {
            this.y = Math.random() * canvas.height;
        }

        // Kurangi waktu hidup partikel
        this.life -= 0.1;
    }

    draw() {
        ctx.font = `${this.size}px Courier`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.character, this.x, this.y); // Menampilkan karakter
    }
}

// Buat partikel awal yang bergerak di latar belakang
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
}

// Update posisi kursor (untuk efek magnet)
canvas.addEventListener('mousemove', (e) => {
    cursorX = e.x;
    cursorY = e.y;
});

// Jika kursor meninggalkan area canvas, set posisi cursor menjadi null
canvas.addEventListener('mouseleave', () => {
    cursorX = -1000;
    cursorY = -1000;
});
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Hapus partikel yang sudah habis masa hidupnya
function cleanupParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });

    // Hapus partikel yang sudah habis masa hidupnya
    cleanupParticles();

    requestAnimationFrame(animate);
}

animate();
