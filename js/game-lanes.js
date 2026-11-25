// js/game-lanes.js - Gran Premio de F1 de Chile (Motor Pseudo-3D Arcade)

class LanesGame {
    constructor(canvas, onBackToMenu) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBackToMenu = onBackToMenu;

        // PISTAS INSPIRADAS EN LA GEOGRAFÍA CHILENA 🇨🇱
        this.tracks = [
            {
                id: 1,
                name: "Desierto de Atacama",
                location: "Norte de Chile 🏜️",
                skyTop: "#F57C00",
                skyBottom: "#FFE082",
                mountainColor: "#8D4925",
                mountainPeak: "#D7814A",
                groundColor: "#E2903B",
                asphaltColor1: "#2B2622",
                asphaltColor2: "#352E29",
                kerbColor1: "#D50000",
                kerbColor2: "#FFFFFF",
                decorations: ['cactus', 'flamingo', 'llama']
            },
            {
                id: 2,
                name: "Cordillera de los Andes",
                location: "Farellones / Santiago 🏔️",
                skyTop: "#1565C0",
                skyBottom: "#90CAF9",
                mountainColor: "#37474F",
                mountainPeak: "#FFFFFF",
                groundColor: "#DCE7EF",
                asphaltColor1: "#262C33",
                asphaltColor2: "#303740",
                kerbColor1: "#FFD600",
                kerbColor2: "#1A1A1A",
                decorations: ['snowtree', 'condor', 'mountainrock']
            },
            {
                id: 3,
                name: "Lagos y Araucarias",
                location: "Sur de Chile 🌲",
                skyTop: "#0277BD",
                skyBottom: "#80DEEA",
                mountainColor: "#1B5E20",
                mountainPeak: "#E0F2F1",
                groundColor: "#388E3C",
                asphaltColor1: "#1E2620",
                asphaltColor2: "#273129",
                kerbColor1: "#D50000",
                kerbColor2: "#FFFFFF",
                decorations: ['araucaria', 'lake', 'pudu']
            },
            {
                id: 4,
                name: "Glaciares de la Patagonia",
                location: "Torres del Paine / Magallanes ❄️",
                skyTop: "#0D47A1",
                skyBottom: "#81D4FA",
                mountainColor: "#263238",
                mountainPeak: "#B3E5FC",
                groundColor: "#CFD8DC",
                asphaltColor1: "#1A222C",
                asphaltColor2: "#222D3A",
                kerbColor1: "#00E5FF",
                kerbColor2: "#FFFFFF",
                decorations: ['iceberg', 'penguin', 'torrespaine']
            }
        ];

        this.currentTrackIndex = 0;

        // Configuración de la pista 3D
        this.trackLength = 3600; // Distancia de carrera (metros)
        this.segmentLength = 100; // Cada segmento
        this.roadWidth = 1400; // Ancho del camino en 3D
        this.cameraHeight = 700; // Altura de cámara
        this.cameraDepth = 0.82; // Profundidad de campo

