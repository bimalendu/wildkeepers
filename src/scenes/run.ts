import type { GameState } from '../sim/types';

/** The mission in progress. Kept outside the scene so a window resize can rebuild the layout without losing the game. */
export const run: {
  state: GameState | null;
  result: { stars: number; impact: number } | null;
  /** Where Back / Continue returns to after a mission. */
  back: { scene: string; data?: object };
  /** Mission screen selection, kept so a relayout (window resize, rotation) does not lose it. */
  ui: { selected: number; lastEventTurn: number };
} = { state: null, result: null, back: { scene: 'WorldMap' }, ui: { selected: -1, lastEventTurn: 0 } };
