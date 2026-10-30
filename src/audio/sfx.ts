/** Sound effects made with the Web Audio API: no audio files to ship, license or download. */
export type Sfx = 'click' | 'ok' | 'error' | 'turn' | 'win' | 'lose';

/** [start Hz, end Hz, start offset s, length s, wave type, volume] */
type Note = [number, number, number, number, OscillatorType, number];

const NOTES: Record<Sfx, Note[]> = {
  click: [[620, 520, 0, 0.05, 'triangle', 0.08]],
  ok: [[520, 520, 0, 0.07, 'sine', 0.12], [780, 780, 0.07, 0.11, 'sine', 0.12]],
  error: [[180, 130, 0, 0.14, 'square', 0.07]],
  turn: [[240, 150, 0, 0.16, 'sine', 0.14]],
  win: [[523, 523, 0, 0.13, 'triangle', 0.13], [659, 659, 0.13, 0.13, 'triangle', 0.13], [784, 784, 0.26, 0.13, 'triangle', 0.13], [1047, 1047, 0.39, 0.3, 'triangle', 0.13]],
  lose: [[330, 330, 0, 0.2, 'sawtooth', 0.07], [262, 262, 0.2, 0.2, 'sawtooth', 0.07], [196, 150, 0.4, 0.4, 'sawtooth', 0.07]],
};

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Plays a sound unless muted. Safe to call anywhere: it does nothing when audio is unavailable or not yet allowed. */
export function playSfx(name: Sfx, muted: boolean): void {
  if (muted) return;
  const c = context();
  if (!c) return;
  if (c.state === 'suspended') void c.resume().catch(() => undefined);
  const t0 = c.currentTime;
  for (const [f0, f1, at, len, type, vol] of NOTES[name]) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0 + at);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(f1, t0 + at + len);
    gain.gain.setValueAtTime(0.0001, t0 + at);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + len + 0.02);
  }
}