        this.initRoad();
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    initRoad() {
        const track = this.getCurrentTrack();

        this.playerX = 0;       // Posición horizontal (-1 = izquierda, 0 = centro, 1 = derecha)
        this.playerZ = 0;       // Distancia recorrida
        this.speed = 0;         // Velocidad actual
        this.targetSpeed = 160; // Velocidad de crucero (~160 km/h)
        this.turboTimer = 0;    // Impulso de turbo (flechas)
        this.skidTimer = 0;     // Derrape en aceite
        this.steerInput = 0;    // -1 = izquierda, 1 = derecha
        this.tilt = 0;          // Inclinación visual del auto

        this.playerRank = 6;    // Comienza en 6º lugar
        this.won = false;
        this.startCountdown = 120; // 2 segundos de semáforo de largada (🔴🔴🔴 -> 🟢🟢🟢)

        this.particles = [];
        this.confetti = [];
        this.overtakePopups = []; // Mensajes de adelantamiento

        // CREAR LOS 5 AUTOS RIVALES A DISTANCIAS ALCANZABLES (100% GANABLE)
        // La velocidad del jugador es ~160 km/h, rivales van a ~115-130 km/h
        // Cada ~10-12 segundos el niño adelanta a un rival
        this.rivals = [
            {
                id: 5,
                name: 'Verde Turbo',
                color: '#006F62',
                number: 14,
                rider: 'leon',
                z: 450,       // Se alcanza hacia los 8-10 segundos
                x: -0.5,
                speed: 110,
                overtaken: false,
                wobble: 0
            },
            {
                id: 4,
                name: 'Papaya Naranja',
                color: '#FF8000',
                number: 4,
                rider: 'conejo',
                z: 1100,      // Se alcanza hacia los 20-22 segundos
                x: 0.5,
                speed: 118,
                overtaken: false,
                wobble: 0
            },
            {
                id: 3,
                name: 'Flecha Turquesa',
                color: '#00D2BE',
                number: 44,
                rider: 'zorro',
                z: 1800,      // Se alcanza hacia los 32-35 segundos -> ¡PODIO 🥉!
                x: -0.4,
                speed: 122,
                overtaken: false,
                wobble: 0
            },
            {
                id: 2,
                name: 'Toro Azul',
                color: '#0600EF',
                number: 33,
                rider: 'tigre',
                z: 2500,      // Se alcanza hacia los 44-46 segundos -> ¡PODIO 🥈!
                x: 0.4,
                speed: 126,
                overtaken: false,
                wobble: 0
            },
            {
                id: 1,
                name: 'Rayo Rojo',
                color: '#FF1801',
                number: 16,
                rider: 'leon',
                z: 3100,      // Se alcanza hacia los 54-56 segundos -> ¡1º LUGAR 🏆!
                x: -0.2,
                speed: 128,
                overtaken: false,
                wobble: 0
            }
        ];

        // CREAR ITEMS EN PISTA (Flechas de Velocidad y Charcos de Aceite)
        this.items = [];
        for (let z = 300; z < this.trackLength - 200; z += 180) {
            const laneX = (Math.random() - 0.5) * 1.3;
            const type = Math.random() < 0.55 ? 'speed' : 'oil';
            this.items.push({
                z: z,
                x: laneX,
                type: type,
                hit: false
            });
        }

        // DECORACIONES DE PAISAJE A LOS COSTADOS
        this.props = [];
        const decTypes = track.decorations;
        for (let z = 100; z < this.trackLength + 400; z += 120) {
            // Lado izquierdo
            this.props.push({
                z: z,
                x: -1.5 - Math.random() * 0.8,
                type: decTypes[Math.floor(Math.random() * decTypes.length)],
                scale: 1
            });
            // Lado derecho
            this.props.push({
                z: z + 60,
                x: 1.5 + Math.random() * 0.8,
                type: decTypes[Math.floor(Math.random() * decTypes.length)],
                scale: 1
            });
        }

        // Sonido de inicio
        if (window.soundController) {
            window.soundController.startEngine();
        }
    }

    // Curva del camino según la distancia Z
    getRoadCurve(z) {
        // Suaves curvas temáticas de Fórmula 1
        return Math.sin(z * 0.002) * 0.8 + Math.sin(z * 0.005) * 0.4;
    }

    // Elevación / colinas suaves del camino
    getRoadHill(z) {
        return Math.sin(z * 0.0018) * 120;
    }

    moveLeft() {
        this.steerInput = -1;
    }

    moveRight() {
        this.steerInput = 1;
    }

    stopSteer() {
        this.steerInput = 0;
    }

    triggerSpeedBoost() {
        this.turboTimer = 65; // ~1.3 segundos de super velocidad
        this.skidTimer = 0;
        if (window.soundController) {
            window.soundController.playTurbo();
        }
        // Popup visual
        this.overtakePopups.push({
            text: '⚡ ¡TURBO! ⚡',
            color: '#00E5FF',
            y: this.canvas.height * 0.45,
            life: 45
        });
    }

    triggerOilSkid() {
        this.skidTimer = 50; // ~1 segundo de frenada
        this.turboTimer = 0;
        if (window.soundController) {
            window.soundController.playSkid();
        }
        this.overtakePopups.push({
            text: '⚠️ ¡ACEITE! ⚠️',
            color: '#FF9500',
            y: this.canvas.height * 0.45,
            life: 40
        });
    }

