import { HexGrid } from './hex';
import { generateMap, sideDepth } from './mapgen';
import { shuffle } from './rand';
import { executePlan, isStopped, planThreats, seedThreat } from './threats';
import { isBuilt, type EventCard, type GameState, type MissionDef, type SpeciesState } from './types';

export const HEARTS = 3;

export function createGame(mission: MissionDef, perks: Record<string, number> = {}): GameState {
  const grid = new HexGrid(mission.size[0], mission.size[1]);
  const state: GameState = {
    mission,
    turn: 1,
    tiles: [],
    species: [],
    strength: {},
    surge: {},
    sources: {},
    energy: mission.energy,
    plan: {},
    startEco: 0,
    perks,
    free: { restore: perks.seedbank ?? 0, defend: perks.rapid ?? 0 },
    outcome: 'playing',
    loseReason: null,
    event: null,
    log: [],
    rngState: mission.seed >>> 0,
    stats: { actionsTaken: 0 },
  };
  state.tiles = generateMap(grid, mission.map, state);

  // Risky tiles for activists: natural tiles close to the pressure side.
  if (mission.risky) {
    const side = mission.map.side ?? 'n';
    const natural = state.tiles.map((_, i) => i).filter((i) => !isBuilt(state.tiles[i].biome));
    const near = natural.filter((i) => sideDepth(grid, side, i) <= 3);
    for (const i of shuffle(state, near.length ? near : natural).slice(0, mission.risky)) state.tiles[i].risky = true;
  }

  state.species = mission.species.map((def) => ({ def, hearts: HEARTS, extinct: false, homes: [], healthy: 0 }));
  for (const sp of state.species) sp.homes = pickHomes(state, grid, sp);
  countHealthy(state);

  for (const def of mission.threats) state.strength[def.id] = def.strength;
  mission.threats.forEach((def, idx) => seedThreat(state, def, idx));

  state.startEco = ecoHealth(state);
  startTurn(state);
  state.energy += perks.volunteers ?? 0; // Volunteers: extra Energy on the first turn only
  return state;
}

/** The 🐾 tiles hunters head for: Healthy habitat, spread out. */
function pickHomes(s: GameState, g: HexGrid, sp: SpeciesState): number[] {
  const habitat = s.tiles.map((_, i) => i).filter((i) => sp.def.habitat.includes(s.tiles[i].biome) && !isBuilt(s.tiles[i].biome));
  const good = shuffle(s, habitat.filter((i) => s.tiles[i].health === 2));
  const pool = good.length >= (sp.def.homes ?? 2) ? good : shuffle(s, habitat);
  const homes: number[] = [];
  for (const spread of [3, 2, 0]) {
    for (const i of pool) {
      if (homes.length >= (sp.def.homes ?? 2)) break;
      if (!homes.includes(i) && homes.every((h) => g.distance(h, i) >= spread)) homes.push(i);
    }
  }
  return homes;
}

/** Healthy habitat tiles per species. */
export function countHealthy(s: GameState): void {
  for (const sp of s.species) sp.healthy = s.tiles.filter((t) => t.health === 2 && sp.def.habitat.includes(t.biome)).length;
}

/** Healthy tiles count 1, Damaged ½, Lost 0, over the natural (not built-up) tiles. 0..1. */
export function ecoHealth(s: GameState): number {
  let sum = 0;
  let n = 0;
  for (const t of s.tiles) {
    if (isBuilt(t.biome)) continue;
    sum += t.health;
    n++;
  }
  return n ? sum / (2 * n) : 0;
}

function applyEvent(s: GameState, e: EventCard): void {
  if (e.effect.kind === 'energy') s.energy = Math.max(0, s.energy + e.effect.amount);
  else s.surge[e.effect.threat] = (s.surge[e.effect.threat] ?? 0) + e.effect.amount;
}

function startTurn(s: GameState): void {
  s.energy = s.mission.energy;
  s.surge = {};
  s.event = s.mission.events?.find((e) => e.turn === s.turn) ?? null;
  if (s.event) applyEvent(s, s.event);
  planThreats(s);
}

function checkOutcome(s: GameState): void {
  if (s.species.some((sp) => sp.extinct)) {
    s.outcome = 'lost';
    s.loseReason = 'extinction';
  } else if (ecoHealth(s) < s.mission.floor) {
    s.outcome = 'lost';
    s.loseReason = 'collapse';
  } else if (s.turn >= s.mission.turns) s.outcome = 'won';
}

/** Ends the player's turn: the threats carry out their plan, then the species react. */
export function endTurn(s: GameState): void {
  if (s.outcome !== 'playing') return;
  s.log = [];
  executePlan(s);
  countHealthy(s);
  for (const sp of s.species) {
    if (sp.extinct) continue;
    if (sp.healthy < sp.def.need) {
      sp.hearts--;
      s.log.push(`${sp.def.name}: only ${sp.healthy} of ${sp.def.need} healthy tiles left. It loses a heart.`);
    }
    if (sp.hearts <= 0) (sp.extinct = true, (sp.hearts = 0));
  }
  for (const t of s.tiles) t.defended = false;
  checkOutcome(s);
  if (s.outcome === 'playing') {
    s.turn++;
    startTurn(s);
  }
}

export const allStopped = (s: GameState): boolean => s.mission.threats.every((d) => isStopped(s, d));

export interface StarCheck {
  survive: boolean;
  eco: boolean;
  stopped: boolean;
}

/** The three star goals, as they stand now. */
export function starChecks(s: GameState): StarCheck {
  return { survive: s.outcome === 'won', eco: ecoHealth(s) >= s.startEco, stopped: allStopped(s) };
}

export function stars(s: GameState): number {
  if (s.outcome !== 'won') return 0;
  const c = starChecks(s);
  return 1 + (c.eco ? 1 : 0) + (c.stopped ? 1 : 0);
}
