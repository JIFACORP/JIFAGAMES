// js/game-lanes.js - Gran Premio de F1 Animado de Chile para Niños

class LanesGame {
    constructor(canvas, onBackToMenu) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBackToMenu = onBackToMenu;

        this.lanes = [0, 1, 2];
        this.targetLane = 1;
        this.currentLane = 1;
        this.playerX = 0;
        this.playerY = 0;
        this.tilt = 0;

        this.scrollOffset = 0;
        this.baseSpeed = 5.0; // Velocidad ajustada para ~60-65 segundos
        this.currentSpeed = 5.0;
        this.raceDistance = 0;

        // PISTAS INSPIRADAS EN LA GEOGRAFÍA CHILENA 🇨🇱
        this.tracks = [
            {
                id: 1,
                name: "Desierto de Atacama",
                location: "Norte de Chile 🏜️",
                info: "Dunas doradas, cactus candelabro y flamencos",
                groundColor: "#E2903B",
                groundBorderColor: "#C97524",
                asphaltColor: "#2B2520",
                kerbColor1: "#D50000",
                kerbColor2: "#FFFFFF",
                finishDistance: 18000, // ~60 segundos a 300px/s (60 fps)
                decorations: ['cactus', 'flamingo', 'llama']
            },
            {
                id: 2,
                name: "Cordillera de los Andes",
                location: "Farellones / Zona Central 🏔️",
                info: "Cumbres nevadas, rocas cordilleranas y cóndores",
                groundColor: "#DCE7EF",
                groundBorderColor: "#B7CCD8",
                asphaltColor: "#2A3038",
                kerbColor1: "#FFD600",
                kerbColor2: "#1A1A1A",
                finishDistance: 18500,
                decorations: ['snowtree', 'condor', 'mountainrock']
            },
            {
                id: 3,
                name: "Bosques y Araucarias del Sur",
                location: "Araucanía y Lagos 🌲",
                info: "Araucarias milenarias, lagos azules y volcán nevado",
                groundColor: "#2E7D32",
                groundBorderColor: "#1B5E20",
                asphaltColor: "#202621",
                kerbColor1: "#D50000",
                kerbColor2: "#FFFFFF",
                finishDistance: 19000,
                decorations: ['araucaria', 'lake', 'pudu']
            },
            {
                id: 4,
                name: "Glaciares de la Patagonia",
                location: "Torres del Paine / Magallanes ❄️",
                info: "Torres del Paine, témpanos de hielo y pingüinos",
                groundColor: "#CFD8DC",
                groundBorderColor: "#90A4AE",
                asphaltColor: "#1B222C",
                kerbColor1: "#00E5FF",
                kerbColor2: "#FFFFFF",
                finishDistance: 19500,
                decorations: ['iceberg', 'penguin', 'torrespaine']
            }
        ];

        this.currentTrackIndex = 0;

        this.turboTimer = 0;    // Duración muy breve (flechas de velocidad)
        this.skidTimer = 0;     // Duración de frenada (charco de aceite)

        // EXACTAMENTE 2 ITEMS EN PISTA: 'oil' y 'speed'
        this.items = [];
        this.rivals = [];
        this.particles = [];
        this.confetti = [];

        this.playerRank = 6;    // Comienza en 6º lugar
        this.totalRacers = 6;
        this.won = false;
        this.itemSpawnTimer = 0;

