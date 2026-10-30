import { HexGrid } from './hex';
import { nextFloat } from './rand';
import { isBuilt, type Biome, type Health, type MapTemplate, type Tile } from './types';

const newTile = (biome: Biome, health: Health): Tile => ({
  biome,
  health,
  protected: false,
  defended: false,
  risky: false,
  threat: null,
  age: 0,
});

/** Distance (in tiles) from the pressure side of the map. */
export function sideDepth(grid: HexGrid, side: 'n' | 's' | 'e' | 'w', i: number): number {
  const { c, r } = grid.hex(i);
  switch (side) {
    case 'n': return r;
    case 's': return grid.h - 1 - r;
    case 'w': return c;
    case 'e': return grid.w - 1 - c;
  }
}

/**
 * Builds the tile map from a template. Deterministic given the rng state:
 * a base biome, patches of an accent biome, a river (optional), and a band of built "pressure" tiles along one side
 * with damage that fades inward (Lost next to the band, then Damaged, then Healthy).
 */
export function generateMap(grid: HexGrid, t: MapTemplate, rng: { rngState: number }): Tile[] {
  const side = t.side ?? 'n';
  const depth = t.depth ?? Math.max(3, Math.floor((side === 'n' || side === 's' ? grid.h : grid.w) / 2));
  const tiles: Tile[] = [];
  for (let i = 0; i < grid.size; i++) tiles.push(newTile(t.base, 2));

  // Accent patches: grow a few blobs outward from random seeds.
  if (t.accent && (t.accentAmount ?? 0) > 0) {
    const want = Math.round(grid.size * (t.accentAmount ?? 0));
    let placed = 0;
    let guard = 0;
    while (placed < want && guard++ < 400) {
      const seedTile = Math.floor(nextFloat(rng) * grid.size);
      if (tiles[seedTile].biome === t.accent) continue;
      const blob = 2 + Math.floor(nextFloat(rng) * 4);
      const frontier = [seedTile];
      for (let k = 0; k < blob && frontier.length; k++) {
        const cur = frontier.splice(Math.floor(nextFloat(rng) * frontier.length), 1)[0];
        if (tiles[cur].biome !== t.accent) {
          tiles[cur].biome = t.accent;
          placed++;
        }
        for (const n of grid.neighbors(cur)) frontier.push(n);
      }
    }
  }

  // River: a meandering line from the far side toward the pressure side.
  if (t.river) {
    let c = 1 + Math.floor(nextFloat(rng) * (grid.w - 2));
    for (let r = 0; r < grid.h; r++) {
      tiles[grid.index(c, r)].biome = 'river';
      c = Math.min(grid.w - 1, Math.max(0, c + (nextFloat(rng) < 0.5 ? -1 : 1) * (nextFloat(rng) < 0.5 ? 1 : 0)));
      tiles[grid.index(c, r)].biome = 'river';
    }
  }

  // Pressure band: built tiles along the chosen edge, with damage fading inward.
  const pressure = t.pressure ?? [];
  for (let i = 0; i < grid.size; i++) {
    const d = sideDepth(grid, side, i);
    if (pressure.length && d === 0) tiles[i].biome = pressure[Math.floor(nextFloat(rng) * pressure.length)];
    else if (pressure.length && d === 1 && nextFloat(rng) < 0.5) tiles[i].biome = pressure[Math.floor(nextFloat(rng) * pressure.length)];
    if (isBuilt(tiles[i].biome)) {
      tiles[i].health = 0;
      continue;
    }
    const damage = pressure.length ? Math.max(0, 1 - d / depth) + (nextFloat(rng) - 0.5) * 0.5 : (nextFloat(rng) - 0.5) * 0.4;
    tiles[i].health = damage > 0.62 ? 0 : damage > 0.3 ? 1 : 2;
  }
  return tiles;
}
