import { HexGrid } from './hex';
import { localRng, nextFloat, pick, shuffle } from './rand';
import { sideDepth } from './mapgen';
import { isBuilt, type Biome, type GameState, type PlanItem, type SpeciesState, type ThreatDef } from './types';

const LAND: Biome[] = ['forest', 'grass', 'wetland', 'tundra', 'mangrove', 'desert'];
const FLAMMABLE: Biome[] = ['forest', 'grass', 'wetland', 'tundra'];
const WET: Biome[] = ['river', 'lake', 'wetland', 'mangrove', 'ocean', 'seagrass', 'reef', 'kelp'];
const ANY_NATURAL: Biome[] = [...LAND, 'river', 'lake', 'ocean', 'reef', 'seagrass', 'kelp', 'ice'];
const SENSITIVE: Biome[] = ['reef', 'ice', 'kelp', 'seagrass'];

export const grid = (s: GameState): HexGrid => new HexGrid(s.mission.size[0], s.mission.size[1]);

export function defaultTargets(def: ThreatDef): Biome[] {
  if (def.targets) return def.targets;
  switch (def.kind) {
    case 'frontier': return LAND;
    case 'fire': return FLAMMABLE;
    case 'plume': return WET;
    case 'heat': return SENSITIVE;
    default: return ANY_NATURAL;
  }
}

/** Current strength: Campaign lowers it for good, an event card can add to it for one turn. */
export function strengthOf(s: GameState, def: ThreatDef): number {
  const base = s.strength[def.id] ?? def.strength;
  return base > 0 ? base + (s.surge[def.id] ?? 0) : 0;
}

export const isStopped = (s: GameState, def: ThreatDef): boolean => (s.strength[def.id] ?? def.strength) <= 0;

/** Whether the threat acts on `turn`. */
export const acts = (s: GameState, def: ThreatDef, turn = s.turn): boolean => {
  const start = def.start ?? 1;
  const every = def.every ?? 1;
  return turn >= start && (turn - start) % every === 0;
};

/** The first turn at or after the current one on which the threat acts. */
export function nextActingTurn(s: GameState, def: ThreatDef): number {
  let t = s.turn;
  for (let k = 0; k < 64; k++, t++) if (acts(s, def, t)) return t;
  return t;
}

export const markedTiles = (s: GameState, id: string): number[] => {
  const out: number[] = [];
  s.tiles.forEach((t, i) => t.threat === id && out.push(i));
  return out;
};

export const isSource = (s: GameState, i: number): boolean => Object.values(s.sources).some((arr) => arr.includes(i));

/** Spread and Flow can land here: natural, a biome the threat likes, not protected, not already part of a threat. */
function open(s: GameState, def: ThreatDef, i: number): boolean {
  const t = s.tiles[i];
  return !isBuilt(t.biome) && defaultTargets(def).includes(t.biome) && !t.protected && t.threat === null;
}

export function speciesFor(s: GameState, def: ThreatDef): SpeciesState[] {
  return s.species.filter((sp) => !sp.extinct && (!def.hurts || def.hurts.includes(sp.def.id)));
}

