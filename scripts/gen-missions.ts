// Turns the region specs in scripts/specs/ into mission files (src/levels/missions/<region>/) and the region's issue
// tree (src/data/regions/<region>.json). Deterministic: re-running rewrites the same files.
//   npx tsx scripts/gen-missions.ts [region-id]
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { build } from './archetypes';
import type { RegionSpec } from './specs/types';
import { compareByPriority, crisisClock, priorityScore } from '../src/sim/priority';
import { playBot } from '../src/sim/bot';
import { countHealthy, createGame, ecoHealth, stars } from '../src/sim/engine';
import type { MissionDef } from '../src/sim/types';
import type { IssueDef, RegionDef } from '../src/data/regions';

const only = process.argv[2];

const SEEDS = [0, 1, 2, 3, 4];

/** Species need this fraction of the Healthy habitat tiles the map starts with. */
const NEED_FRACTION = 0.7;

interface Levers {
  energy: number;
  /** Added to the strength of Spread, Flow and Strike threats, and to the number of hunters. */
  dStrength: number;
  dTurns: number;
}

/** Applies the levers, then sets what depends on the map: species needs and the floor. */
function prepare(base: MissionDef, lv: Levers): MissionDef | null {
  const m = structuredClone(base);
  m.energy = lv.energy;
  m.turns = Math.max(8, base.turns + lv.dTurns);
  for (const th of m.threats) {
    if (th.behaviour === 'hunt') th.sources = Math.max(1, (th.sources ?? 2) + lv.dStrength);
    else th.strength = Math.max(1, th.strength + lv.dStrength);
  }
  m.floor = 0;
  const s0 = createGame(m);
  countHealthy(s0);
  s0.species.forEach((sp, i) => (m.species[i].need = Math.max(3, Math.round(sp.healthy * NEED_FRACTION))));
  // The floor sits part of the way from the starting health to where doing nothing ends up, so idling loses before the end.
  const start = ecoHealth(createGame(m));
  const idleRun = playBot(m, true);
  const idle = ecoHealth(idleRun.state);
  // Hunters decide these missions by extinction, so the bar only needs to leave room; otherwise the threat must visibly hurt.
  const dies = idleRun.loseReason === 'extinction';
  if (!dies && start - idle < 0.1) return null; // the threat is too weak to matter
  const margin = dies ? 0.12 : Math.min(0.2, Math.max(0.06, (start - idle) * 0.55));
  m.floor = Math.round((start - margin) * 100) / 100;
  return m;
}

/** A hope mission starts healthy and short; idling is not required to lose. The bot must win every seed. */
function prepareHope(base: MissionDef): MissionDef {
  const m = structuredClone(base);
  m.floor = 0;
  const s0 = createGame(m);
  countHealthy(s0);
  s0.species.forEach((sp, i) => (m.species[i].need = Math.max(3, Math.round(sp.healthy * NEED_FRACTION))));
  m.floor = Math.round((ecoHealth(createGame(m)) - 0.15) * 100) / 100;
  return m;
}

function good(m: MissionDef): boolean {
  if (m.hope) return SEEDS.every((k) => playBot({ ...structuredClone(m), seed: m.seed + 13 * k }).outcome === 'won');
  if (playBot(m, true).outcome !== 'lost') return false;
  let won = 0;
  let firstStars = 0;
  for (const k of SEEDS) {
    const mm = structuredClone(m);
    mm.seed += 13 * k;
    const r = playBot(mm);
    if (r.outcome === 'won') (won++, k === 0 && (firstStars = stars(r.state)));
  }
  return won >= 4 && firstStars >= 2;
}

/** The hardest settings at which the greedy bot still wins at least 4 of 5 seeds, with ★★ on the fixed seed. */
function tune(base: MissionDef): { mission: MissionDef; ok: boolean; levers?: Levers } {
  if (base.hope) {
    const m = prepareHope(base);
    return { mission: m, ok: good(m), levers: { energy: m.energy, dStrength: 0, dTurns: 0 } };
  }
  const grid: Levers[] = [];
  for (const energy of [3, 4, 5]) for (const dStrength of [1, 0, -1]) for (const dTurns of [2, 0, -2]) grid.push({ energy, dStrength, dTurns });
  const ease = (l: Levers) => l.energy * 1.5 - l.dStrength * 1.2 - l.dTurns * 0.15;
  grid.sort((a, b) => ease(a) - ease(b));
  for (const lv of grid) {
    const m = prepare(base, lv);
    if (m && good(m)) return { mission: m, ok: true, levers: lv };
  }
  return { mission: prepare(base, { energy: 5, dStrength: -1, dTurns: -2 }) ?? base, ok: false };
}

for (const file of readdirSync('scripts/specs').filter((f) => f.endsWith('.ts') && f !== 'types.ts')) {
  const spec: RegionSpec = (await import(`./specs/${file}`)).default;
  if (only && spec.id !== only) continue;
  const order = spec.tier1.map((t) => ({ id: t.mission.id, priority: t.priority, driver: t.driver })).sort(compareByPriority);
  const issues: IssueDef[] = [];
  mkdirSync(`src/levels/missions/${spec.id}`, { recursive: true });
  mkdirSync('src/data/regions', { recursive: true });

  spec.tier1.forEach((t, n) => {
    const rank = order.findIndex((o) => o.id === t.mission.id);
    const issueId = `${t.mission.id}-issue`;
    const mission = build(t.mission, rank, spec.id, issueId, 1000 * (spec.code.charCodeAt(0) + spec.code.charCodeAt(1)) + 17 * (n + 1));
    // Crisis Clock: threats in higher-priority issues start stronger (a generator input only; players never see it).
    const clock = crisisClock(priorityScore(t.priority));
    for (const th of mission.threats) if (th.behaviour === 'spread' || th.behaviour === 'flow') th.strength = Math.max(1, Math.round(th.strength * clock));
    for (const th of mission.threats) th.catalogue = t.drivers.flatMap((d) => d.catalogue ?? []).filter((x, i, a) => a.indexOf(x) === i);
    const tuned = tune(mission);
    if (!tuned.ok) console.warn(`  ! ${mission.id}: no setting meets the targets`);
    else console.log(`  ${mission.id}: energy ${tuned.levers!.energy}, strength ${tuned.levers!.dStrength >= 0 ? '+' : ''}${tuned.levers!.dStrength}, turns ${tuned.mission.turns}, floor ${tuned.mission.floor}`);
    writeFileSync(`src/levels/missions/${spec.id}/${t.mission.id}.json`, JSON.stringify(tuned.mission, null, 2) + '\n');
    issues.push({
      id: issueId, title: t.mission.title, theme: t.mission.theme, tier: 1, driver: t.driver, priority: t.priority,
      catalogue: t.mission.catalogue, drivers: t.drivers, sites: t.sites, fact: t.fact, realWorld: t.mission.realWorld, mission: t.mission.id,
    });
  });
  for (const t of spec.tier2) {
    issues.push({ id: t.id, title: t.title, theme: t.theme, tier: 2, driver: t.driver, priority: t.priority, catalogue: t.catalogue, drivers: t.drivers, sites: t.sites });
  }
  const region: RegionDef = { id: spec.id, name: spec.name, blurb: spec.blurb, issues };
  writeFileSync(`src/data/regions/${spec.id}.json`, JSON.stringify(region, null, 2) + '\n');
  console.log(`${spec.id}: ${spec.tier1.length} missions, ${spec.tier2.length} Tier 2 nodes`);
}
