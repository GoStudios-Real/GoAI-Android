/* GoConsoleOS - GoStudioFrx sound engine (WebAudio) */
(function () {
  const SOUNDS = window.GoSound = {
    enabled: true,
    ac: null,
    master: null,

    ensure() {
      if (this.ac) {
        if (this.ac.state === 'suspended') this.ac.resume();
        return this.ac;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ac = new AC();
      this.master = this.ac.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ac.destination);
      return this.ac;
    },

    tone(freq, dur, type, vol, delay, glide) {
      if (!this.enabled) return;
      const ac = this.ensure();
      if (!ac) return;
      const t0 = ac.currentTime + (delay || 0);
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(freq, t0);
      if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(this.master);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    },

    play(name) {
      switch (name) {
        case 'power':
          this.tone(120, 0.28, 'square', 0.2, 0, 720);
          this.tone(360, 0.18, 'square', 0.16, 0.1, 880);
          this.tone(540, 0.5, 'square', 0.16, 0.2, 960);
          this.tone(1080, 0.55, 'sine', 0.1, 0.32);
          break;
        case 'confirm':
          this.tone(560, 0.09, 'square', 0.16);
          this.tone(760, 0.11, 'square', 0.16, 0.09);
          this.tone(1120, 0.18, 'square', 0.15, 0.18);
          break;
        case 'select':
          this.tone(680, 0.08, 'square', 0.14);
          this.tone(920, 0.09, 'square', 0.13, 0.07);
          break;
        case 'message':
          this.tone(880, 0.1, 'triangle', 0.2);
          this.tone(1180, 0.2, 'triangle', 0.16, 0.1);
          break;
        case 'send':
          this.tone(720, 0.07, 'square', 0.16);
          this.tone(1080, 0.07, 'square', 0.16, 0.06);
          break;
        case 'error':
          this.tone(240, 0.16, 'sawtooth', 0.2);
          this.tone(170, 0.28, 'sawtooth', 0.2, 0.16);
          break;
        case 'notify':
          this.tone(1046, 0.09, 'square', 0.14);
          this.tone(1568, 0.12, 'square', 0.13, 0.08);
          break;
        case 'success':
          this.tone(523, 0.09, 'square', 0.16);
          this.tone(659, 0.09, 'square', 0.16, 0.08);
          this.tone(784, 0.09, 'square', 0.16, 0.16);
          this.tone(1046, 0.22, 'square', 0.15, 0.24);
          break;
        case 'tick':
          this.tone(1400, 0.02, 'square', 0.05);
          break;
        case 'timer':
          this.tone(880, 0.12, 'square', 0.18);
          this.tone(880, 0.12, 'square', 0.18, 0.22);
          this.tone(880, 0.12, 'square', 0.18, 0.44);
          this.tone(1174, 0.5, 'square', 0.2, 0.66);
          break;
        case 'voicestart':
          this.tone(990, 0.08, 'square', 0.14);
          this.tone(1318, 0.1, 'square', 0.13, 0.08);
          break;
        case 'voicestop':
          this.tone(1318, 0.08, 'square', 0.14);
          this.tone(990, 0.1, 'square', 0.13, 0.08);
          break;
        case 'coin':
          this.tone(1568, 0.06, 'square', 0.15);
          this.tone(2093, 0.12, 'square', 0.14, 0.07);
          this.tone(2637, 0.3, 'square', 0.13, 0.14);
          break;
        case 'level':
          this.tone(392, 0.09, 'square', 0.16);
          this.tone(523, 0.09, 'square', 0.16, 0.09);
          this.tone(659, 0.09, 'square', 0.16, 0.18);
          this.tone(1046, 0.3, 'square', 0.16, 0.27);
          break;
        case 'bounce':
          this.tone(220, 0.07, 'square', 0.16, 0, 440);
          this.tone(330, 0.07, 'square', 0.14, 0.07, 660);
          break;
        case 'point':
          this.tone(880, 0.07, 'square', 0.15);
          this.tone(1174, 0.09, 'square', 0.14, 0.07);
          this.tone(1568, 0.2, 'square', 0.14, 0.14);
          break;
        case 'gameover':
          this.tone(392, 0.16, 'sawtooth', 0.18);
          this.tone(330, 0.16, 'sawtooth', 0.18, 0.16);
          this.tone(262, 0.4, 'sawtooth', 0.18, 0.32);
          break;
        case 'clear':
          this.tone(520, 0.08, 'triangle', 0.14, 0, 400);
          break;
        default:
          this.tone(600, 0.1, 'square', 0.12);
      }
    }
  };

  window.GoSoundOS = SOUNDS;
})();