/** Tiles where a threat starts out: depends on `from`. */
export function initSources(s: GameState, def: ThreatDef): number[] {
  const g = grid(s);
  const side = s.mission.map.side ?? 'n';
  const all = Array.from({ length: g.size }, (_, i) => i);
  const want = Math.max(1, def.sources ?? (def.from === 'river' ? 1 : 2));
  switch (def.from ?? 'pressure') {
    case 'pressure': {
      const built = all.filter((i) => isBuilt(s.tiles[i].biome) && sideDepth(g, side, i) <= 2);
      const pool = built.length ? built : all.filter((i) => sideDepth(g, side, i) === 0);
      return shuffle(s, pool).slice(0, want);
    }
    case 'river': {
      const rivers = all.filter((i) => s.tiles[i].biome === 'river' || s.tiles[i].biome === 'lake');
      rivers.sort((a, b) => sideDepth(g, side, a) - sideDepth(g, side, b));
      return rivers.slice(0, want);
    }
    case 'edge': {
      const edge = all.filter((i) => !isBuilt(s.tiles[i].biome) && sideDepth(g, side, i) === 0);
      return shuffle(s, edge.length ? edge : all).slice(0, want);
    }
    case 'species': {
      const homes = speciesFor(s, def).flatMap((sp) => sp.homes);
      const habitat = speciesFor(s, def).flatMap((sp) => sp.def.habitat);
      const far = all.filter((i) => habitat.includes(s.tiles[i].biome) && homes.every((h) => g.distance(h, i) >= 3));
      return shuffle(s, far.length ? far : all.filter((i) => !isBuilt(s.tiles[i].biome))).slice(0, want);
    }
    default:
      return shuffle(s, all.filter((i) => !isBuilt(s.tiles[i].biome))).slice(0, want);
  }
}

/** Everything a Spread threat can grow from. */
function spreadBases(s: GameState, def: ThreatDef): number[] {
  const base = new Set<number>(markedTiles(s, def.id));
  for (const src of s.sources[def.id] ?? []) base.add(src);
  if (def.kind === 'frontier' || def.kind === 'network') s.tiles.forEach((t, i) => isBuilt(t.biome) && base.add(i)); // roads and ports carry it
  return [...base].sort((a, b) => a - b);
}

function planSpread(s: GameState, def: ThreatDef, rng: { rngState: number }): PlanItem[] {
  const g = grid(s);
  const n = strengthOf(s, def);
  const bases = spreadBases(s, def);
  if (bases.length === 0) {
    // nothing to grow from yet: it starts somewhere new (a fire ignites)
    const pool = s.tiles.map((_, i) => i).filter((i) => open(s, def, i));
    return shuffle(rng, pool).slice(0, Math.max(1, Math.ceil(n / 2))).map((i) => ({ from: -1, path: [i], eta: 0 }));
  }
  const side = s.mission.map.side ?? 'n';
  const from = new Map<number, number>();
  for (const b of bases) for (const nb of g.neighbors(b)) if (open(s, def, nb) && !from.has(nb)) from.set(nb, b);
  const dir = def.dir ?? 0;
  const key = (i: number): number => {
    let k = nextFloat(rng) * 2.2;
    if (s.tiles[i].health === 0) k += 2.5; // growing onto land that is already lost does nothing; it prefers living land
    if (def.kind === 'frontier') k += sideDepth(g, side, i) * 0.45; // frontiers creep from the pressure side first
    if (def.kind === 'fire' && g.step(from.get(i)!, dir) === i) k -= 1.4; // fire runs with the wind
    return k;
  };
  const ranked = [...from.keys()].sort((a, b) => a - b).map((i) => ({ i, k: key(i) })).sort((a, b) => a.k - b.k);
  return ranked.slice(0, n).map(({ i }) => ({ from: from.get(i)!, path: [i], eta: 0 }));
}