        this.sideDecorations = [];
        this.initRoad();
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    initRoad() {
        const track = this.getCurrentTrack();
        this.raceDistance = 0;
        this.scrollOffset = 0;
        this.targetLane = 1;
        this.currentLane = 1;
        this.playerRank = 6;
        this.won = false;
        this.turboTimer = 0;
        this.skidTimer = 0;
        this.items = [];
        this.particles = [];
        this.confetti = [];
        this.itemSpawnTimer = 0;

        const totalDist = track.finishDistance;

        // 5 AUTOS RIVALES DE F1 DISTRIBUIDOS A LO LARGO DEL MINUTO DE CARRERA
        // Cada ~12 segundos el niño alcanza y adelanta a un rival
        this.rivals = [
            {
                id: 5,
                name: 'Verde Turbo',
                color: '#006F62',
                number: 14,
                rider: 'leon',
                distance: totalDist * 0.13, // ~2400 (alrededor del segundo 8-10)
                lane: 0,
                speedOffset: -0.7,
                overtaken: false,
                wobble: 0
            },
            {
                id: 4,
                name: 'Papaya Naranja',
                color: '#FF8000',
                number: 4,
                rider: 'conejo',
                distance: totalDist * 0.33, // ~6000 (alrededor del segundo 20-22)
                lane: 2,
                speedOffset: -0.5,
                overtaken: false,
                wobble: 0
            },
            {
                id: 3,
                name: 'Flecha Turquesa',
                color: '#00D2BE',
                number: 44,
                rider: 'zorro',
                distance: totalDist * 0.55, // ~10000 (alrededor del segundo 34-36)
                lane: 1,
                speedOffset: -0.4,
                overtaken: false,
                wobble: 0
            },
            {
                id: 2,
                name: 'Toro Azul',
                color: '#0600EF',
                number: 33,
                rider: 'tigre',
                distance: totalDist * 0.76, // ~14000 (alrededor del segundo 46-48) -> Entra al PODIO
                lane: 0,
                speedOffset: -0.3,
                overtaken: false,
                wobble: 0
            },
            {
                id: 1,
                name: 'Rayo Rojo',
                color: '#FF1801',
                number: 16,
                rider: 'leon',
                distance: totalDist * 0.92, // ~16500 (alrededor del segundo 56-58) -> ¡LÍDER!
                lane: 1,
                speedOffset: -0.2,
                overtaken: false,
                wobble: 0
            }
        ];

        // Decoraciones chilenas a los costados
        this.sideDecorations = [];
        const decTypes = track.decorations;
        for (let y = -200; y < 1000; y += 130) {
            this.sideDecorations.push({
                y: y,
                side: 'left',
                type: decTypes[Math.floor(Math.random() * decTypes.length)],
                flip: Math.random() > 0.5
            });
            this.sideDecorations.push({
                y: y + 65,
                side: 'right',
                type: decTypes[Math.floor(Math.random() * decTypes.length)],
                flip: Math.random() > 0.5
            });
        }

        // Voz de bienvenida a la pista chilena
        if (window.soundController) {
            window.soundController.speak(`¡Bienvenidos a ${track.name}! ¡A correr por Chile!`);
        }
    }

    getLaneX(laneIndex) {
        const roadW = Math.min(500, this.canvas.width * 0.88);
        const roadLeft = (this.canvas.width - roadW) / 2;
        const laneW = roadW / 3;
        return roadLeft + laneIndex * laneW + laneW / 2;
    }

    moveLeft() {
        if (this.targetLane > 0) {
            this.targetLane--;
            this.tilt = -1.2;
            if (window.soundController) window.soundController.playJump();
        }
    }

    moveRight() {
        if (this.targetLane < 2) {
            this.targetLane++;
            this.tilt = 1.2;
            if (window.soundController) window.soundController.playJump();
        }
    }

    triggerSpeedBoost() {
        this.turboTimer = 55; // Muy breve: aprox 1 segundo de impulso
        this.skidTimer = 0;
        if (window.soundController) {
            window.soundController.playTurbo();
            window.soundController.speak("¡Super velocidad!");
        }
    }

    triggerOilSkid() {
        this.skidTimer = 50;  // Breve frenada de ~0.8s
        this.turboTimer = 0;
        if (window.soundController) {
            window.soundController.playSkid();
            window.soundController.speak("¡Cuidado con el aceite!");
        }
    }

