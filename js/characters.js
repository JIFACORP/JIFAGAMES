// js/characters.js - Dibujo en Canvas de Personajes, Motos y Autos de F1

// Polyfill de compatibilidad para roundRect en navegadores o tablets
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

const PILOT_AVATARS = {
    joaquin: new Image(),
    ignacio: new Image()
};
PILOT_AVATARS.joaquin.src = 'assets/joaquin.jpg';
PILOT_AVATARS.ignacio.src = 'assets/ignacio.jpg';
window.PILOT_AVATARS = PILOT_AVATARS;

const GAME_CONFIG = {
    selectedRider: 'joaquin', // 'joaquin', 'ignacio'
    selectedColor: '#DC0000', // Color principal del vehículo
    selectedTeam: 'ferrari',  // 'ferrari', 'mercedes', 'redbull', 'mclaren'
    riders: [
        { id: 'joaquin', name: 'Joaquín', desc: '¡Piloto estrella con boina!' },
        { id: 'ignacio', name: 'Ignacio', desc: '¡Piloto experto con estilo!' }
    ],
    teams: {
        ferrari:  { name: 'Ferrari',  body: '#DC0000', accent: '#FFCC00', wing: '#DC0000', endplate: '#181818', stripe: '#FFFFFF', number: 16 },
        mercedes: { name: 'Mercedes', body: '#2C353C', accent: '#00D2BE', wing: '#1E2429', endplate: '#00D2BE', stripe: '#00D2BE', number: 44 },
        redbull:  { name: 'Red Bull', body: '#121F45', accent: '#FFCC00', wing: '#121F45', endplate: '#E10600', stripe: '#E10600', number: 1  },
        mclaren:  { name: 'McLaren',  body: '#FF8000', accent: '#00AEEF', wing: '#18181B', endplate: '#FF8000', stripe: '#18181B', number: 4  }
    },
    colors: [
        { name: 'Ferrari', hex: '#DC0000' },
        { name: 'Mercedes', hex: '#00D2BE' },
        { name: 'Red Bull', hex: '#121F45' },
        { name: 'McLaren', hex: '#FF8000' }
    ]
};

// ==========================================
// 1. MOTO VISTA LATERAL (Para Colinas y Saltos)
// ==========================================
function drawSideMotorcycle(ctx, x, y, angle, wheelAngle, suspensionY = 0, isAccelerating = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const mainColor = GAME_CONFIG.selectedColor;
    const rider = GAME_CONFIG.selectedRider;

    // Sombra en el suelo
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 36, 48, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rueda Trasera (Izquierda)
    drawSideWheel(ctx, -38, 20 + suspensionY * 0.3, wheelAngle);

    // Rueda Delantera (Derecha)
    drawSideWheel(ctx, 38, 20 + suspensionY * 0.3, wheelAngle);

    // Caño de Escape con humito
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 8);
    ctx.lineTo(-30, 8);
    ctx.lineTo(-44, 2);
    ctx.stroke();

    // Silenciador cromado
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    ctx.roundRect(-46, -2, 20, 9, 3);
    ctx.fill();

    // Chasis
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(38, 20 + suspensionY * 0.3);
    ctx.lineTo(15, -12);
    ctx.moveTo(-38, 20 + suspensionY * 0.3);
    ctx.lineTo(-8, 5);
    ctx.lineTo(15, -12);
    ctx.stroke();

    // Carrocería
    ctx.fillStyle = mainColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-25, 2);
    ctx.quadraticCurveTo(-15, -12, 5, -14);
    ctx.quadraticCurveTo(20, -14, 22, -6);
    ctx.quadraticCurveTo(15, 6, -10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Asiento
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.roundRect(-24, -4, 22, 7, [4, 4, 1, 1]);
    ctx.fill();

    // Guardabarros delantero
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(38, 20 + suspensionY * 0.3, 21, Math.PI * 1.15, Math.PI * 1.75);
    ctx.stroke();

    // Manubrio
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, -12);
    ctx.lineTo(10, -22);
    ctx.lineTo(5, -20);
    ctx.stroke();

    // Faro delantero
    ctx.fillStyle = '#FFF9A6';
    ctx.beginPath();
    ctx.arc(23, -8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Piloto
    drawSideRider(ctx, rider, mainColor);

    ctx.restore();
}

