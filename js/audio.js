// js/audio.js - Sistema de Sonido y Voces (Web Audio API & Speech Synthesis)

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.engineOsc = null;
        this.engineHarmonic = null;
        this.engineFilter = null;
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
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(115, now + 0.25);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
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

    // Sonido aerodinámico muy suave (brisa / rodaje sobre asfalto sin zumbido electrónico)
    startEngine() {
        if (this.muted || this.isEngineRunning) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const sr = this.ctx.sampleRate || 44100;
            const len = Math.floor(sr * 2.0);
            const buffer = this.ctx.createBuffer(1, len, sr);
            const data = buffer.getChannelData(0);

            // Ruido rosa cálido (suena como aire y neumáticos, sin tono molesto)
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < len; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
                b6 = white * 0.115926;
            }
            // Crossfade en los extremos del bucle para transición 100% invisible
            const fade = Math.min(4096, Math.floor(len * 0.05));
            for (let i = 0; i < fade; i++) {
                const a = i / fade;
                data[i] = data[i] * a + data[len - fade + i] * (1 - a);
            }

            this.engineOsc = this.ctx.createBufferSource();
            this.engineOsc.buffer = buffer;
            this.engineOsc.loop = true;

            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(160, now);
            this.engineFilter.Q.setValueAtTime(0.7, now);

            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.setValueAtTime(0.012, now);

            this.engineOsc.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.ctx.destination);

            this.engineOsc.start(now);
            this.isEngineRunning = true;
        } catch (e) {
            console.warn("AudioContext engine error", e);
        }
    }

    updateEngine(speedRatio, isAccelerating) {
        if (!this.isEngineRunning || this.muted || !this.engineOsc) return;
        const now = this.ctx.currentTime;
        const clamped = Math.max(0, Math.min(1.35, speedRatio || 0));
        if (this.engineFilter) {
            const cutoff = 140 + clamped * 230 + (isAccelerating ? 40 : 0);
            this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.14);
        }
        const targetGain = isAccelerating ? (0.016 + clamped * 0.014) : 0.008;
        this.engineGain.gain.setTargetAtTime(targetGain, now, 0.14);
    }

    stopEngine() {
        if (!this.isEngineRunning) return;
        try {
            if (this.engineOsc) {
                this.engineOsc.stop();
                this.engineOsc.disconnect();
            }
            if (this.engineHarmonic) {
                this.engineHarmonic.stop();
                this.engineHarmonic.disconnect();
            }
            if (this.engineFilter) {
                this.engineFilter.disconnect();
            }
        } catch(e) {}
        this.engineOsc = null;
        this.engineHarmonic = null;
        this.engineFilter = null;
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
