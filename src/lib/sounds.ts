/**
 * Web Audio API sound synthesiser.
 * Generates all game sounds procedurally — no audio files needed.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function resumeCtx() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
  return c;
}

/** Ice scrape sound when stone is thrown */
export function playThrow() {
  const c = resumeCtx();
  if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.5;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2000;
  src.connect(filter);
  filter.connect(c.destination);
  src.start();
}

/** Thunk when two stones collide */
export function playCollision() {
  const c = resumeCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.15);
  gain.gain.setValueAtTime(0.6, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.25);
}

/** Crowd cheer / score sound */
export function playScore() {
  const c = resumeCtx();
  if (!c) return;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, c.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.3, c.currentTime + i * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.12 + 0.35);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + i * 0.12);
    osc.stop(c.currentTime + i * 0.12 + 0.4);
  });
}

/** Short click for UI interaction */
export function playClick() {
  const c = resumeCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.06);
}

/** Stone comes to rest — soft thud */
export function playStop() {
  const c = resumeCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.2);
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.22);
}

// ─── Background music ─────────────────────────────────────────────────────────

let musicNodes: AudioNode[] = [];
let musicInterval: ReturnType<typeof setInterval> | null = null;
let musicEnabled = false;

export function startMusic() {
  const c = resumeCtx();
  if (!c || musicEnabled) return;
  musicEnabled = true;
  playMusicBeat(c);
  musicInterval = setInterval(() => {
    if (musicEnabled && c) playMusicBeat(c);
  }, 1200);
}

export function stopMusic() {
  musicEnabled = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  musicNodes.forEach((n) => {
    try {
      (n as AudioBufferSourceNode).stop?.();
      n.disconnect();
    } catch { /* ignore */ }
  });
  musicNodes = [];
}

function playMusicBeat(c: AudioContext) {
  // Simple arpeggio motif in C minor pentatonic
  const scale = [130.81, 155.56, 196.0, 233.08, 261.63];
  const noteIdx = Math.floor(Math.random() * scale.length);
  const freq = scale[noteIdx];

  const osc = c.createOscillator();
  const gain = c.createGain();
  const reverb = c.createConvolver();

  // Tiny reverb impulse
  const irLen = c.sampleRate * 0.5;
  const irBuf = c.createBuffer(1, irLen, c.sampleRate);
  const irData = irBuf.getChannelData(0);
  for (let i = 0; i < irLen; i++) {
    irData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2) * 0.3;
  }
  reverb.buffer = irBuf;

  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);

  osc.connect(gain);
  gain.connect(reverb);
  reverb.connect(c.destination);

  osc.start();
  osc.stop(c.currentTime + 1.0);
  musicNodes.push(osc, gain);
}