function drawSideWheel(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFCC00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
        ctx.stroke();
    }

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawSideRider(ctx, rider, helmetColor) {
    ctx.save();
    ctx.translate(-8, -14);

    // Patitas / Piernas
    ctx.strokeStyle = '#2B3A4A';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(10, 14);
    ctx.lineTo(16, 12);
    ctx.stroke();

    // Torso según piloto humano Funko Pop
    const isJoaquin = rider === 'joaquin';
    const torsoColor = isJoaquin ? '#D32F2F' : (rider === 'ignacio' ? '#F5A623' : '#FF9500');
    ctx.fillStyle = torsoColor;
    ctx.beginPath();
    ctx.roundRect(-6, -14, 15, 18, 5);
    ctx.fill();

    if (isJoaquin) {
        // Camisa blanca y pañuelo negro en el cuello
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(4, -13, 5, 14);
        ctx.fillStyle = '#181818';
        ctx.beginPath();
        ctx.moveTo(-2, -14); ctx.lineTo(8, -14); ctx.lineTo(6, -7);
        ctx.closePath();
        ctx.fill();
    } else if (rider === 'ignacio') {
        // Capucha dorada
        ctx.fillStyle = '#D98200';
        ctx.beginPath();
        ctx.roundRect(-8, -15, 12, 7, 3);
        ctx.fill();
    }

    // Brazos
    ctx.strokeStyle = isJoaquin ? '#FFFFFF' : torsoColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(16, -7);
    ctx.stroke();

    // Cabeza grande estilo Funko Pop
    ctx.translate(4, -22);
    if (isJoaquin || rider === 'ignacio') {
        // Oreja izquierda
        ctx.fillStyle = '#E0B28B';
        ctx.beginPath();
        ctx.arc(-13, 2, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Cabeza cuadrada redondeada Funko Pop
        ctx.fillStyle = '#F2C9A5';
        ctx.beginPath();
        ctx.roundRect(-14, -13, 28, 25, 9);
        ctx.fill();
        ctx.strokeStyle = '#D9A77E';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ojo negro brillante estilo Funko Pop
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(6, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(7.3, -1.4, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa
        ctx.strokeStyle = '#7A4932';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(5, 5, 4, 0.1, 1.3);
        ctx.stroke();

        if (isJoaquin) {
            // Pelo castaño + boina negra ladeada
            ctx.fillStyle = '#5D4037';
            ctx.beginPath();
            ctx.roundRect(-14, -13, 24, 9, 4);
            ctx.fill();

            ctx.fillStyle = '#1B1B1E';
            ctx.beginPath();
            ctx.ellipse(-2, -12, 17, 6.5, -0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#3A3A40';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        } else {
            // Pelo corto oscuro + barba sutil + lentes de sol sobre la cabeza
            ctx.fillStyle = '#2B211E';
            ctx.beginPath();
            ctx.roundRect(-14, -14, 27, 9, 5);
            ctx.fill();

            ctx.fillStyle = 'rgba(60, 45, 38, 0.25)';
            ctx.beginPath();
            ctx.roundRect(-6, 4, 19, 8, 4);
            ctx.fill();

            // Lentes de sol sobre la cabeza
            ctx.fillStyle = '#222222';
            ctx.beginPath();
            ctx.roundRect(-5, -18, 18, 5.5, 2);
            ctx.fill();
            ctx.fillStyle = '#455A64';
            ctx.fillRect(2, -17, 8, 3.5);
        }

        ctx.restore();
        return;
    }

    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(7, -1, 7, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.fill();

    if (rider === 'perrito') {
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.ellipse(-7, 2, 5, 10, -0.2, 0, Math.PI * 2);
        ctx.fill();
        drawCuteEye(ctx, 4, -2);
        ctx.fillStyle = '#F5DEB3';
        ctx.beginPath();
        ctx.arc(8, 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(11, 2, 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'gatito') {
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(-5, -14); ctx.lineTo(0, -22); ctx.lineTo(5, -14);
        ctx.closePath();
        ctx.fill();
        drawCuteEye(ctx, 4, -2);
    } else if (rider === 'dino') {
        ctx.fillStyle = '#FFCC00';
        for (let i = -2; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 6 - 3, -15);
            ctx.lineTo(i * 6, -21);
            ctx.lineTo(i * 6 + 3, -15);
            ctx.fill();
        }
        drawCuteEye(ctx, 4, -2);
    } else {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(-8, -10, 6, 0, Math.PI * 2);
        ctx.fill();
        drawCuteEye(ctx, 4, -2);
    }

    ctx.restore();
}

function drawCuteEye(ctx, x, y) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(x + 1, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 2, y - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
}

// ==========================================
// 2. AUTOS DE FÓRMULA 1 ANIMADOS (CARRERA)
// ==========================================
function drawCartoonF1Car(ctx, x, y, carColor, number = 1, rider = 'perrito', tiltAngle = 0, isAccelerating = true, hasTurbo = false, isSkidding = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tiltAngle * 0.35 + (isSkidding ? Math.sin(Date.now() * 0.03) * 0.25 : 0));

    // 1. Sombra aerodinámica suave
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 30, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Llamas de escape traseras (Turbo o Aceleración)
    if (hasTurbo || (isAccelerating && Math.random() < 0.65)) {
        const flameLength = hasTurbo ? 30 + Math.random() * 16 : 14 + Math.random() * 8;
        const flameWidth = hasTurbo ? 16 : 8;

        // Fuego exterior
        ctx.fillStyle = hasTurbo ? '#00e5ff' : '#FF9500';
        ctx.beginPath();
        ctx.moveTo(-flameWidth / 2, 38);
        ctx.lineTo(0, 38 + flameLength);
        ctx.lineTo(flameWidth / 2, 38);
        ctx.closePath();
        ctx.fill();

        // Fuego interior
        ctx.fillStyle = hasTurbo ? '#ffffff' : '#FFCC00';
        ctx.beginPath();
        ctx.moveTo(-flameWidth / 4, 38);
        ctx.lineTo(0, 38 + flameLength * 0.6);
        ctx.lineTo(flameWidth / 4, 38);
        ctx.closePath();
        ctx.fill();
    }

    // 3. Brazos de suspensión delanteros y traseros
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3;
    // Delanteros
    ctx.beginPath();
    ctx.moveTo(-8, -24); ctx.lineTo(-24, -26);
    ctx.moveTo(-8, -18); ctx.lineTo(-24, -24);
    ctx.moveTo(8, -24);  ctx.lineTo(24, -26);
    ctx.moveTo(8, -18);  ctx.lineTo(24, -24);
    // Traseros
    ctx.moveTo(-10, 20); ctx.lineTo(-26, 22);
    ctx.moveTo(-10, 26); ctx.lineTo(-26, 24);
    ctx.moveTo(10, 20);  ctx.lineTo(26, 22);
    ctx.moveTo(10, 26);  ctx.lineTo(26, 24);
    ctx.stroke();

    // 4. Ruedas F1 (Neumáticos anchos de carrera con franja amarilla)
    drawF1Wheel(ctx, -24, -26, 11, 20); // Delantera Izq
    drawF1Wheel(ctx, 24, -26, 11, 20);  // Delantera Der
    drawF1Wheel(ctx, -26, 22, 13, 23);  // Trasera Izq
    drawF1Wheel(ctx, 26, 22, 13, 23);   // Trasera Der

    // 5. Pontones Laterales (Sidepods)
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.roundRect(-21, -12, 11, 32, [4, 2, 4, 4]);
    ctx.roundRect(10, -12, 11, 32, [2, 4, 4, 4]);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Entradas de aire negras de los pontones
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.roundRect(-19, -10, 7, 5, 2);
    ctx.roundRect(12, -10, 7, 5, 2);
    ctx.fill();

    // 6. Chasis Central y Morro Aerodinámico F1
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.moveTo(0, -42);        // Punta del morro
    ctx.lineTo(7, -32);
    ctx.lineTo(8, -6);
    ctx.lineTo(10, 36);        // Parte trasera
    ctx.lineTo(-10, 36);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-7, -32);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Aleta de tiburón dorsal (Shark fin)
    ctx.fillStyle = '#222222';
    ctx.fillRect(-2, 10, 4, 24);

    // 7. Alerón Delantero F1 (Front Wing)
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.roundRect(-27, -42, 54, 8, 3);
    ctx.fill();
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Endplates del alerón delantero
    ctx.fillStyle = '#222222';
    ctx.fillRect(-28, -45, 4, 12);
    ctx.fillRect(24, -45, 4, 12);

    // 8. Alerón Trasero F1 (Rear Wing)
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.roundRect(-27, 34, 54, 8, 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Endplates del alerón trasero
    ctx.fillStyle = '#222222';
    ctx.fillRect(-28, 30, 4, 14);
    ctx.fillRect(24, 30, 4, 14);

    // 9. Número de Carrera en el Morro
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -22, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#111111';
    ctx.font = '900 9px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${number}`, 0, -21.5);

    // 10. Cabina (Cockpit) y Halo de Seguridad
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(0, -2, 7, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -4, 6.5, Math.PI * 0.85, Math.PI * 2.15);
    ctx.stroke();

    // 11. Casco del Piloto
    drawF1PilotHead(ctx, 0, -2, carColor, rider);

    ctx.restore();
}

function drawF1Wheel(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    // Goma negra
    ctx.fillStyle = '#1e1e1e';
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 4);
    ctx.fill();

    // Franja amarilla estilo Pirelli de F1
    ctx.strokeStyle = '#FFCC00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 1.5, -h / 2 + 3, w - 3, h - 6, 2);
    ctx.stroke();

    // Llanta interior gris
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawF1PilotHead(ctx, x, y, helmetColor, rider) {
    ctx.save();
    ctx.translate(x, y);

    // Casco
    if (rider === 'joaquin') {
        ctx.fillStyle = '#F2C9A5';
        ctx.beginPath();
        ctx.roundRect(-8, -7, 16, 13, 4);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-3.5, 0, 2, 0, Math.PI * 2);
        ctx.arc(3.5, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(-7, -7, 14, 4);
        ctx.fillStyle = '#19191D';
        ctx.beginPath();
        ctx.ellipse(-1.5, -7, 10, 4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    if (rider === 'ignacio') {
        ctx.fillStyle = '#F2C9A5';
        ctx.beginPath();
        ctx.roundRect(-8, -7, 16, 13, 4);
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(-3.5, 0, 2, 0, Math.PI * 2);
        ctx.arc(3.5, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2B211E';
        ctx.fillRect(-8, -8, 16, 5);
        ctx.fillStyle = '#181818';
        ctx.fillRect(-8, -10, 16, 3);
        ctx.restore();
        return;
    }

    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Visera
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(0, -2.5, 5.5, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(0, -3.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Orejas / crestas de personajes
    if (rider === 'perrito') {
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.ellipse(-7, 1, 2.5, 4.5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(7, 1, 2.5, 4.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'gatito') {
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(-5, -4); ctx.lineTo(-7, -9); ctx.lineTo(-2, -7);
        ctx.moveTo(5, -4); ctx.lineTo(7, -9); ctx.lineTo(2, -7);
        ctx.fill();
    } else if (rider === 'dino') {
        ctx.fillStyle = '#34C759';
        ctx.beginPath();
        ctx.arc(0, 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'osito') {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(-6, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'leon') {
        // Melena de león
        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = helmetColor;
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'tigre') {
        // Orejitas de tigre
        ctx.fillStyle = '#FF9500';
        ctx.beginPath();
        ctx.arc(-6, -5, 3, 0, Math.PI * 2);
        ctx.arc(6, -5, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'zorro') {
        // Orejitas de zorro
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.moveTo(-6, -4); ctx.lineTo(-9, -10); ctx.lineTo(-3, -7);
        ctx.moveTo(6, -4); ctx.lineTo(9, -10); ctx.lineTo(3, -7);
        ctx.fill();
    } else if (rider === 'conejo') {
        // Orejas largas
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(-4, -10, 2.5, 6, -0.1, 0, Math.PI * 2);
        ctx.ellipse(4, -10, 2.5, 6, 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// =======================================================
// 3. AUTO DE FÓRMULA 1 EN PERSPECTIVA 3D (VISTA TRASERA)
// =======================================================
function drawF1CarRearView(ctx, x, y, scale = 1, carColor = '#DC0000', number = 1, rider = 'joaquin', tilt = 0, hasTurbo = false, isSkidding = false, teamId = null) {
    if (scale <= 0.05) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Determinar paleta de escudería si está definida
    const team = teamId && GAME_CONFIG.teams[teamId] ? GAME_CONFIG.teams[teamId] : null;
    const bodyCol = team ? team.body : carColor;
    const wingCol = team ? team.wing : carColor;
    const endplateCol = team ? team.endplate : '#181818';
    const accentCol = team ? team.accent : '#FFFFFF';
    const stripeCol = team ? team.stripe : '#FFFFFF';

    // Inclinación suave de la carrocería en curvas
    const rollAngle = tilt * 0.12 + (isSkidding ? Math.sin(Date.now() * 0.04) * 0.15 : 0);
    ctx.rotate(rollAngle);

    // 1. Sombra aerodinámica bajo el auto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 56, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Humo de derrape si patina en aceite
    if (isSkidding && Math.random() < 0.6) {
        ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        ctx.beginPath();
        ctx.arc(-42 + (Math.random() - 0.5) * 10, 16, 8 + Math.random() * 8, 0, Math.PI * 2);
        ctx.arc(42 + (Math.random() - 0.5) * 10, 16, 8 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Fuego / Llamas de Escape Nitro
    if (hasTurbo || Math.random() < 0.8) {
        const flameLen = hasTurbo ? 32 + Math.random() * 18 : 12 + Math.random() * 8;
        const flameColOuter = hasTurbo ? '#00e5ff' : '#FF9500';
        const flameColInner = hasTurbo ? '#ffffff' : '#FFEB3B';

        [-9, 9].forEach(exX => {
            ctx.fillStyle = flameColOuter;
            ctx.beginPath();
            ctx.moveTo(exX - 4, 14);
            ctx.lineTo(exX, 14 + flameLen);
            ctx.lineTo(exX + 4, 14);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = flameColInner;
            ctx.beginPath();
            ctx.moveTo(exX - 2, 14);
            ctx.lineTo(exX, 14 + flameLen * 0.6);
            ctx.lineTo(exX + 2, 14);
            ctx.closePath();
            ctx.fill();
        });
    }

    // 4. Brazos de suspensión traseros
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, 4);  ctx.lineTo(-44, 4);
    ctx.moveTo(-18, 14); ctx.lineTo(-44, 14);
    ctx.moveTo(20, 4);   ctx.lineTo(44, 4);
    ctx.moveTo(18, 14);  ctx.lineTo(44, 14);
    ctx.stroke();

    // 5. Ruedas Delanteras asomándose al girar
    const steerOffset = tilt * 8;
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.roundRect(-46 + steerOffset, -14, 14, 28, 4);
    ctx.roundRect(32 + steerOffset, -14, 14, 28, 4);
    ctx.fill();

    // 6. Ruedas Traseras Gigantes (Slicks anchos de F1)
    [-46, 26].forEach(wX => {
        // Goma negra
        ctx.fillStyle = '#181818';
        ctx.beginPath();
        ctx.roundRect(wX, -4, 20, 36, 6);
        ctx.fill();

        // Banda amarilla de Pirelli F1
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(wX + 3, -1, 14, 30, 4);
        ctx.stroke();

        // Tuerca central
        ctx.fillStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.arc(wX + 10, 14, 3.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // 7. Difusor Trasero de Fibra de Carbono
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.roundRect(-24, 10, 48, 12, 3);
    ctx.fill();

    // Aletas del difusor
    ctx.fillStyle = '#222222';
    for (let i = -16; i <= 16; i += 8) {
        ctx.fillRect(i - 1, 10, 2, 12);
    }

    // Luz de lluvia roja F1 parpadeante en el centro
    const rainLightOn = Math.floor(Date.now() / 150) % 2 === 0;
    ctx.fillStyle = rainLightOn ? '#FF1744' : '#550000';
    ctx.beginPath();
    ctx.roundRect(-4, 12, 8, 6, 2);
    ctx.fill();
    if (rainLightOn) {
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // 8. Chasis / Carrocería Trasera con colores de escudería
    const bodyGrad = ctx.createLinearGradient(-26, 0, 26, 0);
    bodyGrad.addColorStop(0, bodyCol);
    bodyGrad.addColorStop(0.5, lightenColor(bodyCol, 28));
    bodyGrad.addColorStop(1, bodyCol);

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-24, 12);
    ctx.lineTo(-24, -2);
    ctx.lineTo(-12, -26);
    ctx.lineTo(12, -26);
    ctx.lineTo(24, -2);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = stripeCol;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Franja lateral de escudería en los pontones
    ctx.fillStyle = accentCol;
    ctx.fillRect(-20, -4, 5, 14);
    ctx.fillRect(15, -4, 5, 14);

    // Aleta de tiburón dorsal (Shark fin)
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(0, 4);
    ctx.lineTo(-2, 4);
    ctx.lineTo(-2, -28);
    ctx.fill();

    // Toma de aire superior (Airbox con detalle de escudería)
    ctx.fillStyle = accentCol;
    ctx.beginPath();
    ctx.ellipse(0, -26, 7.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.ellipse(0, -26, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 9. Piloto y Casco en el Cockpit
    drawF1PilotRear(ctx, 0, -12, bodyCol, rider);

    // 10. Gran Alerón Trasero de F1 (Rear Wing)
    ctx.fillStyle = '#222222';
    ctx.fillRect(-7, -18, 3, 18);
    ctx.fillRect(4, -18, 3, 18);

    const wingGrad = ctx.createLinearGradient(-48, -26, 48, -26);
    wingGrad.addColorStop(0, wingCol);
    wingGrad.addColorStop(0.5, lightenColor(wingCol, 32));
    wingGrad.addColorStop(1, wingCol);

    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.roundRect(-46, -26, 92, 11, 2);
    ctx.fill();
    ctx.strokeStyle = stripeCol;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Endplates laterales verticales del alerón
    ctx.fillStyle = endplateCol;
    ctx.beginPath();
    ctx.roundRect(-49, -32, 6, 20, 2);
    ctx.roundRect(43, -32, 6, 20, 2);
    ctx.fill();

    // Número de carrera en el centro del alerón
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -20.5, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.font = '900 8px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${number}`, 0, -20.5);

    ctx.restore();
}

function drawF1PilotRear(ctx, x, y, helmetColor, rider) {
    ctx.save();
    ctx.translate(x, y);

    if (rider === 'joaquin') {
        // Hombros: chaleco rojo + pañuelo negro estilo Funko Pop Joaquín
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.roundRect(-13, 3, 26, 9, 4);
        ctx.fill();
        ctx.fillStyle = '#181818';
        ctx.beginPath();
        ctx.moveTo(-7, 3); ctx.lineTo(7, 3); ctx.lineTo(0, 9);
        ctx.closePath();
        ctx.fill();

        // Orejas y cabeza cuadrada redondeada Funko Pop
        ctx.fillStyle = '#E0B28B';
        ctx.beginPath();
        ctx.arc(-11.5, -3, 3, 0, Math.PI * 2);
        ctx.arc(11.5, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F2C9A5';
        ctx.beginPath();
        ctx.roundRect(-11, -12, 22, 16, 6);
        ctx.fill();

        // Cabello castaño posterior
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.roundRect(-11, -12, 22, 13, 5);
        ctx.fill();

        // Boina negra ladeada a la izquierda (rasgo icónico de Joaquín)
        ctx.fillStyle = '#19191D';
        ctx.beginPath();
        ctx.ellipse(-2.5, -11, 14.5, 6.5, -0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#42424A';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        ctx.restore();
        return;
    }

    if (rider === 'ignacio') {
        // Hombros: chaqueta amarilla con capucha estilo Funko Pop Ignacio
        ctx.fillStyle = '#F5A623';
        ctx.beginPath();
        ctx.roundRect(-14, 3, 28, 9, 4);
        ctx.fill();
        ctx.fillStyle = '#D98200';
        ctx.beginPath();
        ctx.roundRect(-10, 1, 20, 6, 3);
        ctx.fill();

        // Orejas y cabeza cuadrada redondeada Funko Pop
        ctx.fillStyle = '#E0B28B';
        ctx.beginPath();
        ctx.arc(-12, -3, 3, 0, Math.PI * 2);
        ctx.arc(12, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F2C9A5';
        ctx.beginPath();
        ctx.roundRect(-11.5, -13, 23, 17, 6);
        ctx.fill();

        // Cabello corto oscuro posterior
        ctx.fillStyle = '#2B211E';
        ctx.beginPath();
        ctx.roundRect(-11.5, -13, 23, 14, 5);
        ctx.fill();

        // Lentes de sol descansando en la parte superior de la cabeza
        ctx.fillStyle = '#181818';
        ctx.beginPath();
        ctx.roundRect(-11, -16, 22, 4.5, 2);
        ctx.fill();
        ctx.fillStyle = '#546E7A';
        ctx.fillRect(-9, -15, 7, 2.5);
        ctx.fillRect(2, -15, 7, 2.5);

        ctx.restore();
        return;
    }

    // Rivales de F1 con casco integral clásico
    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-6, -2, 12, 3);

    if (rider === 'perrito') {
        ctx.fillStyle = '#8B5A2B';
        ctx.beginPath();
        ctx.ellipse(-8, 1, 3, 5, -0.3, 0, Math.PI * 2);
        ctx.ellipse(8, 1, 3, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'gatito') {
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.moveTo(-6, -4); ctx.lineTo(-9, -11); ctx.lineTo(-2, -8);
        ctx.moveTo(6, -4); ctx.lineTo(9, -11); ctx.lineTo(2, -8);
        ctx.fill();
    } else if (rider === 'dino') {
        ctx.fillStyle = '#FFD700';
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 3 - 1.5, -9);
            ctx.lineTo(i * 3, -14);
            ctx.lineTo(i * 3 + 1.5, -9);
            ctx.fill();
        }
    } else if (rider === 'osito') {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(-7, -5, 3.5, 0, Math.PI * 2);
        ctx.arc(7, -5, 3.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (rider === 'leon') {
        ctx.fillStyle = '#E65100';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = helmetColor;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function lightenColor(col, amt) {
    let usePound = false;
    if (col[0] === '#') {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let b = ((num >> 8) & 0x00FF) + amt;
    let g = (num & 0x0000FF) + amt;
    r = Math.min(255, Math.max(0, r));
    b = Math.min(255, Math.max(0, b));
    g = Math.min(255, Math.max(0, g));
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
