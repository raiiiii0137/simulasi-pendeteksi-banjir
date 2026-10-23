// Web Audio API emergency sound synthesizer

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: number | null = null;
  public isSirenPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play short acoustic ultrasonic echo chirp
  public playPingChirp() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio playback might be restricted if no user interaction yet
    }
  }

  // Play hardware buzzer test beep (ESP32 buzzer)
  public playBuzzerBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(2400, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.setValueAtTime(0.0, now + 0.1);
      gain.gain.setValueAtTime(0.15, now + 0.15);
      gain.gain.setValueAtTime(0.0, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Audio error catch
    }
  }

  // Play continuous early warning siren (two-tone emergency wail)
  public startSiren() {
    if (this.isSirenPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(550, this.ctx.currentTime);

      this.sirenGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      this.sirenOsc.start();
      this.isSirenPlaying = true;

      let high = false;
      this.sirenInterval = window.setInterval(() => {
        if (!this.ctx || !this.sirenOsc) return;
        const targetFreq = high ? 550 : 880;
        this.sirenOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.35);
        high = !high;
      }, 450);
    } catch {
      // Browser autoplay policy catch
    }
  }

  // Stop siren
  public stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // ignore
      }
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch {
        // ignore
      }
      this.sirenGain = null;
    }
    this.isSirenPlaying = false;
  }
}

export const soundManager = new AudioSynthesizer();
