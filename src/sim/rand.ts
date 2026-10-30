import type { GameState } from './types';

/** Deterministic randomness drawn from the game state, so any run is exactly replayable from its seed. */
export function nextFloat(state: Pick<GameState, 'rngState'>): number {
  state.rngState = (state.rngState + 0x6d2b79f5) >>> 0;
  let t = state.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const nextInt = (state: Pick<GameState, 'rngState'>, n: number): number => Math.floor(nextFloat(state) * n);

export function pick<T>(state: Pick<GameState, 'rngState'>, items: readonly T[]): T | undefined {
  return items.length ? items[nextInt(state, items.length)] : undefined;
}

export function shuffle<T>(state: Pick<GameState, 'rngState'>, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(state, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A throwaway rng for one planning pass: the same inputs always give the same stream, so plans can be recomputed. */
export function localRng(...parts: number[]): { rngState: number } {
  let h = 0x811c9dc5;
  for (const p of parts) h = Math.imul(h ^ (p | 0), 0x01000193) >>> 0;
  return { rngState: h >>> 0 };
}
