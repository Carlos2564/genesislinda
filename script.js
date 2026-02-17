document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONFIGURACIÓN ---
    const phrases = [
        "Hola... ✨\n¿Puedo robarte un instante?",
        "A veces no encuentro\nlas palabras exactas...",
        "Para decirte lo increíble\nque eres para mí.",
        "Pero quería crear algo\núnico, como tú.",
        "Un pequeño jardín digital\ndonde siempre es primavera.",
        "¿Quieres verlo florecer?",
        "Toca la mariposa una vez más..."
    ];

    // SINCRONIZACIÓN DE LETRAS (Modifica los 'time' según tu audio)
    const lyricsData = [
        { text: "🎶 Empieza nuestra historia...", time: 1 },
        { text: "Cada día brillas más", time: 5 },
        { text: "y mi corazón lo sabe bien", time: 10 },
        { text: "Como una flor al sol", time: 16 },
        { text: "así me haces sentir hoy", time: 22 },
        { text: "Eres mi alegría infinita", time: 28 },
        { text: "Te quiero mucho ❤️", time: 35 }
    ];

    // ELEMENTOS DOM
    const butterflyWrapper = document.getElementById('butterfly-wrapper');
    const butterflyImg = document.getElementById('butterfly-img');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const introHint = document.getElementById('intro-hint');
    const gameLayer = document.getElementById('game-layer');
    const gardenLayer = document.getElementById('garden-layer');
    const music = document.getElementById('bg-music');
    const lyricsContainer = document.getElementById('lyrics-container');
    const heartsContainer = document.getElementById('hearts-container');
    
    let currentPhraseIndex = 0;
    let isGameStarted = false;
    let heartInterval;

    // --- 2. FONDO DE ESTRELLAS (CANVAS) ---
    const canvas = document.getElementById('stars-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * w; this.y = Math.random() * h;
            this.size = Math.random() * 1.5; this.speedX = Math.random() * 0.4 - 0.2; this.speedY = Math.random() * 0.4 - 0.2;
            this.alpha = Math.random();
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if(this.x<0) this.x=w; if(this.x>w) this.x=0; if(this.y<0) this.y=h; if(this.y>h) this.y=0;
            this.alpha += (Math.random() - 0.5) * 0.05; 
            if(this.alpha < 0) this.alpha = 0; if(this.alpha > 1) this.alpha = 1;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
        }
    }
    for(let i=0; i<80; i++) particles.push(new Particle());
    function animateStars() {
        ctx.clearRect(0,0,w,h); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateStars);
    }
    animateStars();

    // --- 3. NUEVO: LLUVIA DE CORAZONES (IMAGEN) ---
    function createHeart() {
        const heart = document.createElement('img');
        heart.src = 'corazon.png'; // Tu imagen
        heart.classList.add('falling-heart');
        
        // Aleatoriedad
        const startLeft = Math.random() * 100; // Posición horizontal %
        const duration = Math.random() * 3 + 4; // Entre 4 y 7 segundos
        const size = Math.random() * 20 + 10; // Tamaño entre 10px y 30px
        
        heart.style.left = startLeft + '%';
        heart.style.animationDuration = duration + 's';
        heart.style.width = size + 'px';
        
        heartsContainer.appendChild(heart);

        // Limpiar DOM después de caer
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // --- 4. LÓGICA DEL JUEGO ---
    butterflyWrapper.addEventListener('click', (e) => {
        if (!isGameStarted) {
            isGameStarted = true;
            music.volume = 0.6;
            music.play().catch(e => console.log("Audio requiere interacción"));
            
            // Ocultar pista inicial
            gsap.to(introHint, { opacity: 0, duration: 0.5, onComplete: () => introHint.style.display = 'none' });
            
            // Mostrar caja de texto
            messageBox.classList.remove('hidden');
            messageBox.style.opacity = 1;

            // Iniciar lluvia suave de corazones (1 cada 600ms)
            heartInterval = setInterval(createHeart, 600);
        }

        explodeConfetti(e.clientX, e.clientY);

        if (currentPhraseIndex < phrases.length) {
            nextPhrase();
            moveButterfly();
        } else {
            finishGame();
        }
    });

    function nextPhrase() {
        gsap.to(messageText, { opacity: 0, y: -15, duration: 0.3, onComplete: () => {
            messageText.innerText = phrases[currentPhraseIndex];
            gsap.fromTo(messageText, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 });
            currentPhraseIndex++;
        }});
    }

    function moveButterfly() {
        // Animación de escape de la mariposa
        gsap.to(butterflyImg, { scale: 0, rotation: 360, duration: 0.4, onComplete: () => {
            // Posición segura (lejos de los bordes)
            const x = Math.random() * 60 + 20; 
            const y = Math.random() * 50 + 20;
            
            butterflyWrapper.style.left = x + '%';
            butterflyWrapper.style.top = y + '%';
            
            gsap.to(butterflyImg, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.5)" });
        }});
    }

    function explodeConfetti(x, y) {
        confetti({
            particleCount: 50, spread: 70, origin: { x: x/window.innerWidth, y: y/window.innerHeight },
            colors: ['#ff6b81', '#fff', '#ffa502']
        });
    }

    // --- 5. GRAN FINAL ---
    function finishGame() {
        // Aumentar intensidad de corazones
        clearInterval(heartInterval);
        heartInterval = setInterval(createHeart, 200); // Lluvia más intensa

        // Ocultar capa de juego
        gsap.to(gameLayer, { opacity: 0, duration: 1.5, onComplete: () => {
            gameLayer.style.display = 'none';
            gardenLayer.classList.remove('hidden');
            gardenLayer.style.display = 'block';
            
            // Iniciar animación de la flor
            setTimeout(() => {
                gardenLayer.style.opacity = 1;
                startGardenAnimation();
            }, 100);
        }});
    }

    function startGardenAnimation() {
        const container = document.querySelector('.flower-container');
        
        // 1. Crece el tallo
        setTimeout(() => container.classList.add('grow-stem'), 500);

        // 2. Aparece tu imagen de flor
        setTimeout(() => {
            container.classList.add('bloom-head');
            gsap.to('.final-message', { opacity: 1, delay: 0.5, duration: 2 });
            
            // Explosión final de confeti desde abajo
            confetti({ particleCount: 150, spread: 120, origin: { y: 1 }, colors: ['#ff6b81', '#fff'] });
        }, 4000); // Ajustado al tiempo de crecimiento del tallo

        // Loop de letras
        setInterval(syncLyrics, 500);
    }

    function syncLyrics() {
        if(music.paused) return;
        const t = Math.floor(music.currentTime);
        const line = lyricsData.find(l => t >= l.time && t < l.time + 5);
        
        if (line && lyricsContainer.innerText !== line.text) {
            lyricsContainer.style.opacity = 0;
            setTimeout(() => {
                lyricsContainer.innerText = line.text;
                lyricsContainer.style.opacity = 1;
            }, 300);
        } else if(!line) {
            lyricsContainer.style.opacity = 0;
        }
    }
});