function planFlow(s: GameState, def: ThreatDef, rng: { rngState: number }): PlanItem[] {
  const g = grid(s);
  const n = strengthOf(s, def);
  const dir = def.dir ?? 5;
  const marks = markedTiles(s, def.id);
  // the head of a plume is its newest tile that can still flow somewhere
  const canFlow = (i: number): boolean => g.neighbors(i).some((x) => open(s, def, x));
  let cur = marks.filter(canFlow).sort((a, b) => s.tiles[a].age - s.tiles[b].age || b - a)[0] ?? -1;
  if (cur < 0 && marks.length) return [];
  let start = cur;
  const path: number[] = [];
  const taken = new Set<number>();
  for (let k = 0; k < n; k++) {
    let next = -1;
    if (cur < 0) {
      // a new release starts at a source; a source on built-up land (a farm, a factory) releases into the nearest open tile
      for (const src of shuffle(rng, s.sources[def.id] ?? [])) {
        if (open(s, def, src)) {
          next = src;
          break;
        }
        const down = g.step(src, dir);
        const near = g.neighbors(src).filter((x) => open(s, def, x));
        // nothing open next door: it seeps to the nearest tile it can reach within three steps
        const reach = g.within(src, 3).filter((x) => open(s, def, x)).sort((a, b) => g.distance(src, a) - g.distance(src, b) || a - b);
        const around = down >= 0 && open(s, def, down) ? down : pick(rng, near) ?? reach[0] ?? -1;
        if (around >= 0) {
          next = around;
          start = src;
          break;
        }
      }
    }
    if (cur >= 0) {
      const down = g.step(cur, dir);
      if (down >= 0 && open(s, def, down) && !taken.has(down)) next = down;
      else next = pick(rng, g.neighbors(cur).filter((x) => open(s, def, x) && !taken.has(x))) ?? -1;
    }
    if (next < 0) break;
    path.push(next);
    taken.add(next);
    cur = next;
  }
  return path.length ? [{ from: start, path, eta: 0 }] : [];
}

function planHunt(s: GameState, def: ThreatDef): PlanItem[] {
  const g = grid(s);
  const n = strengthOf(s, def);
  const homes = speciesFor(s, def).flatMap((sp) => sp.homes);
  if (!homes.length) return [];
  const hunters = markedTiles(s, def.id);
  const reserved = new Set<number>(hunters);
  const items: PlanItem[] = [];
  for (const h of hunters) {
    reserved.delete(h);
    const path: number[] = [];
    let cur = h;
    for (let k = 0; k < n; k++) {
      const nearest = homes.reduce((a, c) => (g.distance(cur, c) < g.distance(cur, a) ? c : a));
      const next = g.stepToward(cur, nearest);
      if (next === cur || reserved.has(next)) break;
      path.push(next);
      cur = next;
      if (homes.includes(cur)) break;
    }
    for (const p of path) reserved.add(p);
    if (!path.length) reserved.add(h);
    else items.push({ from: h, path, eta: 0 });
  }
  return items;
}

function planStrike(s: GameState, def: ThreatDef, idx: number): PlanItem[] {
  const g = grid(s);
  const t = nextActingTurn(s, def);
  const rng = localRng(s.mission.seed, t, idx);
  const n = strengthOf(s, def);
  const targets = defaultTargets(def);
  const pool = s.tiles.map((tile, i) => ({ tile, i })).filter(({ tile }) => !isBuilt(tile.biome) && targets.includes(tile.biome)).map(({ i }) => i);
  let chosen: number[];
  if (def.kind === 'field' && (s.sources[def.id] ?? []).length) {
    // a glow or a noise field hits the tiles nearest its sources
    const lists = (s.sources[def.id] ?? []).map((src) => shuffle(rng, pool).sort((a, b) => g.distance(src, a) - g.distance(src, b)));
    chosen = [];
    for (let k = 0; chosen.length < n && k < pool.length; k++) for (const l of lists) if (chosen.length < n && !chosen.includes(l[k])) chosen.push(l[k]);
  } else chosen = shuffle(rng, pool).slice(0, n);
  return chosen.map((i) => ({ from: -1, path: [i], eta: t - s.turn }));
}

/** What one threat will do at the end of this turn. Recomputing it with the same board always gives the same answer. */
export function planThreat(s: GameState, def: ThreatDef, idx: number, salt = 0): PlanItem[] {
  if (isStopped(s, def)) return [];
  const rng = localRng(s.mission.seed, s.turn + salt, idx);
  switch (def.behaviour) {
    case 'strike': return planStrike(s, def, idx);
    default:
      if (!acts(s, def)) return [];
      if (def.behaviour === 'spread') return planSpread(s, def, rng);
      if (def.behaviour === 'flow') return planFlow(s, def, rng);
      return planHunt(s, def);
  }
}