    update(dt) {
        // 1. SEMÁFORO DE LARGADA (3, 2, 1, ¡YA!)
        if (this.startCountdown > 0) {
            this.startCountdown--;
            if (this.startCountdown === 90 || this.startCountdown === 60 || this.startCountdown === 30) {
                if (window.soundController) window.soundController.playJump();
            }
            if (this.startCountdown === 0) {
                if (window.soundController) window.soundController.playTurbo();
            }
            return;
        }

        if (this.won) {
            // Desacelerar tras la meta
            this.speed *= 0.96;
            this.playerZ += this.speed * 0.04;
            // Actualizar confeti
            this.confetti.forEach((c) => {
                c.y += c.vy;
                c.x += c.vx;
                c.rotation += 0.05;
            });
            return;
        }

        // 2. FÍSICA Y VELOCIDAD DEL JUGADOR
        if (this.turboTimer > 0) {
            this.turboTimer--;
            this.targetSpeed = 230; // 230 km/h en Turbo
        } else if (this.skidTimer > 0) {
            this.skidTimer--;
            this.targetSpeed = 95;  // 95 km/h en Aceite
        } else {
            this.targetSpeed = 160; // 160 km/h de crucero
        }

        // Aceleración suave
        this.speed += (this.targetSpeed - this.speed) * 0.1;
        const speedRatio = this.speed / 160;

        // Avanzar en la pista
        this.playerZ += this.speed * 0.07;

        // Dirección / Volante
        const steerSpeed = 0.038 * (this.turboTimer > 0 ? 1.15 : 1);
        if (this.steerInput !== 0) {
            this.playerX += this.steerInput * steerSpeed;
            this.tilt += (this.steerInput - this.tilt) * 0.25;
        } else {
            this.tilt *= 0.8;
        }

        // Límites laterales de la pista
        this.playerX = Math.max(-0.95, Math.min(0.95, this.playerX));

        // Actualizar sonido de motor
        if (window.soundController) {
            window.soundController.updateEngine(this.speed / 200, true);
        }

        // 3. ACTUALIZAR ITEMS (Colisión con Turbo y Aceite)
        this.items.forEach((item) => {
            if (!item.hit && Math.abs(item.z - this.playerZ) < 25) {
                const distOnRoad = Math.abs(item.x - this.playerX);
                if (distOnRoad < 0.38) {
                    item.hit = true;
                    if (item.type === 'speed') {
                        this.triggerSpeedBoost();
                    } else if (item.type === 'oil') {
                        this.triggerOilSkid();
                    }
                }
            }
        });

        // 4. ACTUALIZAR AUTOS RIVALES Y ADELANTAMIENTOS (100% GANABLE)
        this.rivals.forEach((rival) => {
            // Mover rival hacia adelante a su velocidad constante
            rival.z += rival.speed * 0.055;

            // Suave cambio de carril de los rivales para no ser estáticos
            rival.x += Math.sin(this.playerZ * 0.005 + rival.id) * 0.003;

            // Adelantamiento
            if (!rival.overtaken && this.playerZ >= rival.z) {
                rival.overtaken = true;
                this.playerRank = Math.max(1, this.playerRank - 1);

                if (window.soundController) {
                    window.soundController.playTurbo();
                }

                // Popup grande de adelantamiento
                this.overtakePopups.push({
                    text: `¡${this.playerRank}º LUGAR! 🏆`,
                    color: this.playerRank === 1 ? '#FFD700' : '#00E5FF',
                    y: this.canvas.height * 0.35,
                    life: 60
                });

                // Chispas de adelantamiento
                for (let p = 0; p < 18; p++) {
                    this.particles.push({
                        x: (this.canvas.width / 2) + (Math.random() - 0.5) * 160,
                        y: this.canvas.height * 0.65,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        size: 6 + Math.random() * 4,
                        color: ['#FFD700', '#00E5FF', '#FF3B30', '#FFFFFF'][Math.floor(Math.random() * 4)],
                        life: 25
                    });
                }
            }

            // Choque amistoso si estás muy cerca del rival
            if (Math.abs(rival.z - this.playerZ) < 35 && Math.abs(rival.x - this.playerX) < 0.32) {
                // Rebotar suavemente a los costados
                if (this.playerX < rival.x) {
                    rival.x = Math.min(0.9, rival.x + 0.15);
                    this.playerX = Math.max(-0.9, this.playerX - 0.1);
                } else {
                    rival.x = Math.max(-0.9, rival.x - 0.15);
                    this.playerX = Math.min(0.9, this.playerX + 0.1);
                }
                if (window.soundController) {
                    window.soundController.playJump();
                }
            }
        });

        // 5. LLEGADA A LA META
        if (this.playerZ >= this.trackLength && !this.won) {
            this.won = true;
            if (window.soundController) {
                window.soundController.playWin();
            }

            // Lluvia de confeti chileno y dorado
            for (let i = 0; i < 90; i++) {
                this.confetti.push({
                    x: (this.canvas.width * 0.1) + Math.random() * (this.canvas.width * 0.8),
                    y: -Math.random() * 200,
                    vx: (Math.random() - 0.5) * 5,
                    vy: 2 + Math.random() * 4,
                    size: 8 + Math.random() * 8,
                    color: ['#D52B1E', '#0039A6', '#FFFFFF', '#FFD700', '#00E5FF'][Math.floor(Math.random() * 5)],
                    rotation: Math.random() * Math.PI
                });
            }
        }

        // Actualizar partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Actualizar popups
        for (let i = this.overtakePopups.length - 1; i >= 0; i--) {
            const pop = this.overtakePopups[i];
            pop.y -= 0.6;
            pop.life--;
            if (pop.life <= 0) this.overtakePopups.splice(i, 1);
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const track = this.getCurrentTrack();

        ctx.clearRect(0, 0, w, h);

        const horizonY = h * 0.42; // Altura del horizonte

        // 1. CIELO Y PAISAJE CHILENO AL HORIZONTE
        this.drawSkyAndMountains(ctx, w, h, horizonY, track);

        // 2. MOTOR DE CARRETERA PSEUDO-3D
        this.draw3DRoad(ctx, w, h, horizonY, track);

        // 3. DIBUJAR ITEMS Y ELEMENTOS DE LA PISTA EN 3D
        this.draw3DItems(ctx, w, h, horizonY);

        // 4. DIBUJAR AUTOS RIVALES EN 3D PERSPECTIVA
        this.draw3DRivals(ctx, w, h, horizonY);

        // 5. DIBUJAR AUTO DE F1 DEL JUGADOR (EN PRIMER PLANO)
        this.drawPlayerF1Car(ctx, w, h);

        // 6. LÍNEAS DE VELOCIDAD DINÁMICAS (SPEED LINES)
        if (this.turboTimer > 0 || this.speed > 180) {
            this.drawSpeedLines(ctx, w, h);
        }

        // 7. PARTÍCULAS
        this.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 8. POPUPS DE ADELANTAMIENTO ANIMADOS
        this.overtakePopups.forEach((pop) => {
            ctx.save();
            ctx.font = 'bold 34px "Comic Sans MS", cursive, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = pop.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 5;
            ctx.strokeText(pop.text, w / 2, pop.y);
            ctx.fillText(pop.text, w / 2, pop.y);
            ctx.restore();
        });

        // 9. HUD COMPLETO (Barra de Progreso de 1 Minuto, Posición, Velocímetro)
        this.drawHUD(ctx, w, h);

        // 10. SEMÁFORO DE LARGADA (Si está empezando)
        if (this.startCountdown > 0) {
            this.drawStartLights(ctx, w, h);
        }

        // 11. PANTALLA DE PODIO / VICTORIA
        if (this.won) {
            this.drawPodiumScreen(ctx, w, h);
        }
    }

    // Dibuja el cielo, sol y cordilleras chilenas
    drawSkyAndMountains(ctx, w, h, horizonY, track) {
        // Degradado de cielo
        const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
        skyGrad.addColorStop(0, track.skyTop);
        skyGrad.addColorStop(1, track.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, horizonY);

        // Sol brillante
        ctx.fillStyle = '#FFF9A6';
        ctx.beginPath();
        ctx.arc(w * 0.8, horizonY * 0.35, 38, 0, Math.PI * 2);
        ctx.fill();

        // Cordillera chilena de fondo (Parallax según curvas)
        const curveOffset = this.getRoadCurve(this.playerZ) * 45;

        // Capa de montañas lejanas
        ctx.fillStyle = track.mountainColor;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = -50; x <= w + 50; x += 60) {
            const my = horizonY - 45 - Math.sin((x + curveOffset) * 0.012) * 35 - Math.cos(x * 0.02) * 20;
            ctx.lineTo(x, my);
        }
        ctx.lineTo(w, horizonY);
        ctx.closePath();
        ctx.fill();

        // Cumbres nevadas de la cordillera
        ctx.fillStyle = track.mountainPeak;
        ctx.beginPath();
        for (let x = -50; x <= w + 50; x += 60) {
            const peakY = horizonY - 45 - Math.sin((x + curveOffset) * 0.012) * 35 - Math.cos(x * 0.02) * 20;
            if (peakY < horizonY - 55) {
                ctx.moveTo(x - 20, peakY + 18);
                ctx.lineTo(x, peakY);
                ctx.lineTo(x + 20, peakY + 18);
                ctx.closePath();
            }
        }
        ctx.fill();
    }

