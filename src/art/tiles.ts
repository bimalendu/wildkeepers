// Which pictures draw each biome in each health state. Kenney's Hexagon Pack (CC0) supplies the land, the buildings and
// the trees; it has no water, ice or marine life, so those are drawn in code (see generated.ts, keys start with "gen_").
// A tile's art is a list of layers, drawn bottom to top. Health: 0 Lost, 1 Damaged, 2 Healthy.
import type { Biome, Health } from '../sim/types';

export interface Layer {
  /** A file in public/tiles/<key>.png, or a "gen_" texture made at start-up. */
  key: string;
  /** Offset from the tile centre, in source pixels of a 120-wide tile. */
  dx?: number;
  dy?: number;
  scale?: number;
}

/** The size of Kenney's hex tiles in pixels: regular pointy-top hexes, so they sit on our grid exactly. */
export const TILE_W = 120;
export const TILE_H = 140;

const L = (key: string, dx = 0, dy = 0, scale = 1): Layer => ({ key, dx, dy, scale });
const water = (kind: 'river' | 'lake' | 'ocean', h: Health): Layer => L(`gen_${kind}_${h}`);
const TREE = 'treeRound_small';

type ByHealth = [Layer[], Layer[], Layer[]];
const same = (layers: Layer[]): ByHealth => [layers, layers, layers];

export const TILE_ART: Record<Biome, ByHealth> = {
  forest: [[L('dirt_06')], [L('dirt_11')], [L('grass_12')]],
  grass: [[L('dirt_06')], [L('dirt_02')], [L('grass_05')]],
  wetland: [[L('dirt_06')], [L('dirt_02'), L('gen_puddles_1')], [L('grass_05'), L('gen_puddles_2')]],
  river: [[water('river', 0)], [water('river', 1)], [water('river', 2)]],
  lake: [[water('lake', 0)], [water('lake', 1)], [water('lake', 2)]],
  ocean: [[water('ocean', 0)], [water('ocean', 1)], [water('ocean', 2)]],
  reef: [[water('ocean', 0), L('gen_coral_0')], [water('ocean', 1), L('gen_coral_1')], [water('ocean', 2), L('gen_coral_2')]],
  seagrass: [[water('ocean', 0)], [water('ocean', 1), L('gen_seagrass_1')], [water('ocean', 2), L('gen_seagrass_2')]],
  kelp: [[water('ocean', 0)], [water('ocean', 1), L('gen_kelp_1')], [water('ocean', 2), L('gen_kelp_2')]],
  mangrove: [[water('lake', 0)], [water('lake', 1), L(TREE, 0, -6)], [water('lake', 2), L(TREE, -20, -4), L(TREE, 18, 6), L(TREE, -2, 20)]],
  ice: [[water('ocean', 0)], [L('gen_ice_1')], [L('gen_ice_2')]],
  tundra: [[L('dirt_06')], [L('stone_07')], [L('stone_13')]],
  desert: [[L('stone_07')], [L('sand_13')], [L('sand_14')]],
  farm: same([L('medieval_farm')]),
  town: same([L('modern_villageLarge')]),
  mine: same([L('medieval_mine')]),
  road: same([L('modern_petrol')]),
};

/** Every layer key that has to be loaded from public/tiles. */
export const TILE_FILES: string[] = [...new Set(Object.values(TILE_ART).flatMap((by) => by.flat()).map((l) => l.key).filter((k) => !k.startsWith('gen_')))];

export const GENERATED_KEYS: string[] = [...new Set(Object.values(TILE_ART).flatMap((by) => by.flat()).map((l) => l.key).filter((k) => k.startsWith('gen_')))];