    update(dt) {
        const track = this.getCurrentTrack();

        // 1. CÁLCULO DE VELOCIDAD
        if (this.turboTimer > 0) {
            this.turboTimer--;
            this.currentSpeed = this.baseSpeed * 1.95;
            // Chispas de velocidad y fuego de turbo
            if (Math.random() < 0.7) {
                this.particles.push({
                    x: this.playerX + (Math.random() - 0.5) * 24,
                    y: this.playerY + 40,
                    vx: (Math.random() - 0.5) * 3,
                    vy: 7 + Math.random() * 4,
                    size: 5 + Math.random() * 5,
                    color: ['#00e5ff', '#ffeb3b', '#ff1744', '#ffffff'][Math.floor(Math.random() * 4)],
                    life: 20
                });
            }
        } else if (this.skidTimer > 0) {
            this.skidTimer--;
            this.currentSpeed = this.baseSpeed * 0.45; // Frena momentáneamente
            if (Math.random() < 0.5) {
                this.particles.push({
                    x: this.playerX + (Math.random() - 0.5) * 30,
                    y: this.playerY + 20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 2,
                    size: 6 + Math.random() * 4,
                    color: '#444444',
                    life: 20
                });
            }
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        this.raceDistance += this.currentSpeed;
        this.scrollOffset += this.currentSpeed;

        // Posición del auto del jugador
        const targetX = this.getLaneX(this.targetLane);
        this.playerX += (targetX - this.playerX) * 0.25;
        this.playerY = this.canvas.height - 130;
        this.tilt *= 0.85;

        // Mover decoraciones chilenas
        const decTypes = track.decorations;
        this.sideDecorations.forEach((d) => {
            d.y += this.currentSpeed;
            if (d.y > this.canvas.height + 70) {
                d.y = -80;
                d.type = decTypes[Math.floor(Math.random() * decTypes.length)];
                d.flip = Math.random() > 0.5;
            }
        });

        // 2. GENERACIÓN DE LOS 2 ITEMS ÚNICOS: Aceite y Flechas de Velocidad
        this.itemSpawnTimer++;
        if (this.itemSpawnTimer > (this.turboTimer > 0 ? 50 : 70)) {
            this.itemSpawnTimer = 0;
            const lane = Math.floor(Math.random() * 3);
            const type = Math.random() < 0.52 ? 'speed' : 'oil';

            this.items.push({
                x: this.getLaneX(lane),
                y: -70,
                type: type,
                lane: lane,
                hit: false
            });
        }

        // Colisión de items con el jugador
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += this.currentSpeed;

            const dx = Math.abs(item.x - this.playerX);
            const dy = Math.abs(item.y - this.playerY);

            if (dx < 38 && dy < 42 && !item.hit) {
                item.hit = true;
                if (item.type === 'speed') {
                    this.triggerSpeedBoost();
                } else if (item.type === 'oil') {
                    this.triggerOilSkid();
                }
            }

            if (item.y > this.canvas.height + 100) {
                this.items.splice(i, 1);
            }
        }

        // 3. ACTUALIZAR AUTOS RIVALES DE F1
        this.rivals.forEach((rival) => {
            rival.distance += this.baseSpeed + rival.speedOffset;

            const relativeDist = rival.distance - this.raceDistance;
            rival.screenY = this.playerY - relativeDist * 0.9;
            rival.screenX = this.getLaneX(rival.lane);

            // Cambio de carril suave ocasional
            if (Math.random() < 0.006) {
                rival.lane = Math.floor(Math.random() * 3);
            }

            if (rival.wobble > 0) rival.wobble--;

            // COMPROBAR ADELANTAMIENTO
            if (!rival.overtaken && this.raceDistance >= rival.distance) {
                rival.overtaken = true;
                this.playerRank = Math.max(1, this.playerRank - 1);

                if (window.soundController) {
                    window.soundController.playTurbo();
                    const rankMessages = {
                        5: "¡Adelantaste al auto verde!",
                        4: "¡Muy bien! ¡Ya vas cuarto!",
                        3: "¡Genial! ¡ENTRASTE AL PODIO!",
                        2: "¡Excelente! ¡Vas segundo!",
                        1: "¡Increíble! ¡VAS PRIMERO, CAMPEÓN!"
                    };
                    window.soundController.speak(rankMessages[this.playerRank] || "¡Adelantaste!");
                }

                // Chispas de adelantamiento
                for (let p = 0; p < 16; p++) {
                    this.particles.push({
                        x: rival.screenX,
                        y: rival.screenY,
                        vx: (Math.random() - 0.5) * 7,
                        vy: (Math.random() - 0.5) * 7,
                        size: 5 + Math.random() * 4,
                        color: ['#FFCC00', '#FF3B30', '#00E5FF', '#34C759'][Math.floor(Math.random() * 4)],
                        life: 25
                    });
                }
            }

            // CHOQUE AMISTOSO ESTILO AUTITO CHOCADOR
            if (Math.abs(rival.screenY - this.playerY) < 55 && Math.abs(rival.screenX - this.playerX) < 42) {
                rival.wobble = 20;
                if (this.playerX < rival.screenX) {
                    rival.lane = Math.min(2, rival.lane + 1);
                } else {
                    rival.lane = Math.max(0, rival.lane - 1);
                }

                if (window.soundController) window.soundController.playJump();

                for (let p = 0; p < 6; p++) {
                    this.particles.push({
                        x: (this.playerX + rival.screenX) / 2,
                        y: (this.playerY + rival.screenY) / 2,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        size: 4 + Math.random() * 3,
                        color: '#FFCC00',
                        life: 18
                    });
                }
            }
        });

        // 4. LLEGADA A LA META
        if (this.raceDistance >= track.finishDistance && !this.won) {
            this.won = true;
            const reachedPodium = this.playerRank <= 3;

            if (window.soundController) {
                window.soundController.playWin();
                if (reachedPodium) {
                    if (this.playerRank === 1) {
                        window.soundController.speak("¡Llegaste en PRIMER LUGAR! ¡Eres el campeón!");
                    } else if (this.playerRank === 2) {
                        window.soundController.speak("¡Segundo lugar! ¡Gran podio en Chile!");
                    } else {
                        window.soundController.speak("¡Tercer lugar! ¡Llegaste al podio!");
                    }
                } else {
                    window.soundController.speak(`¡Gran carrera! Terminaste en la posición ${this.playerRank}.`);
                }
            }

            // Confeti de fiesta
            for (let i = 0; i < 90; i++) {
                this.confetti.push({
                    x: (this.canvas.width * 0.15) + Math.random() * (this.canvas.width * 0.7),
                    y: -Math.random() * 200,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 2 + Math.random() * 3.5,
                    size: 8 + Math.random() * 7,
                    color: ['#0039A6', '#D52B1E', '#FFFFFF', '#FFD700', '#00E5FF'][Math.floor(Math.random() * 5)], // Colores chilenos + oro
                    rotation: Math.random() * Math.PI
                });
            }
        }

        // Actualizar confeti
        this.confetti.forEach((c) => {
            c.y += c.vy;
            c.x += c.vx;
            c.rotation += 0.05;
        });

        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Sonido de motor
        if (window.soundController) {
            window.soundController.updateEngine(this.currentSpeed / 8, true);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const track = this.getCurrentTrack();

        ctx.clearRect(0, 0, w, h);

        const roadW = Math.min(500, w * 0.88);
        const roadLeft = (w - roadW) / 2;
        const roadRight = roadLeft + roadW;
        const laneW = roadW / 3;

        // 1. Suelo del paisaje chileno a los lados
        ctx.fillStyle = track.groundColor;
        ctx.fillRect(0, 0, w, h);

        // Borde exterior del suelo
        ctx.fillStyle = track.groundBorderColor;
        ctx.fillRect(roadLeft - 22, 0, 8, h);
        ctx.fillRect(roadRight + 14, 0, 8, h);

        // Decoraciones chilenas en el paisaje
        this.sideDecorations.forEach((d) => {
            const dx = d.side === 'left' ? roadLeft - 52 : roadRight + 52;
            this.drawChileanDecoration(ctx, dx, d.y, d.type, d.flip);
        });

        // 2. Pianos de F1
        this.drawKerbs(ctx, roadLeft - 14, 14, h, track.kerbColor1, track.kerbColor2);
        this.drawKerbs(ctx, roadRight, 14, h, track.kerbColor1, track.kerbColor2);

        // 3. Asfalto de la Pista
        ctx.fillStyle = track.asphaltColor;
        ctx.fillRect(roadLeft, 0, roadW, h);

        // Líneas blancas laterales
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(roadLeft, 0, 5, h);
        ctx.fillRect(roadRight - 5, 0, 5, h);

        // Líneas discontinuas entre carriles
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.setLineDash([35, 25]);
        ctx.lineDashOffset = -this.scrollOffset;

        ctx.beginPath();
        ctx.moveTo(roadLeft + laneW, 0);
        ctx.lineTo(roadLeft + laneW, h);
        ctx.moveTo(roadLeft + laneW * 2, 0);
        ctx.lineTo(roadLeft + laneW * 2, h);
        ctx.stroke();

        ctx.setLineDash([]);

        // 4. LÍNEA DE META CUADRICULADA
        const finishScreenY = this.playerY - (track.finishDistance - this.raceDistance) * 0.9;
        if (finishScreenY > -100 && finishScreenY < h + 100) {
            this.drawFinishCheckeredLine(ctx, roadLeft, finishScreenY, roadW);
        }

        // 5. DIBUJAR LOS 2 ITEMS (Aceite y Flechas de Velocidad)
        this.items.forEach((item) => {
            if (item.hit) return;
            if (item.type === 'speed') {
                this.drawSpeedArrows(ctx, item.x, item.y);
            } else if (item.type === 'oil') {
                this.drawOilPuddle(ctx, item.x, item.y);
            }
        });

        // 6. DIBUJAR AUTOS RIVALES DE F1
        this.rivals.forEach((rival) => {
            if (rival.screenY > -120 && rival.screenY < h + 120) {
                let rx = rival.screenX;
                if (rival.wobble > 0) {
                    rx += Math.sin(rival.wobble * 0.8) * 8;
                }
                drawCartoonF1Car(ctx, rx, rival.screenY, rival.color, rival.number, rival.rider, 0, true, false, rival.wobble > 0);
            }
        });

        // 7. PARTÍCULAS
        this.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 8. AUTO DE F1 DEL JUGADOR
        let px = this.playerX;
        if (this.skidTimer > 0) {
            px += Math.sin(this.skidTimer * 0.9) * 7;
        }

        drawCartoonF1Car(
            ctx, 
            px, 
            this.playerY, 
            GAME_CONFIG.selectedColor, 
            1, 
            GAME_CONFIG.selectedRider, 
            this.tilt, 
            true, 
            this.turboTimer > 0, 
            this.skidTimer > 0
        );

        // 9. Confeti si terminó la carrera
        if (this.won) {
            this.confetti.forEach((c) => {
                ctx.save();
                ctx.translate(c.x, c.y);
                ctx.rotate(c.rotation);
                ctx.fillStyle = c.color;
                ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 1.3);
                ctx.restore();
            });
        }

        // 10. HUD Y BARRA DE PROGRESO DE 1 MINUTO
        this.drawHUD(ctx, w);

        // 11. PANTALLA DE PODIO / VICTORIA
        if (this.won) {
            this.drawPodiumScreen(ctx, w, h);
        }
    }

