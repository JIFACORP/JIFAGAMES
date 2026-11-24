// js/game-hills.js - Juego de Colinas y Saltos en Moto para Niños

class HillsGame {
    constructor(canvas, onBackToMenu) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBackToMenu = onBackToMenu;

        this.level = 1;
        this.maxLevel = 3;
        this.levelLength = 3600; // Distancia a la meta
        
        this.resetGame();

        this.particles = [];
        this.confetti = [];
        this.clouds = [
            { x: 100, y: 70, size: 1.2 },
            { x: 450, y: 110, size: 0.9 },
            { x: 800, y: 60, size: 1.4 },
            { x: 1200, y: 90, size: 1.0 },
            { x: 1600, y: 75, size: 1.3 }
        ];

        this.keys = {
            gas: false,
            brake: false,
            tiltLeft: false,
            tiltRight: false
        };
    }

    resetGame() {
        const startY = this.getGroundHeight(200) - 30;
        this.bike = {
            x: 200,
            y: startY,
            vx: 0,
            vy: 0,
            angle: 0,
            angularVel: 0,
            wheelAngle: 0,
            isGrounded: false,
            crashed: false,
            crashTimer: 0
        };

        this.starsCollected = 0;
        this.won = false;
        this.winTimer = 0;
        this.cameraX = 0;

        // Generar estrellas en arcos sobre las colinas
        this.stars = [];
        for (let x = 350; x < this.levelLength - 200; x += 180) {
            const groundY = this.getGroundHeight(x);
            // Algunas en el suelo y otras en el aire para saltar
            const isHigh = Math.sin(x * 0.015) > 0.3;
            const starY = isHigh ? groundY - 110 - Math.random() * 40 : groundY - 45;
            this.stars.push({
                x: x,
                y: starY,
                collected: false,
                sparkle: Math.random() * Math.PI
            });
        }
    }

    setLevel(lvl) {
        this.level = lvl;
        this.resetGame();
        if (window.soundController) {
            if (lvl === 1) window.soundController.speak("¡Nivel uno! ¡A rodar por el parque!");
            if (lvl === 2) window.soundController.speak("¡Nivel dos! ¡Dunas del desierto!");
            if (lvl === 3) window.soundController.speak("¡Nivel tres! ¡Montañas de nieve!");
        }
    }

    // Curva del terreno suave y ondulada
    getGroundHeight(x) {
        const baseH = this.canvas && this.canvas.height ? Math.max(340, this.canvas.height - 200) : 400;
        if (x < 150) return baseH; // Zona plana de inicio
        
        let h = baseH;
        if (this.level === 1) {
            // Parque verde: colinas suaves
            h += Math.sin(x * 0.004) * 80 + Math.sin(x * 0.012) * 35;
            // Rampita divertida
            if (x > 1200 && x < 1450) {
                h -= Math.sin((x - 1200) / 250 * Math.PI) * 70;
            }
        } else if (this.level === 2) {
            // Desierto: dunas pronunciadas
            h += Math.sin(x * 0.005) * 100 + Math.cos(x * 0.015) * 45;
            if (x > 1800 && x < 2100) {
                h -= Math.sin((x - 1800) / 300 * Math.PI) * 90;
            }
        } else {
            // Nieve: saltos gigantes
            h += Math.sin(x * 0.0035) * 110 + Math.sin(x * 0.009) * 55;
        }

        // Meta siempre plana
        if (x >= this.levelLength - 300) {
            return baseH;
        }

        return h;
    }

    // Obtener la pendiente (inclinación) del terreno
    getGroundSlope(x) {
        const delta = 6;
        const y1 = this.getGroundHeight(x - delta);
        const y2 = this.getGroundHeight(x + delta);
        return Math.atan2(y2 - y1, delta * 2);
    }

    // Salto impulsado (botón especial para niños)
    boostJump() {
        if (this.bike.isGrounded && !this.bike.crashed) {
            this.bike.vy = -12;
            this.bike.vx += 3;
            if (window.soundController) {
                window.soundController.playJump();
                window.soundController.speak("¡Saaalto!");
            }
            // Partículas de tierra al saltar
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.bike.x,
                    y: this.bike.y + 20,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * -3,
                    color: '#8B5A2B',
                    life: 25
                });
            }
        }
    }

    update(dt) {
        const b = this.bike;

        // FÍSICA DE LA MOTO
        if (!b.crashed && !this.won) {
            // Gravedad
            b.vy += 0.42;

            // Entrada de controles
            if (this.keys.gas) {
                b.vx += 0.35;
                b.wheelAngle += 0.35;
                b.angularVel += 0.002; // Hace un leve caballito emocionante
                // Humito de escape
                if (Math.random() < 0.35) {
                    this.particles.push({
                        x: b.x - Math.cos(b.angle) * 40,
                        y: b.y + 10 - Math.sin(b.angle) * 20,
                        vx: -b.vx * 0.3 + (Math.random() - 0.5) * 1.5,
                        vy: -1 - Math.random() * 1.5,
                        size: 4 + Math.random() * 4,
                        color: 'rgba(230,230,230,0.8)',
                        life: 20
                    });
                }
            } else if (this.keys.brake) {
                b.vx *= 0.94;
                if (b.vx < -1.5) b.vx = -1.5;
            } else {
                b.vx *= 0.985; // Fricción natural
            }

            // Inclinación / Balance en el aire o suelo
            if (this.keys.tiltLeft) {
                b.angularVel -= 0.007;
            }
            if (this.keys.tiltRight) {
                b.angularVel += 0.007;
            }

            // Amortiguación angular
            b.angularVel *= 0.92;
            b.angle += b.angularVel;

            // Límites de velocidad amigables
            b.vx = Math.max(-2, Math.min(b.vx, 11));

            // Mover moto
            b.x += b.vx;
            b.y += b.vy;

            // COMPROBACIÓN CON EL SUELO
            const groundY = this.getGroundHeight(b.x);
            const slope = this.getGroundSlope(b.x);
            const wheelRadius = 20;

            if (b.y + wheelRadius >= groundY) {
                // Toca el suelo
                b.y = groundY - wheelRadius;
                b.vy = 0;
                b.isGrounded = true;

                // Alinear suavemente el ángulo de la moto al terreno
                let angleDiff = slope - b.angle;
                // Normalizar ángulo entre -PI y PI
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

                // Auto-estabilización para que un niño de 4 años no se frustre
                b.angle += angleDiff * 0.18;

                // Si cae muy de cabeza (más de 80 grados inclinada respecto al suelo)
                if (Math.abs(angleDiff) > 1.45 && Math.abs(b.vx) > 3) {
                    this.triggerCrash();
                }
            } else {
                b.isGrounded = false;
                // En el aire la rueda gira por inercia
                b.wheelAngle += b.vx * 0.05;
            }

            // Actualizar sonido de motor
            if (window.soundController) {
                window.soundController.updateEngine(Math.abs(b.vx) / 10, this.keys.gas);
            }
        } else if (b.crashed) {
            // Si tropieza, animación simpática y recuperación automática
            b.crashTimer++;
            b.vx *= 0.9;
            b.x += b.vx;
            b.angle += 0.05;

            const groundY = this.getGroundHeight(b.x);
            if (b.y < groundY - 20) {
                b.vy += 0.3;
                b.y += b.vy;
            } else {
                b.y = groundY - 20;
            }

            if (b.crashTimer > 60) {
                // Recuperar la moto en pie
                b.crashed = false;
                b.crashTimer = 0;
                b.angle = this.getGroundSlope(b.x);
                b.angularVel = 0;
                b.vy = -4; // Leve rebote
                if (window.soundController) {
                    window.soundController.playJump();
                    window.soundController.speak("¡Arriba otra vez!");
                }
            }
        }

        // RECOLECCIÓN DE ESTRELLAS
        this.stars.forEach((star) => {
            if (!star.collected) {
                const dist = Math.hypot(b.x - star.x, b.y - star.y);
                if (dist < 48) {
                    star.collected = true;
                    this.starsCollected++;
                    if (window.soundController) {
                        window.soundController.playStar();
                        if (this.starsCollected % 5 === 0) {
                            window.soundController.speak("¡Genial!");
                        }
                    }
                    // Chispas de colores
                    for (let i = 0; i < 7; i++) {
                        this.particles.push({
                            x: star.x,
                            y: star.y,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            color: '#FFD700',
                            size: 4 + Math.random() * 3,
                            life: 20
                        });
                    }
                }
            }
        });

        // VERIFICAR META
        if (b.x >= this.levelLength && !this.won) {
            this.won = true;
            b.vx = 2; // Desacelera despacio
            if (window.soundController) {
                window.soundController.playWin();
                window.soundController.speak("¡Llegaste a la meta! ¡Felicidades campeón!");
            }
            // Lanzar confeti
            for (let i = 0; i < 70; i++) {
                this.confetti.push({
                    x: b.x + (Math.random() - 0.5) * 300,
                    y: b.y - 200 - Math.random() * 100,
                    vx: (Math.random() - 0.5) * 4,
                    vy: 1 + Math.random() * 3,
                    color: ['#FF3B30', '#007AFF', '#34C759', '#FFCC00', '#FF2D55', '#AF52DE'][Math.floor(Math.random() * 6)],
                    size: 7 + Math.random() * 6,
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
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Suave seguimiento de cámara
        const targetCamX = b.x - this.canvas.width * 0.35;
        this.cameraX += (targetCamX - this.cameraX) * 0.1;
    }

    triggerCrash() {
        if (this.bike.crashed) return;
        this.bike.crashed = true;
        this.bike.crashTimer = 0;
        this.bike.vy = -5;
        if (window.soundController) {
            window.soundController.playOops();
            window.soundController.speak("¡Uy, despacito!");
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // 1. Cielo con degradado alegre
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        if (this.level === 1) {
            skyGrad.addColorStop(0, '#5AC8FA'); // Azul cielo brillante
            skyGrad.addColorStop(0.7, '#D4F0FF');
            skyGrad.addColorStop(1, '#E8F8FF');
        } else if (this.level === 2) {
            skyGrad.addColorStop(0, '#FF9500'); // Atardecer cálido
            skyGrad.addColorStop(0.6, '#FFCC00');
            skyGrad.addColorStop(1, '#FFF5C2');
        } else {
            skyGrad.addColorStop(0, '#4A90E2'); // Nieve mágica
            skyGrad.addColorStop(0.6, '#99C7FB');
            skyGrad.addColorStop(1, '#FFFFFF');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Sol sonriente
        this.drawSmilingSun(ctx, w - 120, 90);

        // Nubes esponjosas (parallax)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        this.clouds.forEach((cloud) => {
            const screenX = cloud.x - this.cameraX * 0.2;
            // Repetir nubes si se salen
            const cx = ((screenX % (w + 400)) + w + 400) % (w + 400) - 100;
            this.drawCloud(ctx, cx, cloud.y, cloud.size);
        });

        // 2. Colinas de fondo (segundo plano con parallax)
        ctx.save();
        ctx.translate(-this.cameraX * 0.4, 0);
        this.drawBackgroundHills(ctx, w, h);
        ctx.restore();

        // 3. Terreno principal en primer plano
        ctx.save();
        ctx.translate(-this.cameraX, 0);

        this.drawGround(ctx, w, h);

        // Decoraciones: Flores, árboles o muñecos de nieve
        this.drawScenery(ctx);

        // Estrellas coleccionables
        this.stars.forEach((star) => {
            if (!star.collected) {
                this.drawStar(ctx, star.x, star.y, star.sparkle);
                star.sparkle += 0.05;
            }
        });

        // Línea de Meta (Banderines y Arco de Globos)
        this.drawFinishLine(ctx, this.levelLength);

        // Partículas
        this.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Moto y Piloto
        const b = this.bike;
        drawSideMotorcycle(ctx, b.x, b.y, b.angle, b.wheelAngle, 0, this.keys.gas);

        // Confeti de victoria
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

        ctx.restore();

        // 4. Interfaz Superior (HUD amigable para niños)
        this.drawHUD(ctx, w);

        // Cartel de victoria si ganó
        if (this.won) {
            this.drawWinBanner(ctx, w, h);
        }
    }

    drawSmilingSun(ctx, x, y) {
        ctx.save();
        // Rayos
        ctx.strokeStyle = '#FFE066';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * 38, y + Math.sin(a) * 38);
            ctx.lineTo(x + Math.cos(a) * 52, y + Math.sin(a) * 52);
            ctx.stroke();
        }

        // Cuerpo del sol
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();

        // Mejillas rosadas
        ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
        ctx.beginPath();
        ctx.arc(x - 14, y + 8, 6, 0, Math.PI * 2);
        ctx.arc(x + 14, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();

        // Ojos felices
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(x - 12, y - 4, 3.5, 0, Math.PI * 2);
        ctx.arc(x + 12, y - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa grande
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y + 4, 14, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.restore();
    }

    drawCloud(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.arc(22, -10, 28, 0, Math.PI * 2);
        ctx.arc(50, -4, 22, 0, Math.PI * 2);
        ctx.arc(32, 10, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBackgroundHills(ctx, w, h) {
        ctx.fillStyle = this.level === 1 ? '#A8E6CF' : (this.level === 2 ? '#FFD3B6' : '#D0E6FF');
        ctx.beginPath();
        ctx.moveTo(-200, h);
        for (let x = -200; x < this.levelLength + 800; x += 100) {
            const y = 350 + Math.sin(x * 0.002) * 60;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(this.levelLength + 800, h);
        ctx.closePath();
        ctx.fill();
    }

    drawGround(ctx, w, h) {
        const startX = Math.max(0, this.cameraX - 50);
        const endX = this.cameraX + w + 100;
        const step = 15;

        // Capa de tierra / roca debajo
        ctx.fillStyle = this.level === 1 ? '#8B5A2B' : (this.level === 2 ? '#C68B59' : '#C7D9EC');
        ctx.beginPath();
        ctx.moveTo(startX, h + 200);
        for (let x = startX; x <= endX; x += step) {
            ctx.lineTo(x, this.getGroundHeight(x));
        }
        ctx.lineTo(endX, h + 200);
        ctx.closePath();
        ctx.fill();

        // Capa superior: Pasto verde / Arena dorada / Nieve blanca
        ctx.fillStyle = this.level === 1 ? '#4CD964' : (this.level === 2 ? '#FFAA33' : '#FFFFFF');
        ctx.beginPath();
        ctx.moveTo(startX, this.getGroundHeight(startX));
        for (let x = startX; x <= endX; x += step) {
            ctx.lineTo(x, this.getGroundHeight(x));
        }
        // Grosor del césped
        for (let x = endX; x >= startX; x -= step) {
            ctx.lineTo(x, this.getGroundHeight(x) + 22);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawScenery(ctx) {
        const startX = Math.max(0, this.cameraX - 100);
        const endX = this.cameraX + this.canvas.width + 100;

        for (let x = Math.floor(startX / 160) * 160; x <= endX; x += 160) {
            const y = this.getGroundHeight(x);
            if (this.level === 1) {
                // Margaritas y flores
                this.drawFlower(ctx, x, y - 6);
                if (x % 320 === 0) {
                    this.drawCartoonTree(ctx, x + 60, y);
                }
            } else if (this.level === 2) {
                // Cactus tierno
                if (x % 280 === 0) {
                    this.drawCactus(ctx, x, y);
                }
            } else {
                // Muñequito de nieve
                if (x % 320 === 0) {
                    this.drawSnowman(ctx, x, y);
                }
            }
        }
    }

    drawFlower(ctx, x, y) {
        ctx.fillStyle = '#FF2D55';
        for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5;
            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCartoonTree(ctx, x, y) {
        ctx.fillStyle = '#654321';
        ctx.fillRect(x - 8, y - 50, 16, 50);

        ctx.fillStyle = '#34C759';
        ctx.beginPath();
        ctx.arc(x, y - 65, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - 18, y - 50, 20, 0, Math.PI * 2);
        ctx.arc(x + 18, y - 50, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCactus(ctx, x, y) {
        ctx.fillStyle = '#34C759';
        ctx.beginPath();
        ctx.roundRect(x - 8, y - 55, 16, 55, 8);
        // Brazo izquierdo
        ctx.roundRect(x - 22, y - 42, 16, 8, 4);
        ctx.roundRect(x - 22, y - 52, 8, 14, 4);
        // Brazo derecho
        ctx.roundRect(x + 6, y - 35, 16, 8, 4);
        ctx.roundRect(x + 14, y - 48, 8, 16, 4);
        ctx.fill();
    }

    drawSnowman(ctx, x, y) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y - 18, 18, 0, Math.PI * 2);
        ctx.arc(x, y - 44, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#D0E6FF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nariz de zanahoria
        ctx.fillStyle = '#FF9500';
        ctx.beginPath();
        ctx.moveTo(x, y - 44);
        ctx.lineTo(x + 10, y - 42);
        ctx.lineTo(x, y - 40);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x + 2, y - 47, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar(ctx, x, y, sparkle) {
        ctx.save();
        ctx.translate(x, y);
        const scale = 1 + Math.sin(sparkle) * 0.15;
        ctx.scale(scale, scale);

        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 3;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 16, -Math.sin((18 + i * 72) * Math.PI / 180) * 16);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 8, -Math.sin((54 + i * 72) * Math.PI / 180) * 8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Brillo blanco en la punta
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(-2, -5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawFinishLine(ctx, x) {
        const y = this.getGroundHeight(x);

        // Postes del arco
        ctx.fillStyle = '#FF3B30';
        ctx.fillRect(x - 6, y - 150, 12, 150);

        // Cartel de llegada
        ctx.fillStyle = '#FFCC00';
        ctx.strokeStyle = '#FF9500';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(x - 50, y - 180, 100, 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#222';
        ctx.font = 'bold 18px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¡META! 🏁', x, y - 156);

        // Globos flotando
        const balloonColors = ['#FF2D55', '#007AFF', '#FFCC00', '#34C759'];
        balloonColors.forEach((color, i) => {
            const bx = x - 40 + i * 26;
            const by = y - 205 + Math.sin(Date.now() * 0.003 + i) * 8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(bx, by, 10, 13, 0, 0, Math.PI * 2);
            ctx.fill();

            // Cuerda
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by + 13);
            ctx.lineTo(x, y - 180);
            ctx.stroke();
        });
    }

    drawHUD(ctx, w) {
        // Contador de Estrellas con caja redondeada
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(20, 16, 170, 52, 26);
        ctx.fill();
        ctx.stroke();

        // Estrella dorada grande en el HUD
        this.drawStar(ctx, 48, 42, 0);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 26px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`× ${this.starsCollected}`, 80, 51);

        // Nivel Actual
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(w - 180, 16, 160, 52, 26);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#007AFF';
        ctx.font = 'bold 20px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Nivel ${this.level} de ${this.maxLevel}`, w - 100, 49);

        // Barra de progreso de la pista en el medio superior
        const barW = Math.min(260, w * 0.35);
        const barX = (w - barW) / 2;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.roundRect(barX, 26, barW, 16, 8);
        ctx.fill();

        const progress = Math.min(1, Math.max(0, this.bike.x / this.levelLength));
        ctx.fillStyle = '#34C759';
        ctx.beginPath();
        ctx.roundRect(barX, 26, barW * progress, 16, 8);
        ctx.fill();

        // Mini motito en la barra de progreso
        ctx.font = '16px sans-serif';
        ctx.fillText('🛵', barX + barW * progress, 38);
        ctx.fillText('🏁', barX + barW + 12, 38);
    }

    drawWinBanner(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, w, h);

        const bannerW = Math.min(520, w - 40);
        const bannerH = 280;
        const bx = (w - bannerW) / 2;
        const by = (h - bannerH) / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(bx, by, bannerW, bannerH, 28);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FF3B30';
        ctx.font = 'bold 36px "Comic Sans MS", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 ¡GENIAL! ¡GANASTE! 🎉', w / 2, by + 65);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px "Comic Sans MS", cursive, sans-serif';
        ctx.fillText(`Juntaste ${this.starsCollected} estrellas ⭐`, w / 2, by + 120);

        // Botón Siguiente Nivel o Jugar de Nuevo
        const btnNextText = this.level < this.maxLevel ? '🚀 ¡Siguiente Nivel!' : '⭐ ¡Volver a Jugar!';
        this.nextLevelBtnRect = { x: bx + 50, y: by + 160, w: bannerW - 100, h: 65 };

        ctx.fillStyle = '#34C759';
        ctx.beginPath();
        ctx.roundRect(this.nextLevelBtnRect.x, this.nextLevelBtnRect.y, this.nextLevelBtnRect.w, this.nextLevelBtnRect.h, 30);
        ctx.fill();
        ctx.strokeStyle = '#28A745';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Comic Sans MS", cursive, sans-serif';
        ctx.fillText(btnNextText, w / 2, by + 202);
    }

    handleClick(x, y) {
        if (this.won && this.nextLevelBtnRect) {
            const r = this.nextLevelBtnRect;
            if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
                if (this.level < this.maxLevel) {
                    this.setLevel(this.level + 1);
                } else {
                    this.setLevel(1);
                }
                return true;
            }
        }
        return false;
    }
}

window.HillsGame = HillsGame;
