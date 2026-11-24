// js/audio.js - Sistema de Sonido y Voces (Web Audio API & Speech Synthesis)

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.engineOsc = null;
        this.engineGain = null;
        this.isEngineRunning = false;
        this.bgMusicPlaying = false;
        this.bgTimer = null;
        this.speechEnabled = false; // Desactivado completamente a petición
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopEngine();
            this.stopBgMusic();
        }
        return this.muted;
    }

    // Bocina divertida "¡Pip-pip!"
    playHorn() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        [0, 0.12].forEach((offset) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(420, now + offset);
            osc.frequency.setValueAtTime(440, now + offset + 0.05);

            gain.gain.setValueAtTime(0.3, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.09);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 0.1);
        });
    }

    // Sonido al agarrar estrellas o globos
    playStar() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.04);

            gain.gain.setValueAtTime(0.2, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.25);
        });
    }

    // Sonido de salto "¡Boing!"
    playJump() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.22);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    // Sonido al chocar charco de agua "¡Splash!"
    playSplash() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // Ruido blanco filtrado para agua
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.25);
    }

    // Sonido de frenada / patinada en aceite ("¡Screeech!")
    playSkid() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.35);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Sonido de flechas de velocidad turbo ("¡Fiuuuuuum!")
    playTurbo() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.45);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
    }

    // Sonido gracioso cuando tropieza o se inclina ("¡Ups!")
    playOops() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Sonido de victoria / meta "¡Tatatachán!"
    playWin() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, d: 0.15 }, // C
            { f: 659.25, d: 0.15 }, // E
            { f: 783.99, d: 0.15 }, // G
            { f: 1046.50, d: 0.45 } // High C
        ];

        let timeOffset = 0;
        notes.forEach((note) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, now + timeOffset);

            gain.gain.setValueAtTime(0.4, now + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + timeOffset);
            osc.stop(now + timeOffset + note.d);
            timeOffset += note.d * 0.9;
        });
    }

    // Sonido de motor continuo dinámico
    startEngine() {
        if (this.muted || this.isEngineRunning) return;
        this.init();
        try {
            this.engineOsc = this.ctx.createOscillator();
            this.engineGain = this.ctx.createGain();

            this.engineOsc.type = 'sawtooth';
            this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

            // Filtro para sonido más cálido de motito
            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(280, this.ctx.currentTime);

            this.engineGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

            this.engineOsc.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.ctx.destination);

            this.engineOsc.start();
            this.isEngineRunning = true;
        } catch (e) {
            console.warn("AudioContext engine error", e);
        }
    }

    updateEngine(speedRatio, isAccelerating) {
        if (!this.isEngineRunning || this.muted || !this.engineOsc) return;
        const targetFreq = 55 + Math.min(speedRatio * 130, 180) + (isAccelerating ? 40 : 0);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
        const targetGain = isAccelerating ? 0.12 : 0.05;
        this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }

    stopEngine() {
        if (!this.isEngineRunning) return;
        try {
            if (this.engineOsc) {
                this.engineOsc.stop();
                this.engineOsc.disconnect();
            }
        } catch(e) {}
        this.engineOsc = null;
        this.isEngineRunning = false;
    }

    // Música de fondo infantil suave y alegre
    startBgMusic() {
        if (this.muted || this.bgMusicPlaying) return;
        this.init();
        this.bgMusicPlaying = true;
        
        const melody = [
            261.63, 293.66, 329.63, 392.00, 329.63, 392.00,
            440.00, 392.00, 329.63, 261.63, 293.66, 261.63
        ];
        let step = 0;

        const playNote = () => {
            if (!this.bgMusicPlaying || this.muted) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melody[step % melody.length], now);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);

            step++;
            this.bgTimer = setTimeout(playNote, 420);
        };
        playNote();
    }

    stopBgMusic() {
        this.bgMusicPlaying = false;
        if (this.bgTimer) clearTimeout(this.bgTimer);
    }

    // Voces sintéticas desactivadas (solo efectos de sonido de juego)
    speak(phrase) {
        if ('speechSynthesis' in window) {
            try { window.speechSynthesis.cancel(); } catch (e) {}
        }
        return;
    }
}

window.soundController = new SoundController();
