import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATED_KEYS, TILE_ART, TILE_FILES } from '../src/art/tiles';
import type { Biome } from '../src/sim/types';

const BIOMES: Biome[] = ['forest', 'grass', 'wetland', 'river', 'lake', 'reef', 'ocean', 'mangrove', 'seagrass', 'kelp', 'ice', 'farm', 'town', 'mine', 'road', 'tundra', 'desert'];

describe('tile art', () => {
  it('has art for every biome in every health state', () => {
    expect(Object.keys(TILE_ART).sort()).toEqual([...BIOMES].sort());
    for (const b of BIOMES) for (const h of [0, 1, 2] as const) expect(TILE_ART[b][h].length, `${b} health ${h}`).toBeGreaterThan(0);
  });

  it('every picture file exists in public/tiles', () => {
    for (const key of TILE_FILES) expect(existsSync(`public/tiles/${key}.png`), key).toBe(true);
  });

  it('every generated texture is one the code draws', () => {
    expect(GENERATED_KEYS.length).toBeGreaterThan(0);
    for (const key of GENERATED_KEYS) expect(key).toMatch(/^gen_(river|lake|ocean|ice|coral|seagrass|kelp|puddles)_[0-2]$/);
  });

  it('shows the three health states differently for every natural biome', () => {
    for (const b of BIOMES.filter((x) => !['farm', 'town', 'mine', 'road'].includes(x))) {
      const looks = [0, 1, 2].map((h) => TILE_ART[b][h as 0 | 1 | 2].map((l) => l.key).join('+'));
      expect(new Set(looks).size, `${b}: ${looks.join(' | ')}`).toBe(3);
    }
  });

  it('keeps Kenney credited', () => {
    expect(existsSync('public/tiles/LICENSE-kenney-hexagon.txt')).toBe(true);
  });
});