    // Renderiza la pista en perspectiva 3D (estilo OutRun / Horizon Chase)
    draw3DRoad(ctx, w, h, horizonY, track) {
        const drawDistance = 45; // Segmentos visibles hacia el horizonte
        const startSeg = Math.floor(this.playerZ / this.segmentLength);

        // Suelo exterior
        ctx.fillStyle = track.groundColor;
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // Proyectar segmentos de adelante hacia atrás
        for (let n = drawDistance; n >= 1; n--) {
            const segIndex = startSeg + n;
            const segZ = segIndex * this.segmentLength;
            const relZ = segZ - this.playerZ;
            if (relZ <= 0) continue;

            const nextSegZ = (segIndex + 1) * this.segmentLength;
            const nextRelZ = nextSegZ - this.playerZ;

            // Proyección matemática de perspectiva
            const scale1 = this.cameraDepth / (relZ * 0.0035);
            const scale2 = this.cameraDepth / (nextRelZ * 0.0035);

            const hill1 = this.getRoadHill(segZ);
            const hill2 = this.getRoadHill(nextSegZ);

            const y1 = Math.min(h, Math.max(horizonY, horizonY + (this.cameraHeight - hill1) * scale1 * 0.0028));
            const y2 = Math.min(h, Math.max(horizonY, horizonY + (this.cameraHeight - hill2) * scale2 * 0.0028));

            const curve1 = this.getRoadCurve(segZ) * 320 * (1 - n / drawDistance);
            const curve2 = this.getRoadCurve(nextSegZ) * 320 * (1 - (n + 1) / drawDistance);

            const playerScreenOffset1 = (this.playerX * this.roadWidth * 0.5) * scale1 * 0.003;
            const playerScreenOffset2 = (this.playerX * this.roadWidth * 0.5) * scale2 * 0.003;

            const x1 = (w / 2) + curve1 - playerScreenOffset1;
            const x2 = (w / 2) + curve2 - playerScreenOffset2;

            const rw1 = this.roadWidth * scale1 * 0.0028;
            const rw2 = this.roadWidth * scale2 * 0.0028;

            const isAlt = (segIndex % 2) === 0;

            // 1. Pianos / Kerbs de F1 (Rojo y blanco)
            const kerbW1 = rw1 * 0.16;
            const kerbW2 = rw2 * 0.16;
            const kerbCol = isAlt ? track.kerbColor1 : track.kerbColor2;

            ctx.fillStyle = kerbCol;
            // Kerb izquierdo
            this.drawTrapezoid(ctx, x1 - rw1 - kerbW1, y1, x1 - rw1, y1, x2 - rw2 - kerbW2, y2, x2 - rw2, y2);
            // Kerb derecho
            this.drawTrapezoid(ctx, x1 + rw1, y1, x1 + rw1 + kerbW1, y1, x2 + rw2, y2, x2 + rw2 + kerbW2, y2);

            // 2. Asfalto de la pista
            ctx.fillStyle = isAlt ? track.asphaltColor1 : track.asphaltColor2;
            this.drawTrapezoid(ctx, x1 - rw1, y1, x1 + rw1, y1, x2 - rw2, y2, x2 + rw2, y2);

            // 3. Líneas blancas de carriles
            if (isAlt) {
                ctx.fillStyle = '#FFFFFF';
                const laneLineWidth1 = rw1 * 0.025;
                const laneLineWidth2 = rw2 * 0.025;
                [-0.33, 0.33].forEach(pos => {
                    const lx1 = x1 + rw1 * pos;
                    const lx2 = x2 + rw2 * pos;
                    this.drawTrapezoid(ctx, lx1 - laneLineWidth1, y1, lx1 + laneLineWidth1, y1, lx2 - laneLineWidth2, y2, lx2 + laneLineWidth2, y2);
                });
            }

            // 4. Línea de Meta Cuadriculada en 3D
            if (Math.abs(segZ - this.trackLength) < this.segmentLength) {
                this.drawCheckeredFinish3D(ctx, x1, y1, rw1, x2, y2, rw2);
            }
        }
    }

