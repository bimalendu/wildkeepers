import { describe, expect, it } from 'vitest';
import first from '../src/levels/missions/prologue/first-steps.json';
import { createGame, endTurn, ecoHealth } from '../src/sim/engine';
import { perform } from '../src/sim/actions';
import type { MissionDef } from '../src/sim/types';

const mission = first as unknown as MissionDef;

describe('sim core', () => {
  it('is deterministic from a seed', () => {
    const a = createGame(mission);
    const b = createGame(mission);
    for (let i = 0; i < 5; i++) (endTurn(a), endTurn(b));
    expect(JSON.stringify(a.tiles)).toBe(JSON.stringify(b.tiles));
  });

  it('threats damage the ecosystem when nobody acts', () => {
    const s = createGame(mission);
    const before = ecoHealth(s);
    for (let i = 0; i < 4; i++) endTurn(s);
    expect(ecoHealth(s)).toBeLessThan(before);
  });

  it('do-nothing loses', () => {
    const s = createGame(mission);
    while (s.outcome === 'playing') endTurn(s);
    expect(s.outcome).toBe('lost');
  });

  it('restore raises tile health and spends Energy', () => {
    const s = createGame(mission);
    const i = s.tiles.findIndex((t) => t.biome === 'forest' && t.health < 2);
    const h = s.tiles[i].health;
    const energy = s.energy;
    expect(perform(s, 'restore', i).ok).toBe(true);
    expect(s.tiles[i].health).toBe(h + 1);
    expect(s.energy).toBe(energy - 1);
  });
});