    // Pianos con colores personalizados por pista
    drawKerbs(ctx, x, w, h, col1, col2) {
        const segH = 26;
        const offset = Math.floor(this.scrollOffset % (segH * 2));
        for (let y = -segH * 2; y < h + segH * 2; y += segH) {
            const isFirst = Math.floor((y + offset) / segH) % 2 === 0;
            ctx.fillStyle = isFirst ? col1 : col2;
            ctx.fillRect(x, y + offset, w, segH);
        }
    }

    // ITEM 1: Flechas de Velocidad (Turbo Pad)
    drawSpeedArrows(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        const anim = (Date.now() * 0.008) % 1;

        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        ctx.beginPath();
        ctx.roundRect(-22, -32, 44, 64, 10);
        ctx.fill();

        for (let i = 0; i < 3; i++) {
            const arrowY = 16 - i * 18 - anim * 6;
            ctx.fillStyle = '#00E5FF';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.moveTo(0, arrowY - 12);
            ctx.lineTo(16, arrowY);
            ctx.lineTo(7, arrowY);
            ctx.lineTo(7, arrowY + 8);
            ctx.lineTo(-7, arrowY + 8);
            ctx.lineTo(-7, arrowY);
            ctx.lineTo(-16, arrowY);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    // ITEM 2: Charco de Aceite (Frena)
    drawOilPuddle(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 18, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-16, 6, 8, 0, Math.PI * 2);
        ctx.arc(18, -4, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(175, 82, 222, 0.65)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-4, -2, 14, 0.2, Math.PI * 0.9);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(6, 3, 10, Math.PI * 0.8, Math.PI * 1.6);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-8, -5, 5, 2.5, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // DIBUJO DE ELEMENTOS CHILENOS
    drawChileanDecoration(ctx, x, y, type, flip) {
        ctx.save();
        ctx.translate(x, y);
        if (flip) ctx.scale(-1, 1);

        if (type === 'cactus') {
            // Cactus candelabro chileno
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.roundRect(-6, -30, 12, 60, 5); // Tallo principal
            // Brazo izq
            ctx.roundRect(-18, -12, 14, 6, 3);
            ctx.roundRect(-18, -24, 6, 14, 3);
            // Brazo der
            ctx.roundRect(4, -6, 14, 6, 3);
            ctx.roundRect(12, -18, 6, 14, 3);
            ctx.fill();
        } else if (type === 'flamingo') {
            // Flamenco andino rosado
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2); // Cuerpo
            ctx.fill();
            // Cuello largo en S
            ctx.strokeStyle = '#FF4081';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(8, -2);
            ctx.quadraticCurveTo(14, -14, 10, -22);
            ctx.stroke();
            // Cabeza
            ctx.beginPath();
            ctx.arc(10, -22, 4, 0, Math.PI * 2);
            ctx.fill();
            // Pico
            ctx.fillStyle = '#222';
            ctx.fillRect(10, -21, 5, 2);
            // Patas
            ctx.strokeStyle = '#FF80AB';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-2, 6); ctx.lineTo(-2, 22);
            ctx.moveTo(4, 6); ctx.lineTo(4, 22);
            ctx.stroke();
        } else if (type === 'llama') {
            // Llama / Vicuña andina tierna
            ctx.fillStyle = '#FFF8E7';
            ctx.beginPath();
            ctx.roundRect(-12, -4, 24, 16, 6); // Cuerpo
            ctx.fill();
            // Cuello
            ctx.roundRect(6, -20, 8, 18, 4);
            ctx.fill();
            // Cabeza
            ctx.beginPath();
            ctx.arc(10, -22, 6, 0, Math.PI * 2);
            ctx.fill();
            // Orejas
            ctx.fillRect(8, -28, 2, 6);
            ctx.fillRect(12, -28, 2, 6);
            // Patas
            ctx.fillStyle = '#E0D6C3';
            ctx.fillRect(-10, 12, 4, 10);
            ctx.fillRect(6, 12, 4, 10);
            // Collar andino colorido
            ctx.fillStyle = '#D50000';
            ctx.fillRect(7, -12, 7, 3);
        } else if (type === 'araucaria') {
            // Araucaria chilena (árbol paraguas nativo)
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(-4, -10, 8, 40); // Tronco rugoso
            // Copa en forma de paraguas
            ctx.fillStyle = '#1B5E20';
            ctx.beginPath();
            ctx.arc(0, -22, 22, Math.PI, 0); // Semicírculo arriba
            ctx.lineTo(0, -10);
            ctx.closePath();
            ctx.fill();
            // Ramas colgantes características
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 3;
            for (let i = -3; i <= 3; i++) {
                ctx.beginPath();
                ctx.moveTo(i * 6, -18);
                ctx.lineTo(i * 8, -6);
                ctx.stroke();
            }
        } else if (type === 'lake') {
            // Lago azul sureño
            ctx.fillStyle = '#0288D1';
            ctx.beginPath();
            ctx.ellipse(0, 0, 24, 14, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4FC3F7';
            ctx.beginPath();
            ctx.ellipse(-4, -2, 10, 5, -0.2, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'pudu') {
            // Pudú tierno con banderita chilena 🇨🇱
            ctx.fillStyle = '#795548';
            ctx.beginPath();
            ctx.ellipse(0, 0, 11, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabecita
            ctx.beginPath();
            ctx.arc(8, -8, 6, 0, Math.PI * 2);
            ctx.fill();
            // Orejitas
            ctx.fillRect(6, -15, 2, 4);
            ctx.fillRect(10, -15, 2, 4);
            // Banderita chilena
            this.drawChileanFlagMini(ctx, 14, -18);
        } else if (type === 'snowtree') {
            // Pino nevado cordillerano
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(-3, 8, 6, 16);
            ctx.fillStyle = '#37474F';
            ctx.beginPath();
            ctx.moveTo(0, -24); ctx.lineTo(16, 8); ctx.lineTo(-16, 8);
            ctx.closePath();
            ctx.fill();
            // Nieve blanca
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(0, -24); ctx.lineTo(8, -10); ctx.lineTo(-8, -10);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'condor') {
            // Cóndor andino volando
            ctx.fillStyle = '#1A1A1A';
            ctx.beginPath();
            ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2); // Alas extendidas
            ctx.fill();
            // Collar blanco del cóndor
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(4, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'mountainrock') {
            // Roca cordillerana
            ctx.fillStyle = '#78909C';
            ctx.beginPath();
            ctx.moveTo(-16, 16); ctx.lineTo(0, -14); ctx.lineTo(16, 16);
            ctx.closePath();
            ctx.fill();
            // Cima con nieve
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(0, -14); ctx.lineTo(6, -4); ctx.lineTo(-6, -4);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'penguin') {
            // Pingüino de Magallanes animando
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(0, 0, 9, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pancita blanca
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.ellipse(2, 2, 5, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            // Patitas naranjas
            ctx.fillStyle = '#FF9800';
            ctx.fillRect(-4, 14, 4, 3);
            ctx.fillRect(2, 14, 4, 3);
            // Pico
            ctx.fillRect(8, -8, 4, 3);
            // Banderita chilena
            this.drawChileanFlagMini(ctx, 12, -14);
        } else if (type === 'iceberg') {
            // Témpano de hielo azul
            ctx.fillStyle = '#81D4FA';
            ctx.beginPath();
            ctx.moveTo(-14, 12); ctx.lineTo(-6, -16); ctx.lineTo(4, -12); ctx.lineTo(14, 12);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#E1F5FE';
            ctx.beginPath();
            ctx.moveTo(-6, -16); ctx.lineTo(4, -12); ctx.lineTo(0, -2);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'torrespaine') {
            // Los 3 cuernos / torres de piedra
            ctx.fillStyle = '#546E7A';
            ctx.fillRect(-14, -20, 8, 36);
            ctx.fillRect(-4, -28, 8, 44);
            ctx.fillRect(6, -16, 8, 32);
        }

        ctx.restore();
    }

    drawChileanFlagMini(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // Asta
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, 14);
        ctx.stroke();
        // Bandera Chilena
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1, 0, 14, 4);
        ctx.fillStyle = '#D52B1E'; ctx.fillRect(1, 4, 14, 4);
        ctx.fillStyle = '#0039A6'; ctx.fillRect(1, 0, 5, 4);
        // Estrellita blanca
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(3.5, 2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawFinishCheckeredLine(ctx, x, y, w) {
        const sq = 18;
        const rows = 3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < w; c += sq) {
                const isBlack = (Math.floor(c / sq) + r) % 2 === 0;
                ctx.fillStyle = isBlack ? '#111111' : '#FFFFFF';
                ctx.fillRect(x + c, y + r * sq, sq, sq);
            }
        }
    }

    // HUD CON LA BARRA DE PROGRESO DE 1 MINUTO Y NOMBRE DE PISTA CHILENA
    drawHUD(ctx, w) {
        const track = this.getCurrentTrack();

        // 1. Placa de Posición (Ej: 1º / 6)
        const isPodium = this.playerRank <= 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = this.playerRank === 1 ? '#FFD700' : (isPodium ? '#00E5FF' : '#FF9500');
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(16, 16, 165, 52, 26);
        ctx.fill();
        ctx.stroke();

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.playerRank === 1 ? '🏆' : (isPodium ? '🥇' : '🏎️'), 26, 50);

        ctx.fillStyle = '#222';
        ctx.font = 'bold 21px "Comic Sans MS", cursive, sans-serif';
        ctx.fillText(`${this.playerRank}º Lugar`, 68, 50);

        // 2. BARRA DE PROGRESO PROMINENTE (1 MINUTO DE CARRERA)
        const barW = Math.min(380, w * 0.46);
        const barX = (w - barW) / 2;
        const barY = 22;
        const barH = 22;

        // Título de la pista arriba de la barra
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6);
        ctx.fillText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6);

        // Fondo de la barra con patrón de asfalto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 11);
        ctx.fill();
        ctx.stroke();

        // Relleno de progreso
        const progress = Math.min(1, Math.max(0, this.raceDistance / track.finishDistance));
        if (progress > 0.02) {
            const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            progGrad.addColorStop(0, '#00E5FF');
            progGrad.addColorStop(0.7, '#FFD700');
            progGrad.addColorStop(1, '#34C759');

            ctx.fillStyle = progGrad;
            ctx.beginPath();
            ctx.roundRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4, 9);
            ctx.fill();
        }