    drawTrapezoid(ctx, x1, y1, x2, y1_b, x3, y2, x4, y2_b) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1_b);
        ctx.lineTo(x4, y2_b);
        ctx.lineTo(x3, y2);
        ctx.closePath();
        ctx.fill();
    }

    drawCheckeredFinish3D(ctx, x1, y1, rw1, x2, y2, rw2) {
        const sq = 8;
        for (let i = 0; i < sq; i++) {
            const isBlack = (i % 2) === 0;
            ctx.fillStyle = isBlack ? '#111111' : '#FFFFFF';
            const f1 = (i / sq) * 2 - 1;
            const f2 = ((i + 1) / sq) * 2 - 1;
            this.drawTrapezoid(ctx, x1 + rw1 * f1, y1, x1 + rw1 * f2, y1, x2 + rw2 * f1, y2, x2 + rw2 * f2, y2);
        }
    }

    // Dibuja los 2 items (Turbo y Aceite) y paisajes proyectados en 3D
    draw3DItems(ctx, w, h, horizonY) {
        // Proyectar items visibles delante del jugador
        this.items.forEach((item) => {
            const relZ = item.z - this.playerZ;
            if (relZ > 20 && relZ < 2200) {
                const scale = this.cameraDepth / (relZ * 0.0035);
                const hill = this.getRoadHill(item.z);
                const py = horizonY + (this.cameraHeight - hill) * scale * 0.0028;
                const curve = this.getRoadCurve(item.z) * 320 * (1 - relZ / 2200);
                const roadW = this.roadWidth * scale * 0.0028;
                const playerOffset = (this.playerX * this.roadWidth * 0.5) * scale * 0.003;
                const px = (w / 2) + curve - playerOffset + (item.x * roadW * 0.7);

                const itemScale = scale * 0.0025;

                if (item.type === 'speed') {
                    this.drawSpeedPad3D(ctx, px, py, itemScale);
                } else if (item.type === 'oil') {
                    this.drawOilPuddle3D(ctx, px, py, itemScale);
                }
            }
        });

        // Proyectar elementos del paisaje chileno a los lados
        this.props.forEach((p) => {
            const relZ = p.z - this.playerZ;
            if (relZ > 30 && relZ < 2600) {
                const scale = this.cameraDepth / (relZ * 0.0035);
                const hill = this.getRoadHill(p.z);
                const py = horizonY + (this.cameraHeight - hill) * scale * 0.0028;
                const curve = this.getRoadCurve(p.z) * 320 * (1 - relZ / 2600);
                const roadW = this.roadWidth * scale * 0.0028;
                const playerOffset = (this.playerX * this.roadWidth * 0.5) * scale * 0.003;
                const px = (w / 2) + curve - playerOffset + (p.x * roadW * 0.85);

                const propScale = scale * 0.0032;
                if (px > -100 && px < w + 100 && propScale > 0.1) {
                    this.drawChileanProp(ctx, px, py, p.type, propScale);
                }
            }
        });
    }

    drawSpeedPad3D(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.4, scale * 0.7); // Perspectiva achatada

        // Resplandor neón
        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 15;

        // 3 Flechas en chevron
        for (let i = 0; i < 3; i++) {
            const ay = -i * 24;
            ctx.beginPath();
            ctx.moveTo(0, ay - 18);
            ctx.lineTo(26, ay);
            ctx.lineTo(12, ay);
            ctx.lineTo(12, ay + 12);
            ctx.lineTo(-12, ay + 12);
            ctx.lineTo(-12, ay);
            ctx.lineTo(-26, ay);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    drawOilPuddle3D(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.5, scale * 0.65);

        // Mancha negra brillante con brillo tornasol
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.ellipse(0, 0, 38, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(175, 82, 222, 0.75)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-6, -2, 18, 0.2, Math.PI * 0.8);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(8, 4, 14, Math.PI * 0.7, Math.PI * 1.6);
        ctx.stroke();

        ctx.restore();
    }

    drawChileanProp(ctx, x, y, type, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.8, scale * 1.8);

        if (type === 'cactus') {
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.roundRect(-8, -50, 16, 50, 6);
            ctx.roundRect(-24, -32, 18, 8, 4);
            ctx.roundRect(-24, -44, 8, 16, 4);
            ctx.roundRect(6, -24, 18, 8, 4);
            ctx.roundRect(16, -38, 8, 18, 4);
            ctx.fill();
        } else if (type === 'llama') {
            ctx.fillStyle = '#FFF8E7';
            ctx.beginPath();
            ctx.roundRect(-16, -20, 32, 20, 8);
            ctx.roundRect(8, -42, 10, 24, 5);
            ctx.arc(14, -44, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#E0D6C3';
            ctx.fillRect(-12, 0, 5, 14);
            ctx.fillRect(8, 0, 5, 14);
            ctx.fillStyle = '#D50000';
            ctx.fillRect(9, -30, 9, 4); // Collar andino
        } else if (type === 'flamingo') {
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.ellipse(0, -18, 14, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FF4081';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(8, -20);
            ctx.quadraticCurveTo(16, -34, 12, -44);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(12, -44, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FF80AB';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-2, -9); ctx.lineTo(-2, 12);
            ctx.moveTo(4, -9); ctx.lineTo(4, 12);
            ctx.stroke();
        } else if (type === 'araucaria') {
            ctx.fillStyle = '#4E342E';
            ctx.fillRect(-6, -30, 12, 50);
            ctx.fillStyle = '#1B5E20';
            ctx.beginPath();
            ctx.arc(0, -42, 28, Math.PI, 0);
            ctx.lineTo(0, -26);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'snowtree') {
            ctx.fillStyle = '#3E2723';
            ctx.fillRect(-4, -6, 8, 20);
            ctx.fillStyle = '#263238';
            ctx.beginPath();
            ctx.moveTo(0, -48); ctx.lineTo(24, 0); ctx.lineTo(-24, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(0, -48); ctx.lineTo(12, -24); ctx.lineTo(-12, -24);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'penguin') {
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(0, -12, 11, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.ellipse(2, -10, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Banderita chilena
            this.drawMiniFlag(ctx, 12, -24);
        } else if (type === 'iceberg') {
            ctx.fillStyle = '#81D4FA';
            ctx.beginPath();
            ctx.moveTo(-20, 10); ctx.lineTo(-8, -32); ctx.lineTo(8, -26); ctx.lineTo(20, 10);
            ctx.closePath();
            ctx.fill();
        } else {
            // Rocas de montaña
            ctx.fillStyle = '#78909C';
            ctx.beginPath();
            ctx.moveTo(-18, 10); ctx.lineTo(0, -24); ctx.lineTo(18, 10);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    drawMiniFlag(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, 18);
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(1, 0, 16, 5);
        ctx.fillStyle = '#D52B1E'; ctx.fillRect(1, 5, 16, 5);
        ctx.fillStyle = '#0039A6'; ctx.fillRect(1, 0, 6, 5);
        ctx.restore();
    }

    // Dibuja los autos rivales en perspectiva 3D
    draw3DRivals(ctx, w, h, horizonY) {
        // Ordenar rivales por distancia Z (los más lejanos primero)
        const sortedRivals = [...this.rivals].sort((a, b) => b.z - a.z);

        sortedRivals.forEach((rival) => {
            const relZ = rival.z - this.playerZ;
            // Solo dibujar si está en el rango visible
            if (relZ > -50 && relZ < 2400) {
                const zDist = Math.max(25, relZ);
                const scale = this.cameraDepth / (zDist * 0.0035);
                const hill = this.getRoadHill(rival.z);
                const py = horizonY + (this.cameraHeight - hill) * scale * 0.0028;
                const curve = this.getRoadCurve(rival.z) * 320 * (1 - zDist / 2400);
                const roadW = this.roadWidth * scale * 0.0028;
                const playerOffset = (this.playerX * this.roadWidth * 0.5) * scale * 0.003;
                const px = (w / 2) + curve - playerOffset + (rival.x * roadW * 0.65);

                const carScale = Math.min(1.2, scale * 0.0038);

                drawF1CarRearView(
                    ctx,
                    px,
                    py,
                    carScale,
                    rival.color,
                    rival.number,
                    rival.rider,
                    rival.wobble * 0.1,
                    false,
                    false
                );
            }
        });
    }

    // Dibuja el auto de F1 del jugador en primer plano (Chase Cam)
    drawPlayerF1Car(ctx, w, h) {
        const carX = w / 2;
        const carY = h - 110;
        const hasTurbo = this.turboTimer > 0;
        const isSkidding = this.skidTimer > 0;

        drawF1CarRearView(
            ctx,
            carX,
            carY,
            1.45, // Tamaño grande e imponente
            GAME_CONFIG.selectedColor,
            1,
            GAME_CONFIG.selectedRider,
            this.tilt,
            hasTurbo,
            isSkidding
        );
    }

    // Líneas de velocidad dinámicas que dan sensación de alta velocidad
    drawSpeedLines(ctx, w, h) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        const count = 14;
        for (let i = 0; i < count; i++) {
            const x1 = Math.random() < 0.5 ? Math.random() * (w * 0.25) : w - Math.random() * (w * 0.25);
            const y1 = Math.random() * h;
            const len = 40 + Math.random() * 60;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x1 < w / 2 ? -len * 0.3 : len * 0.3), y1 + len);
            ctx.stroke();
        }
    }

    // Semáforo de largada de F1 con luces animadas
    drawStartLights(ctx, w, h) {
        const sw = 280;
        const sh = 90;
        const sx = (w - sw) / 2;
        const sy = h * 0.2;

        ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 20);
        ctx.fill();
        ctx.stroke();

        const lightsLit = this.startCountdown > 90 ? 1 : (this.startCountdown > 60 ? 2 : (this.startCountdown > 20 ? 3 : 0));
        const isGreen = this.startCountdown <= 20;

        for (let i = 0; i < 3; i++) {
            const lx = sx + 50 + i * 90;
            const ly = sy + 45;
            const active = isGreen || (i < lightsLit);

            ctx.fillStyle = isGreen ? (active ? '#00E676' : '#1B5E20') : (active ? '#FF1744' : '#550000');
            ctx.beginPath();
            ctx.arc(lx, ly, 26, 0, Math.PI * 2);
            ctx.fill();

            if (active) {
                ctx.shadowColor = isGreen ? '#00E676' : '#FF1744';
                ctx.shadowBlur = 18;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    // HUD con diseño moderno y deportivo de F1
    drawHUD(ctx, w, h) {
        const track = this.getCurrentTrack();

        // 1. PLACA DE POSICIÓN EN CARRERA (Arriba a la izquierda)
        const isPodium = this.playerRank <= 3;
        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = this.playerRank === 1 ? '#FFD700' : (isPodium ? '#00E5FF' : '#FF9500');
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(16, 16, 160, 54, 27);
        ctx.fill();
        ctx.stroke();

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.playerRank === 1 ? '🏆' : (isPodium ? '🥇' : '🏎️'), 26, 52);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
        ctx.fillText(`${this.playerRank}º Lugar`, 68, 52);

        // 2. BARRA DE PROGRESO DE LA CARRERA DE 1 MINUTO (Centro superior)
        const barW = Math.min(380, w * 0.46);
        const barX = (w - barW) / 2;
        const barY = 22;
        const barH = 22;

        // Nombre de la pista chilena
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = 'bold 16px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6);
        ctx.fillText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6);

        // Fondo de la barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 11);
        ctx.fill();
        ctx.stroke();

        // Relleno de progreso
        const progress = Math.min(1, Math.max(0, this.playerZ / this.trackLength));
        if (progress > 0.02) {
            const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            progGrad.addColorStop(0, '#00E5FF');
            progGrad.addColorStop(0.7, '#FFD700');
            progGrad.addColorStop(1, '#00E676');

            ctx.fillStyle = progGrad;
            ctx.beginPath();
            ctx.roundRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4, 9);
            ctx.fill();
        }

        // Mini autito de F1 en la barra
        const carProgressX = barX + (barW - 22) * progress;
        ctx.font = '18px sans-serif';
        ctx.fillText('🏎️', carProgressX, barY + 17);
        ctx.fillText('🏁', barX + barW + 12, barY + 17);

        // 3. VELOCÍMETRO DIGITAL DE F1 (Abajo a la derecha)
        const speedKmh = Math.floor(this.speed);
        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = this.turboTimer > 0 ? '#00E5FF' : (this.skidTimer > 0 ? '#FF9500' : '#FFFFFF');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(w - 150, 16, 134, 54, 27);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.turboTimer > 0 ? '#00E5FF' : '#FFFFFF';
        ctx.font = 'bold 24px "Arial Rounded MT Bold", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${speedKmh}`, w - 100, 48);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('KM/H', w - 42, 48);
    }

    // Pantalla de Podio y Avance de Pista
    drawPodiumScreen(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, w, h);

        const bannerW = Math.min(540, w - 30);
        const bannerH = 370;
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
            const medal = this.playerRank === 1 ? '🏆' : (this.playerRank === 2 ? '🥈' : '🥉');
            ctx.font = '54px sans-serif';
            ctx.fillText(medal, w / 2, by + 70);

            ctx.fillStyle = '#D52B1E';
            ctx.font = 'bold 28px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(this.playerRank === 1 ? '¡1º LUGAR! ¡CAMPEÓN!' : '🇨🇱 ¡PODIO EN CHILE! 🇨🇱', w / 2, by + 115);

            ctx.fillStyle = '#222';
            ctx.font = 'bold 21px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`¡Terminaste en ${this.playerRank}º Lugar en ${track.name}!`, w / 2, by + 150);

            // Dibujo de los 3 cajones del podio
            this.drawPodiumSteps(ctx, w / 2, by + 235);

            const isLastTrack = this.currentTrackIndex >= this.tracks.length - 1;
            const btnText = isLastTrack ? '🇨🇱 ¡Gran Campeón de Chile! Jugar de Nuevo 🏆' : '🚀 ¡Avanzar a Siguiente Pista Chilena! 🇨🇱';

            this.actionBtn = { x: bx + 40, y: by + 285, w: bannerW - 80, h: 62, action: isLastTrack ? 'restart' : 'next' };

            ctx.fillStyle = '#00E676';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 30);
            ctx.fill();
            ctx.strokeStyle = '#00C853';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#004D40';
            ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(btnText, w / 2, by + 324);
        } else {
            ctx.font = '54px sans-serif';
            ctx.fillText('🏎️', w / 2, by + 70);

            ctx.fillStyle = '#FF9500';
            ctx.font = 'bold 26px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('¡CASI LLEGAS AL PODIO!', w / 2, by + 120);

            ctx.fillStyle = '#444';
            ctx.font = 'bold 18px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`Terminaste en ${this.playerRank}º Lugar.`, w / 2, by + 160);
            ctx.fillText('¡Necesitas llegar 1º, 2º o 3º para clasificar a la siguiente pista!', w / 2, by + 190);

            this.actionBtn = { x: bx + 50, y: by + 250, w: bannerW - 100, h: 65, action: 'retry' };

            ctx.fillStyle = '#007AFF';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 30);
            ctx.fill();
            ctx.strokeStyle = '#0056B3';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('🔄 ¡Intentar de Nuevo!', w / 2, by + 291);
        }
    }

    drawPodiumSteps(ctx, cx, cy) {
        ctx.save();
        // 2º Lugar
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(cx - 100, cy - 35, 60, 45);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('2º', cx - 70, cy - 8);

        // 1º Lugar
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(cx - 35, cy - 55, 70, 65);
        ctx.fillStyle = '#222';
        ctx.fillText('1º 🏆', cx, cy - 18);

        // 3º Lugar
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
                    this.currentTrackIndex++;
                    this.initRoad();
                } else if (r.action === 'restart') {
                    this.currentTrackIndex = 0;
                    this.initRoad();
                } else if (r.action === 'retry') {
                    this.initRoad();
                }
                return true;
            }
        }
        return false;
    }
}

window.LanesGame = LanesGame;
