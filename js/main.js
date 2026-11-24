// js/main.js - Coordinador Principal de la Aplicación y Juegos

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const menuScreen = document.getElementById('menu-screen');
    const controlsHills = document.getElementById('controls-hills');
    const controlsLanes = document.getElementById('controls-lanes');
    
    const btnHome = document.getElementById('btn-home');
    const btnSound = document.getElementById('btn-sound');
    const soundIcon = document.getElementById('sound-icon');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnQr = document.getElementById('btn-qr');
    const qrModal = document.getElementById('qr-modal');
    const btnCloseQr = document.getElementById('btn-close-qr');

    const cardHills = document.getElementById('card-hills');
    const cardLanes = document.getElementById('card-lanes');

    const ridersContainer = document.getElementById('riders-container');
    const colorsContainer = document.getElementById('colors-container');

    // Botones táctiles de Colinas
    const btnGas = document.getElementById('btn-gas');
    const btnBrake = document.getElementById('btn-brake');
    const btnJump = document.getElementById('btn-jump');
    const btnHorn = document.getElementById('btn-horn');

    // Botones táctiles de Pista
    const btnLaneLeft = document.getElementById('btn-lane-left');
    const btnLaneRight = document.getElementById('btn-lane-right');
    const btnLaneHorn = document.getElementById('btn-lane-horn');

    let currentScreen = 'menu'; // 'menu', 'hills', 'lanes'
    let hillsGame = null;
    let lanesGame = null;
    let lastTime = performance.now();

    // 1. Ajuste Dinámico del Canvas
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Activar audio con el primer toque o click
    window.addEventListener('pointerdown', () => {
        if (window.soundController) window.soundController.init();
    }, { once: true });

    // 2. Inicializar Juegos
    hillsGame = new HillsGame(canvas, () => showScreen('menu'));
    lanesGame = new LanesGame(canvas, () => showScreen('menu'));

    // 3. Cambio de Pantalla
    function showScreen(screen) {
        currentScreen = screen;
        if (screen === 'menu') {
            menuScreen.style.display = 'flex';
            controlsHills.style.display = 'none';
            controlsLanes.style.display = 'none';
            if (window.soundController) {
                window.soundController.stopEngine();
                window.soundController.startBgMusic();
            }
        } else if (screen === 'hills') {
            menuScreen.style.display = 'none';
            controlsHills.style.display = 'flex';
            controlsLanes.style.display = 'none';
            hillsGame.resetGame();
            if (window.soundController) {
                window.soundController.stopBgMusic();
                window.soundController.startEngine();
                window.soundController.speak("¡A toda velocidad!");
            }
        } else if (screen === 'lanes') {
            menuScreen.style.display = 'none';
            controlsHills.style.display = 'none';
            controlsLanes.style.display = 'flex';
            if (window.soundController) {
                window.soundController.stopBgMusic();
                window.soundController.startEngine();
            }
            lanesGame.initRoad();
        }
    }

    // 4. Selección de Personajes y Colores
    ridersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.rider-btn');
        if (!btn) return;
        document.querySelectorAll('.rider-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        GAME_CONFIG.selectedRider = btn.dataset.rider;

        if (window.soundController) {
            window.soundController.playJump();
            const riderNames = {
                perrito: "¡Guau guau! ¡Perrito listo!",
                gatito: "¡Miau! ¡Gatito veloz!",
                dino: "¡Roar! ¡Dino turbo!",
                osito: "¡Hola! ¡Osito preparado!"
            };
            window.soundController.speak(riderNames[btn.dataset.rider] || "¡Listo!");
        }
    });

    colorsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.color-btn');
        if (!btn) return;
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        GAME_CONFIG.selectedColor = btn.dataset.color;

        if (window.soundController) {
            window.soundController.playStar();
        }
    });

    // 5. Botones de Menú y Acciones
    cardHills.addEventListener('click', () => showScreen('hills'));
    cardLanes.addEventListener('click', () => showScreen('lanes'));

    btnHome.addEventListener('click', () => showScreen('menu'));

    btnSound.addEventListener('click', () => {
        if (window.soundController) {
            const isMuted = window.soundController.toggleMute();
            soundIcon.textContent = isMuted ? '🔇' : '🔊';
        }
    });

    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    });

    if (btnQr && qrModal) {
        btnQr.addEventListener('click', () => {
            qrModal.style.display = 'flex';
        });
        if (btnCloseQr) {
            btnCloseQr.addEventListener('click', () => {
                qrModal.style.display = 'none';
            });
        }
        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) qrModal.style.display = 'none';
        });
    }

    // 6. Controles Táctiles y de Ratón (Juego 1: Colinas)
    const setupHoldButton = (btn, onStart, onEnd) => {
        const start = (e) => {
            e.preventDefault();
            onStart();
        };
        const end = (e) => {
            e.preventDefault();
            onEnd();
        };
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
        btn.addEventListener('mouseleave', end);
        btn.addEventListener('touchstart', start, { passive: false });
        btn.addEventListener('touchend', end, { passive: false });
        btn.addEventListener('touchcancel', end, { passive: false });
    };

    setupHoldButton(btnGas, 
        () => { if (hillsGame) hillsGame.keys.gas = true; }, 
        () => { if (hillsGame) hillsGame.keys.gas = false; }
    );

    setupHoldButton(btnBrake, 
        () => { if (hillsGame) hillsGame.keys.brake = true; }, 
        () => { if (hillsGame) hillsGame.keys.brake = false; }
    );

    btnJump.addEventListener('click', (e) => {
        e.preventDefault();
        if (hillsGame) hillsGame.boostJump();
    });

    btnHorn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.soundController) window.soundController.playHorn();
    });

    // Controles Táctiles (Juego 2: Pista de Esquivar)
    btnLaneLeft.addEventListener('click', (e) => {
        e.preventDefault();
        if (lanesGame) lanesGame.moveLeft();
    });

    btnLaneRight.addEventListener('click', (e) => {
        e.preventDefault();
        if (lanesGame) lanesGame.moveRight();
    });

    if (btnLaneHorn) {
        btnLaneHorn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.soundController) window.soundController.playHorn();
        });
    }

    // 7. Controles de Teclado (Ideal para PC / Laptop)
    window.addEventListener('keydown', (e) => {
        if (currentScreen === 'hills' && hillsGame) {
            if (e.code === 'ArrowRight' || e.code === 'KeyD') hillsGame.keys.gas = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') hillsGame.keys.brake = true;
            if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') hillsGame.boostJump();
            if (e.code === 'KeyH' || e.code === 'KeyB') {
                if (window.soundController) window.soundController.playHorn();
            }
        } else if (currentScreen === 'lanes' && lanesGame) {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') lanesGame.moveLeft();
            if (e.code === 'ArrowRight' || e.code === 'KeyD') lanesGame.moveRight();
            if (e.code === 'KeyH' || e.code === 'KeyB' || e.code === 'Space') {
                if (window.soundController) window.soundController.playHorn();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (currentScreen === 'hills' && hillsGame) {
            if (e.code === 'ArrowRight' || e.code === 'KeyD') hillsGame.keys.gas = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') hillsGame.keys.brake = false;
        }
    });

    // 8. Clicks en el Canvas (para botones de Victoria dentro del juego)
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (currentScreen === 'hills' && hillsGame) {
            hillsGame.handleClick(clickX, clickY);
        } else if (currentScreen === 'lanes' && lanesGame) {
            lanesGame.handleClick(clickX, clickY);
        }
    });

    // 9. Bucle Principal de Render y Actualización (60 FPS)
    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        if (currentScreen === 'hills' && hillsGame) {
            hillsGame.update(dt);
            hillsGame.draw();
        } else if (currentScreen === 'lanes' && lanesGame) {
            lanesGame.update(dt);
            lanesGame.draw();
        }

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    // Comenzar con el menú principal
    showScreen('menu');
});