        // Mini autito de F1 en la barra de progreso
        const carProgressX = barX + (barW - 20) * progress;
        ctx.font = '18px sans-serif';
        ctx.fillText('🏎️', carProgressX, barY + 17);

        // Bandera a cuadros de meta
        ctx.fillText('🏁', barX + barW + 12, barY + 17);

        // 3. Indicador de Estado (Turbo o Aceite)
        if (this.turboTimer > 0) {
            ctx.fillStyle = '#00E5FF';
            ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚡ ¡TURBO! ⚡', w / 2, barY + barH + 24);
        } else if (this.skidTimer > 0) {
            ctx.fillStyle = '#FF9500';
            ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ ¡ACEITE! ⚠️', w / 2, barY + barH + 24);
        }
    }

    // PANTALLA DE PODIO Y AVANCE DE PISTA CHILENA
    drawPodiumScreen(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, w, h);

        const bannerW = Math.min(540, w - 30);
        const bannerH = 360;
        const bx = (w - bannerW) / 2;
        const by = (h - bannerH) / 2;

        const track = this.getCurrentTrack();
        const reachedPodium = this.playerRank <= 3;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = reachedPodium ? '#FFD700' : '#FF9500';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(bx, by, bannerW, bannerH, 28);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';

        if (reachedPodium) {
            // ¡Llegó al podio!
            const medalEmoji = this.playerRank === 1 ? '🏆' : (this.playerRank === 2 ? '🥈' : '🥉');
            ctx.font = '50px sans-serif';
            ctx.fillText(medalEmoji, w / 2, by + 65);

            ctx.fillStyle = '#D52B1E';
            ctx.font = 'bold 28px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('🇨🇱 ¡PODIO EN CHILE! 🇨🇱', w / 2, by + 110);

            ctx.fillStyle = '#222';
            ctx.font = 'bold 21px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`¡Terminaste en ${this.playerRank}º Lugar en ${track.name}!`, w / 2, by + 145);

            // DIBUJO DEL PODIO (Cajones 2º, 1º, 3º)
            this.drawPodiumSteps(ctx, w / 2, by + 230);

            // Botón Siguiente Pista o Coronación de Campeón
            const isLastTrack = this.currentTrackIndex >= this.tracks.length - 1;
            const btnText = isLastTrack ? '🇨🇱 ¡Campeón de Chile! Jugar de Nuevo 🏆' : '🚀 ¡Avanzar a Siguiente Pista! 🇨🇱';

            this.actionBtn = { x: bx + 40, y: by + 275, w: bannerW - 80, h: 62, action: isLastTrack ? 'restart' : 'next' };

            ctx.fillStyle = '#34C759';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 30);
            ctx.fill();
            ctx.strokeStyle = '#28A745';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 21px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(btnText, w / 2, by + 314);
        } else {
            // No llegó al podio (4º, 5º o 6º)
            ctx.font = '50px sans-serif';
            ctx.fillText('🏎️', w / 2, by + 65);

            ctx.fillStyle = '#FF9500';
            ctx.font = 'bold 26px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('¡CASI LLEGAS AL PODIO!', w / 2, by + 115);

            ctx.fillStyle = '#444';
            ctx.font = 'bold 18px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`Terminaste en ${this.playerRank}º Lugar.`, w / 2, by + 155);
            ctx.fillText('¡Para avanzar a la siguiente pista debes llegar 1º, 2º o 3º!', w / 2, by + 185);

            // Botón Reintentar Pista
            this.actionBtn = { x: bx + 50, y: by + 245, w: bannerW - 100, h: 65, action: 'retry' };

            ctx.fillStyle = '#007AFF';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 30);
            ctx.fill();
            ctx.strokeStyle = '#0056B3';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('🔄 ¡Intentar de Nuevo!', w / 2, by + 286);
        }
    }

    // Dibujo de los 3 cajones del podio
    drawPodiumSteps(ctx, cx, cy) {
        ctx.save();
        // 2º Lugar (Izquierda)
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(cx - 100, cy - 35, 60, 45);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('2º', cx - 70, cy - 8);

        // 1º Lugar (Centro - Más alto)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(cx - 35, cy - 55, 70, 65);
        ctx.fillStyle = '#222';
        ctx.fillText('1º 🏆', cx, cy - 18);

        // 3º Lugar (Derecha)
        ctx.fillStyle = '#CD7F32';
        ctx.fillRect(cx + 40, cy - 25, 60, 35);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('3º', cx + 70, cy - 2);

        ctx.restore();
    }

    handleClick(x, y) {
        if (this.won && this.actionBtn) {
            const r = this.actionBtn;
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
                if (r.action === 'next') {
                    // Avanzar a la siguiente pista chilena
                    this.currentTrackIndex++;
                    this.initRoad();
                } else if (r.action === 'restart') {
                    // Volver a la pista 1
                    this.currentTrackIndex = 0;
                    this.initRoad();
                } else if (r.action === 'retry') {
                    // Reintentar la misma pista
                    this.initRoad();
                }
                return true;
            }
        }
        return false;
    }
}

window.LanesGame = LanesGame;
