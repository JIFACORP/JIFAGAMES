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
                groundColor1: "#E2903B",
                groundColor2: "#D8822B",
                asphaltColor1: "#2B2622",
                asphaltColor2: "#36302B",
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
                groundColor1: "#DCE7EF",
                groundColor2: "#C7D8E6",
                asphaltColor1: "#262C33",
                asphaltColor2: "#323A44",
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
                groundColor1: "#388E3C",
                groundColor2: "#2E7D32",
                asphaltColor1: "#1E2620",
                asphaltColor2: "#29332B",
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
                groundColor1: "#CFD8DC",
                groundColor2: "#B0BEC5",
                asphaltColor1: "#1A222C",
                asphaltColor2: "#242F3D",
                kerbColor1: "#00E5FF",
                kerbColor2: "#FFFFFF",
                decorations: ['iceberg', 'penguin', 'torrespaine']
            }
        ];

        this.currentTrackIndex = 0;

        // Configuración del mundo 3D
        this.trackLength = 36000;   // ~60 segundos a 600 unidades/segundo (10 u/frame)
        this.segmentLength = 100;   // 360 segmentos
        this.worldHalfW = 460;      // Mitad del ancho de la carretera en el mundo
        this.cameraY = 850;         // Altura de cámara sobre el asfalto

        this.initRoad();
    }

    getW() {
        return this.canvas.logicalWidth || this.canvas.width;
    }

    getH() {
        return this.canvas.logicalHeight || this.canvas.height;
    }

    getCurrentTrack() {
        return this.tracks[this.currentTrackIndex];
    }

    initRoad() {
        const track = this.getCurrentTrack();

        this.playerX = 0;       // -1 (izquierda) a +1 (derecha)
        this.playerZ = 0;       // Distancia recorrida
        this.speed = 0;         // Velocidad visual en km/h (0 - 230)
        this.targetSpeed = 160; // Crucero: 160 km/h (= 10 u/frame)
        this.turboTimer = 0;
        this.skidTimer = 0;
        this.steerInput = 0;
        this.tilt = 0;

        this.playerRank = 6;    // Empieza en 6º lugar
        this.won = false;
        this.startCountdown = 110; // ~1.8 segundos de semáforo de largada

        this.particles = [];
        this.confetti = [];
        this.overtakePopups = [];

        // 5 AUTOS RIVALES CALIBRADOS PARA SER 100% ALCANZABLES EN 1 MINUTO
        // A velocidad de jugador = 10 u/frame (600 u/seg):
        // Cada rival va entre 7.1 y 8.2 u/frame, por lo que los alcanzas cada ~10-12 segundos
        this.rivals = [
            {
                id: 5,
                name: 'Verde Turbo',
                color: '#006F62',
                number: 14,
                rider: 'leon',
                z: 1700,      // Alcanzado aprox. a los 10s
                x: -0.45,
                speedUnits: 7.1, // 426 u/s
                overtaken: false,
                wobble: 0
            },
            {
                id: 4,
                name: 'Papaya Naranja',
                color: '#FF8000',
                number: 4,
                rider: 'conejo',
                z: 3300,      // Alcanzado aprox. a los 22s
                x: 0.45,
                speedUnits: 7.5, // 450 u/s
                overtaken: false,
                wobble: 0
            },
            {
                id: 3,
                name: 'Flecha Turquesa',
                color: '#00D2BE',
                number: 44,
                rider: 'zorro',
                z: 4700,      // Alcanzado aprox. a los 35s -> ¡PODIO 3º!
                x: -0.35,
                speedUnits: 7.75, // 465 u/s
                overtaken: false,
                wobble: 0
            },
            {
                id: 2,
                name: 'Toro Azul',
                color: '#0600EF',
                number: 33,
                rider: 'tigre',
                z: 5650,      // Alcanzado aprox. a los 47s -> ¡PODIO 2º!
                x: 0.35,
                speedUnits: 8.0, // 480 u/s
                overtaken: false,
                wobble: 0
            },
            {
                id: 1,
                name: 'Rayo Rojo',
                color: '#FF1801',
                number: 16,
                rider: 'leon',
                z: 5900,      // Alcanzado aprox. a los 55s -> ¡1º LUGAR 🏆!
                x: 0.0,
                speedUnits: 8.25, // 495 u/s
                overtaken: false,
                wobble: 0
            }
        ];

        // EXACTAMENTE 2 ITEMS EN PISTA: 'speed' (Flechas Turbo) y 'oil' (Charco de Aceite)
        this.items = [];
        for (let z = 1200; z < this.trackLength - 1500; z += 1400) {
            const laneX = (Math.random() - 0.5) * 1.2;
            const type = Math.random() < 0.55 ? 'speed' : 'oil';
            this.items.push({
                z: z,
                x: laneX,
                type: type,
                hit: false
            });
        }

        // DECORACIONES DE PAISAJE CHILENO A LOS COSTADOS DEL CAMINO
        this.props = [];
        const decTypes = track.decorations;
        for (let z = 400; z < this.trackLength + 3000; z += 650) {
            this.props.push({
                z: z,
                x: -1.45 - Math.random() * 0.6,
                type: decTypes[Math.floor(Math.random() * decTypes.length)]
            });
            this.props.push({
                z: z + 325,
                x: 1.45 + Math.random() * 0.6,
                type: decTypes[Math.floor(Math.random() * decTypes.length)]
            });
        }

        if (window.soundController) {
            window.soundController.startEngine();
        }
    }

    // Curva del segmento (para acumulación estilo OutRun)
    getSegmentCurve(segIndex) {
        return Math.sin(segIndex * 0.065) * 6 + Math.cos(segIndex * 0.03) * 4;
    }

    // Elevación del segmento (colinas suaves)
    getRoadHill(z) {
        return Math.sin(z * 0.0008) * 180;
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
        this.turboTimer = 60; // ~1 segundo de turbo intenso
        this.skidTimer = 0;
        if (window.soundController) {
            window.soundController.playTurbo();
        }
        this.overtakePopups.push({
            text: '⚡ ¡TURBO! ⚡',
            color: '#00E5FF',
            y: this.getH() * 0.45,
            life: 45
        });
    }

    triggerOilSkid() {
        this.skidTimer = 45; // ~0.75 segundos de frenada
        this.turboTimer = 0;
        if (window.soundController) {
            window.soundController.playSkid();
        }
        this.overtakePopups.push({
            text: '⚠️ ¡ACEITE! ⚠️',
            color: '#FF9500',
            y: this.getH() * 0.45,
            life: 40
        });
    }

    update(dt) {
        const dtFactor = Math.min((dt || 1 / 60) * 60, 2.5);

        // 1. SEMÁFORO DE LARGADA
        if (this.startCountdown > 0) {
            const prev = Math.ceil(this.startCountdown / 30);
            this.startCountdown -= dtFactor;
            const curr = Math.ceil(this.startCountdown / 30);

            if (curr !== prev && curr > 0) {
                if (window.soundController) window.soundController.playJump();
            }
            if (this.startCountdown <= 0) {
                this.startCountdown = 0;
                if (window.soundController) window.soundController.playTurbo();
            }
            return;
        }

        if (this.won) {
            this.speed *= Math.pow(0.95, dtFactor);
            this.playerZ += (this.speed * 0.0625) * dtFactor;
            this.confetti.forEach((c) => {
                c.y += c.vy * dtFactor;
                c.x += c.vx * dtFactor;
                c.rotation += 0.05 * dtFactor;
            });
            return;
        }

        // 2. VELOCIDAD Y DIRECCIÓN DEL JUGADOR
        if (this.turboTimer > 0) {
            this.turboTimer -= dtFactor;
            this.targetSpeed = 235;
        } else if (this.skidTimer > 0) {
            this.skidTimer -= dtFactor;
            this.targetSpeed = 95;
        } else {
            this.targetSpeed = 160;
        }

        this.speed += (this.targetSpeed - this.speed) * 0.1 * dtFactor;

        // A 160 km/h avanza exactamente 10 unidades por frame (600 u/s)
        const unitsMoved = (this.speed * 0.0625) * dtFactor;
        this.playerZ += unitsMoved;

        // Volante suave
        const steerSpeed = 0.038 * (this.turboTimer > 0 ? 1.15 : 1) * dtFactor;
        if (this.steerInput !== 0) {
            this.playerX += this.steerInput * steerSpeed;
            this.tilt += (this.steerInput - this.tilt) * 0.22 * dtFactor;
        } else {
            this.tilt *= Math.pow(0.82, dtFactor);
        }

        this.playerX = Math.max(-0.92, Math.min(0.92, this.playerX));

        if (window.soundController) {
            window.soundController.updateEngine(this.speed / 200, true);
        }

        // 3. COLISIÓN CON ITEMS (Flechas de Velocidad y Aceite)
        this.items.forEach((item) => {
            if (!item.hit && Math.abs(item.z - this.playerZ) < 120) {
                if (Math.abs(item.x - this.playerX) < 0.34) {
                    item.hit = true;
                    if (item.type === 'speed') {
                        this.triggerSpeedBoost();
                    } else {
                        this.triggerOilSkid();
                    }
                }
            }
        });

        // 4. ACTUALIZAR AUTOS RIVALES Y ADELANTAMIENTOS
        this.rivals.forEach((rival) => {
            rival.z += rival.speedUnits * dtFactor;

            // Movimiento lateral suave
            rival.x += Math.sin(this.playerZ * 0.001 + rival.id * 2) * 0.004 * dtFactor;
            rival.x = Math.max(-0.75, Math.min(0.75, rival.x));

            if (rival.wobble > 0) rival.wobble -= dtFactor;

            // Comprobar adelantamiento
            if (!rival.overtaken && this.playerZ >= rival.z) {
                rival.overtaken = true;
                this.playerRank = Math.max(1, this.playerRank - 1);

                if (window.soundController) {
                    window.soundController.playTurbo();
                }

                this.overtakePopups.push({
                    text: this.playerRank === 1 ? '🏆 ¡1º LUGAR! ¡LÍDER! 🏆' : `¡${this.playerRank}º LUGAR!`,
                    color: this.playerRank === 1 ? '#FFD700' : '#00E5FF',
                    y: this.getH() * 0.35,
                    life: 60
                });

                for (let p = 0; p < 18; p++) {
                    this.particles.push({
                        x: (this.getW() / 2) + (Math.random() - 0.5) * 180,
                        y: this.getH() * 0.65,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        size: 5 + Math.random() * 5,
                        color: ['#FFD700', '#00E5FF', '#FF3B30', '#FFFFFF'][Math.floor(Math.random() * 4)],
                        life: 25
                    });
                }
            }

            // Choque amistoso tipo autito chocador
            if (Math.abs(rival.z - this.playerZ) < 160 && Math.abs(rival.x - this.playerX) < 0.32) {
                rival.wobble = 15;
                if (this.playerX < rival.x) {
                    rival.x = Math.min(0.85, rival.x + 0.14);
                    this.playerX = Math.max(-0.88, this.playerX - 0.08);
                } else {
                    rival.x = Math.max(-0.85, rival.x - 0.14);
                    this.playerX = Math.min(0.88, this.playerX + 0.08);
                }
                if (window.soundController) window.soundController.playJump();
            }
        });

        // 5. LLEGADA A LA META
        if (this.playerZ >= this.trackLength && !this.won) {
            this.won = true;
            if (window.soundController) {
                window.soundController.playWin();
            }
            const cw = this.getW();
            for (let i = 0; i < 90; i++) {
                this.confetti.push({
                    x: (cw * 0.1) + Math.random() * (cw * 0.8),
                    y: -Math.random() * 200,
                    vx: (Math.random() - 0.5) * 5,
                    vy: 2 + Math.random() * 4,
                    size: 8 + Math.random() * 8,
                    color: ['#D52B1E', '#0039A6', '#FFFFFF', '#FFD700', '#00E5FF'][Math.floor(Math.random() * 5)],
                    rotation: Math.random() * Math.PI
                });
            }
        }

        // Partículas y popups
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dtFactor;
            p.y += p.vy * dtFactor;
            p.life -= dtFactor;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.overtakePopups.length - 1; i >= 0; i--) {
            const pop = this.overtakePopups[i];
            pop.y -= 0.7 * dtFactor;
            pop.life -= dtFactor;
            if (pop.life <= 0) this.overtakePopups.splice(i, 1);
        }
    }

    // PROYECCIÓN 3D SEGURA Y CALIBRADA (Adaptada a Desktop y iPhone Portrait)
    project(worldX, worldY, worldZ, cameraX, cameraY, cameraZ, horizonY, w, h) {
        const dz = worldZ - cameraZ;
        if (dz <= 40) return null;

        const scale = 300.0 / dz;
        const roadH = h - horizonY;
        // En pantallas angostas (iPhone vertical), reducir widthFactor para ver pianos y paisaje
        const widthFactor = w < 600 ? (w * 0.68) / 1000.0 : Math.min(w, 850) / 1000.0;

        const screenY = horizonY + (cameraY - worldY) * scale * (roadH / 1000.0);
        const screenX = (w / 2) + (worldX - cameraX) * scale * widthFactor;
        const halfRoadW = this.worldHalfW * scale * widthFactor;

        return { x: screenX, y: screenY, rw: halfRoadW, scale: scale, widthFactor: widthFactor };
    }

    draw() {
        const ctx = this.ctx;
        const w = this.getW();
        const h = this.getH();
        if (!w || !h) return;

        const track = this.getCurrentTrack();
        ctx.clearRect(0, 0, w, h);

        const horizonY = h * 0.40; // Horizonte en el 40% superior

        // 1. CIELO Y CORDILLERA CHILENA DE FONDO
        this.drawSkyAndMountains(ctx, w, h, horizonY, track);

        // Suelo base bajo el horizonte
        ctx.fillStyle = track.groundColor1;
        ctx.fillRect(0, horizonY, w, h - horizonY);

        // 2. CALCULAR SEGMENTOS DE CARRETERA 3D (De adelante hacia el horizonte)
        const cameraZ = this.playerZ - 280;
        const cameraY = this.cameraY + this.getRoadHill(this.playerZ);
        const camOffsetX = this.playerX * this.worldHalfW * 0.65;

        const drawDistance = 60;
        const baseSeg = Math.floor(cameraZ / this.segmentLength);

        const projectedSegments = [];
        let curveX = 0;
        let dx = 0;
        let maxY = h;

        for (let n = 1; n <= drawDistance; n++) {
            const segIndex = baseSeg + n;
            const segZ = segIndex * this.segmentLength;
            const segY = this.getRoadHill(segZ);

            // Solo acumular curvatura por delante del jugador para mantener el auto alineado con la pista
            if (segZ > this.playerZ) {
                dx += this.getSegmentCurve(segIndex) * 0.15;
                curveX += dx;
            }

            const proj = this.project(curveX, segY, segZ, camOffsetX, cameraY, cameraZ, horizonY, w, h);
            if (!proj) continue;

            const isAlt = (segIndex % 2) === 0;
            const clipY = maxY;
            const visible = proj.y < maxY;
            if (visible) {
                maxY = Math.max(horizonY, proj.y);
            }

            projectedSegments.push({
                n: n,
                segIndex: segIndex,
                segZ: segZ,
                curveX: curveX,
                proj: proj,
                isAlt: isAlt,
                clipY: clipY,
                visible: visible
            });
        }

        // 3. DIBUJAR CARRETERA DE ATRÁS HACIA ADELANTE (Con recorte en el horizonte)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, horizonY, w, h - horizonY);
        ctx.clip();

        for (let i = projectedSegments.length - 1; i >= 1; i--) {
            const s1 = projectedSegments[i - 1]; // Más cercano al jugador (abajo)
            const s2 = projectedSegments[i];     // Más lejano (arriba)

            if (!s2.visible && !s1.visible) continue;
            if (s2.proj.y >= s1.proj.y) continue;

            const p1 = s1.proj;
            const p2 = s2.proj;

            // Franja alternada de pasto/arena en el paisaje
            ctx.fillStyle = s1.isAlt ? track.groundColor1 : track.groundColor2;
            ctx.fillRect(0, p2.y, w, p1.y - p2.y + 1);

            // Pianos / Kerbs F1 a ambos lados
            const kerbW1 = p1.rw * 0.14;
            const kerbW2 = p2.rw * 0.14;
            ctx.fillStyle = s1.isAlt ? track.kerbColor1 : track.kerbColor2;

            // Kerb izquierdo
            this.drawTrapezoid(ctx, p1.x - p1.rw - kerbW1, p1.y, p1.x - p1.rw, p1.y, p2.x - p2.rw - kerbW2, p2.y, p2.x - p2.rw, p2.y);
            // Kerb derecho
            this.drawTrapezoid(ctx, p1.x + p1.rw, p1.y, p1.x + p1.rw + kerbW1, p1.y, p2.x + p2.rw, p2.y, p2.x + p2.rw + kerbW2, p2.y);

            // Asfalto de la pista
            ctx.fillStyle = s1.isAlt ? track.asphaltColor1 : track.asphaltColor2;
            this.drawTrapezoid(ctx, p1.x - p1.rw, p1.y, p1.x + p1.rw, p1.y, p2.x - p2.rw, p2.y, p2.x + p2.rw, p2.y);

            // Líneas blancas de los 3 carriles
            if (s1.isAlt) {
                ctx.fillStyle = '#FFFFFF';
                const lw1 = p1.rw * 0.03;
                const lw2 = p2.rw * 0.03;
                [-0.33, 0.33].forEach(lanePos => {
                    const lx1 = p1.x + p1.rw * lanePos;
                    const lx2 = p2.x + p2.rw * lanePos;
                    this.drawTrapezoid(ctx, lx1 - lw1, p1.y, lx1 + lw1, p1.y, lx2 - lw2, p2.y, lx2 + lw2, p2.y);
                });
            }

            // Línea de Meta Cuadriculada en 3D
            if (s1.segZ <= this.trackLength && s2.segZ >= this.trackLength) {
                this.drawCheckeredFinish3D(ctx, p1.x, p1.y, p1.rw, p2.x, p2.y, p2.rw);
            }
        }
        ctx.restore();

        // 4. DIBUJAR OBJETOS EN EL SEGMENTO CORRESPONDIENTE (De atrás hacia adelante para oclusión perfecta)
        // Mapear items, props y rivales dentro de los segmentos visibles
        for (let i = projectedSegments.length - 1; i >= 0; i--) {
            const seg = projectedSegments[i];
            const segMinZ = seg.segZ;
            const segMaxZ = seg.segZ + this.segmentLength;

            // Paisaje chileno a los lados
            this.props.forEach((prop) => {
                if (prop.z >= segMinZ && prop.z < segMaxZ) {
                    const px = seg.proj.x + prop.x * seg.proj.rw;
                    const py = seg.proj.y;
                    if (py <= seg.clipY && py >= horizonY) {
                        this.drawChileanProp(ctx, px, py, prop.type, seg.proj.scale);
                    }
                }
            });

            // Items en pista (Aceite / Flechas Turbo)
            this.items.forEach((item) => {
                if (!item.hit && item.z >= segMinZ && item.z < segMaxZ) {
                    const ix = seg.proj.x + item.x * seg.proj.rw;
                    const iy = seg.proj.y;
                    if (iy <= seg.clipY && iy >= horizonY) {
                        if (item.type === 'speed') {
                            this.drawSpeedPad3D(ctx, ix, iy, seg.proj.scale);
                        } else {
                            this.drawOilPuddle3D(ctx, ix, iy, seg.proj.scale);
                        }
                    }
                }
            });

            // Autos Rivales de F1
            this.rivals.forEach((rival) => {
                if (rival.z >= segMinZ && rival.z < segMaxZ) {
                    const rx = seg.proj.x + rival.x * seg.proj.rw;
                    const ry = seg.proj.y;
                    if (ry <= seg.clipY && ry >= horizonY) {
                        const carScale = seg.proj.scale * 1.15;
                        drawF1CarRearView(
                            ctx,
                            rx,
                            ry - 12 * carScale,
                            carScale,
                            rival.color,
                            rival.number,
                            rival.rider,
                            rival.wobble * 0.1,
                            false,
                            false
                        );
                    }
                }
            });
        }

        // 5. AUTO DE F1 DEL JUGADOR EN PRIMER PLANO
        this.drawPlayerF1Car(ctx, w, h, horizonY);

        // 6. LÍNEAS DE VELOCIDAD DINÁMICAS
        if (this.turboTimer > 0 || this.speed > 180) {
            this.drawSpeedLines(ctx, w, h);
        }

        // 7. PARTÍCULAS Y POPUPS
        this.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

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

        // 8. HUD (Barra de progreso, Posición, Velocímetro)
        this.drawHUD(ctx, w, h);

        // 9. SEMÁFORO DE LARGADA
        if (this.startCountdown > 0) {
            this.drawStartLights(ctx, w, h);
        }

        // 10. PANTALLA DE PODIO / VICTORIA
        if (this.won) {
            this.drawPodiumScreen(ctx, w, h);
        }
    }

    drawTrapezoid(ctx, x1, y1, x2, y1_b, x3, y2, x4, y2_b) {
        ctx.beginPath();
        ctx.moveTo(x1, y1 + 0.5);
        ctx.lineTo(x2, y1_b + 0.5);
        ctx.lineTo(x4, y2_b - 0.5);
        ctx.lineTo(x3, y2 - 0.5);
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

    drawSkyAndMountains(ctx, w, h, horizonY, track) {
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

        const curveOffset = this.getSegmentCurve(Math.floor(this.playerZ / 100)) * 2.5;

        // Cordillera chilena de fondo
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

        // Cumbres nevadas
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

    drawSpeedPad3D(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.1, scale * 0.55);

        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 12;

        for (let i = 0; i < 3; i++) {
            const ay = -i * 22;
            ctx.beginPath();
            ctx.moveTo(0, ay - 16);
            ctx.lineTo(24, ay);
            ctx.lineTo(10, ay);
            ctx.lineTo(10, ay + 12);
            ctx.lineTo(-10, ay + 12);
            ctx.lineTo(-10, ay);
            ctx.lineTo(-24, ay);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    drawOilPuddle3D(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.25, scale * 0.5);

        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.ellipse(0, 0, 36, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(175, 82, 222, 0.75)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-6, -2, 16, 0.2, Math.PI * 0.8);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(8, 4, 12, Math.PI * 0.7, Math.PI * 1.6);
        ctx.stroke();

        ctx.restore();
    }

    drawChileanProp(ctx, x, y, type, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * 1.65, scale * 1.65);

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
            ctx.fillRect(9, -30, 9, 4);
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
            this.drawMiniFlag(ctx, 12, -24);
        } else if (type === 'iceberg') {
            ctx.fillStyle = '#81D4FA';
            ctx.beginPath();
            ctx.moveTo(-20, 10); ctx.lineTo(-8, -32); ctx.lineTo(8, -26); ctx.lineTo(20, 10);
            ctx.closePath();
            ctx.fill();
        } else {
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

    drawPlayerF1Car(ctx, w, h, horizonY) {
        const cameraZ = this.playerZ - 280;
        const cameraY = this.cameraY + this.getRoadHill(this.playerZ);
        const camOffsetX = this.playerX * this.worldHalfW * 0.65;
        const playerWorldX = this.playerX * this.worldHalfW;

        const proj = this.project(playerWorldX, this.getRoadHill(this.playerZ), this.playerZ, camOffsetX, cameraY, cameraZ, horizonY, w, h);
        const carX = proj ? proj.x : w / 2;
        const isMobile = w < 640;
        const carY = isMobile ? h - 135 : h - 105;
        const carScale = isMobile ? Math.max(0.85, Math.min(1.15, w / 400)) : 1.35;

        const hasTurbo = this.turboTimer > 0;
        const isSkidding = this.skidTimer > 0;

        drawF1CarRearView(
            ctx,
            carX,
            carY,
            carScale,
            GAME_CONFIG.selectedColor,
            1,
            GAME_CONFIG.selectedRider,
            this.tilt,
            hasTurbo,
            isSkidding
        );
    }

    drawSpeedLines(ctx, w, h) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 14; i++) {
            const x1 = Math.random() < 0.5 ? Math.random() * (w * 0.25) : w - Math.random() * (w * 0.25);
            const y1 = Math.random() * h;
            const len = 40 + Math.random() * 60;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x1 < w / 2 ? -len * 0.3 : len * 0.3), y1 + len);
            ctx.stroke();
        }
    }

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

        const lightsLit = this.startCountdown > 80 ? 1 : (this.startCountdown > 50 ? 2 : (this.startCountdown > 20 ? 3 : 0));
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

    drawHUD(ctx, w, h) {
        const track = this.getCurrentTrack();
        const isMobile = w < 640;
        const isPodium = this.playerRank <= 3;

        // BARRA DE PROGRESO (En móvil va debajo de los botones HTML del top bar; en desktop va centrada arriba)
        const barW = isMobile ? Math.max(180, w - 56) : Math.min(380, w - 340);
        const barX = (w - barW) / 2;
        const barY = isMobile ? 74 : 34;
        const barH = isMobile ? 18 : 22;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.font = isMobile ? 'bold 14px "Comic Sans MS", cursive, sans-serif' : 'bold 16px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6, w - 30);
        ctx.fillText(`🇨🇱 Pista ${this.currentTrackIndex + 1}: ${track.name}`, w / 2, barY - 6, w - 30);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barH / 2);
        ctx.fill();
        ctx.stroke();

        const progress = Math.min(1, Math.max(0, this.playerZ / this.trackLength));
        if (progress > 0.02) {
            const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
            progGrad.addColorStop(0, '#00E5FF');
            progGrad.addColorStop(0.7, '#FFD700');
            progGrad.addColorStop(1, '#00E676');

            ctx.fillStyle = progGrad;
            ctx.beginPath();
            ctx.roundRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4, (barH - 4) / 2);
            ctx.fill();
        }

        const carProgressX = barX + (barW - 22) * progress;
        ctx.font = isMobile ? '15px sans-serif' : '18px sans-serif';
        ctx.fillText('🏎️', carProgressX, barY + barH - 3);
        ctx.fillText('🏁', barX + barW + 12, barY + barH - 3);

        // PLACA DE POSICIÓN (Debajo de barra en móvil, o debajo del botón Menú en desktop)
        const pillY = isMobile ? 102 : 70;
        const rankW = isMobile ? 128 : 156;
        const pillH = isMobile ? 40 : 48;

        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = this.playerRank === 1 ? '#FFD700' : (isPodium ? '#00E5FF' : '#FF9500');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(14, pillY, rankW, pillH, pillH / 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = isMobile ? '20px sans-serif' : '26px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(this.playerRank === 1 ? '🏆' : (isPodium ? '🥇' : '🏎️'), 22, pillY + pillH - 12);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = isMobile ? 'bold 17px "Comic Sans MS", cursive, sans-serif' : 'bold 21px "Comic Sans MS", cursive, sans-serif';
        ctx.fillText(`${this.playerRank}º Lugar`, isMobile ? 52 : 62, pillY + pillH - 13);

        // VELOCÍMETRO
        const speedW = isMobile ? 114 : 134;
        const speedX = w - speedW - 14;
        const speedKmh = Math.floor(this.speed);
        ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = this.turboTimer > 0 ? '#00E5FF' : (this.skidTimer > 0 ? '#FF9500' : '#FFFFFF');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(speedX, pillY, speedW, pillH, pillH / 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.turboTimer > 0 ? '#00E5FF' : '#FFFFFF';
        ctx.font = isMobile ? 'bold 19px "Arial Rounded MT Bold", sans-serif' : 'bold 23px "Arial Rounded MT Bold", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${speedKmh}`, speedX + speedW * 0.36, pillY + pillH - 13);

        ctx.fillStyle = '#FFD700';
        ctx.font = isMobile ? 'bold 10px sans-serif' : 'bold 11px sans-serif';
        ctx.fillText('KM/H', speedX + speedW * 0.74, pillY + pillH - 14);
    }

    drawPodiumScreen(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, w, h);

        const bannerW = Math.min(540, w - 28);
        const bannerH = Math.min(370, h - 40);
        const bx = (w - bannerW) / 2;
        const by = (h - bannerH) / 2;
        const maxTxtW = bannerW - 36;

        const track = this.getCurrentTrack();
        const reachedPodium = this.playerRank <= 3;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = reachedPodium ? '#FFD700' : '#FF9500';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.roundRect(bx, by, bannerW, bannerH, 26);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';

        if (reachedPodium) {
            const medal = this.playerRank === 1 ? '🏆' : (this.playerRank === 2 ? '🥈' : '🥉');
            ctx.font = '48px sans-serif';
            ctx.fillText(medal, w / 2, by + 64);

            ctx.fillStyle = '#D52B1E';
            ctx.font = 'bold 25px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(this.playerRank === 1 ? '¡1º LUGAR! ¡CAMPEÓN!' : '🇨🇱 ¡PODIO EN CHILE! 🇨🇱', w / 2, by + 106, maxTxtW);

            ctx.fillStyle = '#222';
            ctx.font = 'bold 19px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`¡Terminaste en ${this.playerRank}º Lugar en ${track.name}!`, w / 2, by + 140, maxTxtW);

            this.drawPodiumSteps(ctx, w / 2, by + 225);

            const isLastTrack = this.currentTrackIndex >= this.tracks.length - 1;
            const btnText = isLastTrack ? '🇨🇱 ¡Campeón! Jugar de Nuevo 🏆' : '🚀 ¡Siguiente Pista Chilena! 🇨🇱';

            this.actionBtn = { x: bx + 24, y: by + bannerH - 80, w: bannerW - 48, h: 58, action: isLastTrack ? 'restart' : 'next' };

            ctx.fillStyle = '#00E676';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 29);
            ctx.fill();
            ctx.strokeStyle = '#00C853';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#004D40';
            ctx.font = 'bold 19px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(btnText, w / 2, this.actionBtn.y + 36, this.actionBtn.w - 24);
        } else {
            ctx.font = '48px sans-serif';
            ctx.fillText('🏎️', w / 2, by + 66);

            ctx.fillStyle = '#FF9500';
            ctx.font = 'bold 24px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('¡CASI LLEGAS AL PODIO!', w / 2, by + 114, maxTxtW);

            ctx.fillStyle = '#444';
            ctx.font = 'bold 17px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText(`Terminaste en ${this.playerRank}º Lugar.`, w / 2, by + 154, maxTxtW);
            ctx.fillText('¡Llega 1º, 2º o 3º para avanzar de pista!', w / 2, by + 184, maxTxtW);

            this.actionBtn = { x: bx + 30, y: by + bannerH - 84, w: bannerW - 60, h: 60, action: 'retry' };

            ctx.fillStyle = '#007AFF';
            ctx.beginPath();
            ctx.roundRect(this.actionBtn.x, this.actionBtn.y, this.actionBtn.w, this.actionBtn.h, 30);
            ctx.fill();
            ctx.strokeStyle = '#0056B3';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
            ctx.fillText('🔄 ¡Intentar de Nuevo!', w / 2, this.actionBtn.y + 37, this.actionBtn.w - 24);
        }
    }

    drawPodiumSteps(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(cx - 100, cy - 35, 60, 45);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('2º', cx - 70, cy - 8);

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(cx - 35, cy - 55, 70, 65);
        ctx.fillStyle = '#222';
        ctx.fillText('1º 🏆', cx, cy - 18);

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
