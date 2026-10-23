export class AudioBus {
  constructor() {
    this.ctx = null
    this.master = null
    this.enabled = true
  }

  unlock() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    if (!this.ctx) {
      this.ctx = new AudioCtx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.enabled ? 0.8 : 0
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
  }

  setEnabled(enabled) {
    this.enabled = enabled
    if (this.master) this.master.gain.value = enabled ? 0.8 : 0
  }

  playSelect(step = 0) {
    this.tone(430 + step * 36, 0.045, 'sine', 0.05)
  }

  playWord() {
    this.sequence([523, 659, 784, 1046], 0.09, 'triangle', 0.07)
  }

  playHint() {
    this.sequence([494, 740], 0.1, 'sine', 0.05)
  }

  playWin() {
    this.sequence([523, 659, 784, 1046, 784, 1318], 0.11, 'triangle', 0.07)
  }

  playError() {
    this.tone(164, 0.12, 'sine', 0.04)
  }

  playCoin() {
    this.tone(880, 0.08, 'triangle', 0.05)
  }

  playTap() {
    this.tone(320, 0.04, 'square', 0.03)
  }

  tone(freq, duration, type, gain) {
    if (!this.enabled || !this.ctx || !this.master) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const amp = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    amp.gain.setValueAtTime(gain, now)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(amp)
    amp.connect(this.master)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  sequence(freqs, duration, type, gain) {
    freqs.forEach((freq, index) => {
      window.setTimeout(() => this.tone(freq, duration, type, gain), index * duration * 700)
    })
  }
}