/** Works out the arrows for every threat. Called at the start of a turn and after any action that could change them. */
export function planThreats(s: GameState): void {
  s.plan = {};
  s.mission.threats.forEach((def, idx) => (s.plan[def.id] = planThreat(s, def, idx)));
}

const damage = (s: GameState, i: number): void => {
  const t = s.tiles[i];
  t.health = Math.max(0, t.health - 1) as 0 | 1 | 2;
};

/** The nearest free source to `from`: where a turned-back hunter goes home to. */
function sendHome(s: GameState, def: ThreatDef, from: number): number {
  const g = grid(s);
  const free = (s.sources[def.id] ?? []).filter((i) => i === from || s.tiles[i].threat === null);
  if (!free.length) return from;
  return free.reduce((a, c) => (g.distance(from, c) < g.distance(from, a) ? c : a));
}

function moveHunter(s: GameState, def: ThreatDef, from: number, to: number): void {
  const age = s.tiles[from].age;
  s.tiles[from].threat = null;
  s.tiles[from].age = 0;
  s.tiles[to].threat = def.id;
  s.tiles[to].age = age + 1;
}

/** Carries out one threat's plan. Defended tiles are always skipped; Protected tiles are skipped except by Strike. */
export function executeThreat(s: GameState, def: ThreatDef, items: PlanItem[]): void {
  const blocked = (i: number): boolean => s.tiles[i].defended || (def.behaviour !== 'strike' && s.tiles[i].protected);
  for (const item of items) {
    if (item.eta > 0) continue;
    if (def.behaviour === 'hunt') {
      let at = item.from;
      for (const i of item.path) {
        if (blocked(i)) {
          moveHunter(s, def, at, sendHome(s, def, at));
          s.log.push(`${def.label} was turned back.`);
          at = -1;
          break;
        }
        const sp = s.species.find((x) => !x.extinct && x.homes.includes(i) && (!def.hurts || def.hurts.includes(x.def.id)));
        if (sp) {
          sp.hearts--;
          s.log.push(`${def.label} reached the ${sp.def.name}'s home: it loses a heart.`);
          moveHunter(s, def, at, sendHome(s, def, at));
          at = -1;
          break;
        }
        moveHunter(s, def, at, i);
        at = i;
      }
      continue;
    }
    for (const i of item.path) {
      if (blocked(i)) continue;
      damage(s, i);
      if (def.behaviour !== 'strike' && s.tiles[i].threat === null) {
        s.tiles[i].threat = def.id;
        s.tiles[i].age = 0;
      }
    }
  }
}

/** Runs the whole threat phase from the stored plan, then ages markers (fire burns out). */
export function executePlan(s: GameState): void {
  s.mission.threats.forEach((def) => {
    executeThreat(s, def, s.plan[def.id] ?? []);
    if (def.behaviour === 'hunt') return;
    for (const t of s.tiles) {
      if (t.threat !== def.id) continue;
      t.age++;
      if (def.behaviour === 'spread' && def.lifetime !== undefined && t.age >= def.lifetime) (t.threat = null, (t.age = 0));
    }
  });
}

/** Opening state of a threat: its sources, and a head start so the player begins mid-crisis. */
export function seedThreat(s: GameState, def: ThreatDef, idx: number): void {
  s.sources[def.id] = initSources(s, def);
  if (def.behaviour === 'hunt') {
    for (const src of s.sources[def.id]) s.tiles[src].threat = def.id;
    return;
  }
  if (def.behaviour === 'strike') return;
  const saved = s.turn;
  s.turn = Math.max(def.start ?? 1, 1);
  for (let k = 0; k < 2; k++) {
    executeThreat(s, def, planThreat(s, def, idx, -1 - k));
    for (const t of s.tiles) if (t.threat === def.id) t.age++;
  }
  s.turn = saved;
  s.log = [];
}
