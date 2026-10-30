import { isSource, grid, markedTiles, planThreats } from './threats';
import { ACTION_IDS, isBuilt, type ActionId, type GameState, type MissionDef } from './types';

export type TargetKind = 'tile' | 'threat';

export interface ActionDef {
  id: ActionId;
  label: string;
  icon: string;
  desc: string;
  target: TargetKind;
  /** Energy. A tile action on a risky ⚠ tile costs 1 more. */
  cost: number;
}

/** The five verbs, the same in every mission. Missions only rename them (see `labelOf`). */
export const ACTIONS: ActionDef[] = [
  { id: 'restore', label: 'Restore', icon: '🌱', desc: 'A tile moves up one step: Lost → Damaged → Healthy.', target: 'tile', cost: 1 },
  { id: 'defend', label: 'Defend', icon: '🛡️', desc: 'Nothing can harm this tile this turn. A hunter that tries goes back to its source.', target: 'tile', cost: 1 },
  { id: 'remove', label: 'Remove', icon: '🧹', desc: 'Clear a threat from one tile. It cannot be used on the place the threat comes from.', target: 'tile', cost: 2 },
  { id: 'protect', label: 'Protect', icon: '🔒', desc: 'This tile and the ring around it are safe for good from Spread, Flow and Hunt. A Strike still lands.', target: 'tile', cost: 3 },
  { id: 'campaign', label: 'Campaign', icon: '📣', desc: 'A threat gets 1 weaker for good. At 0 it has stopped.', target: 'threat', cost: 3 },
];

export const actionById = (id: string): ActionDef => {
  const a = ACTIONS.find((x) => x.id === id);
  if (!a) throw new Error(`unknown action ${id}`);
  return a;
};

/** The mission's own name for an action: "Replant" for Restore in a forest, "Lawsuit" for Campaign in a court case. */
export const labelOf = (m: Pick<MissionDef, 'labels'>, id: ActionId): string => m.labels?.[id] ?? actionById(id).label;

export function availableActions(s: GameState): ActionDef[] {
  const ids: readonly string[] = s.mission.actions ?? ACTION_IDS;
  return ACTIONS.filter((a) => ids.includes(a.id));
}

/** Energy an action costs on `target` (tile index, or threat index for Campaign). */
export function costOf(s: GameState, id: string, target = -1): number {
  const a = actionById(id);
  if ((s.free[id] ?? 0) > 0) return 0; // a free use from the Movement HQ
  return a.cost + (a.target === 'tile' && s.tiles[target]?.risky && !s.perks.legalaid ? 1 : 0);
}

export interface ActionResult {
  ok: boolean;
  message: string;
}
const fail = (message: string): ActionResult => ({ ok: false, message });

/** Why an action cannot be used on `target` right now, or null if it can. */
export function whyNot(s: GameState, id: string, target: number): string | null {
  const a = actionById(id);
  if (s.outcome !== 'playing') return 'The mission is over.';
  if (!availableActions(s).some((x) => x.id === id)) return 'Not available in this mission.';
  if (s.energy < costOf(s, id, target)) return `Needs ${costOf(s, id, target)}⚡ and you have ${s.energy}.`;
  if (a.target === 'threat') {
    const def = s.mission.threats[target];
    if (!def) return 'Pick a threat.';
    if ((s.strength[def.id] ?? def.strength) <= 0) return 'Already stopped.';
    return null;
  }
  const t = s.tiles[target];
  if (!t) return 'Pick a tile.';
  if (isBuilt(t.biome)) return 'Built-up land. Nothing to do here.';
  switch (id) {
    case 'restore':
      if (t.health >= 2) return 'Already Healthy.';
      break;
    case 'defend':
      if (t.defended) return 'Already defended this turn.';
      break;
    case 'remove':
      if (!t.threat) return 'No threat on this tile.';
      if (isSource(s, target)) return 'This is where it comes from. Campaign against it instead.';
      break;
    case 'protect':
      if (t.protected) return 'Already protected.';
      break;
  }
  return null;
}

export function perform(s: GameState, id: string, target = -1): ActionResult {
  const why = whyNot(s, id, target);
  if (why) return fail(why);
  const a = actionById(id);
  const label = labelOf(s.mission, a.id);
  s.energy -= costOf(s, id, target);
  if ((s.free[id] ?? 0) > 0) s.free[id]--;
  s.stats.actionsTaken++;

  switch (id) {
    case 'restore': s.tiles[target].health = (s.tiles[target].health + 1) as 1 | 2; break;
    case 'defend': s.tiles[target].defended = true; break;
    case 'remove': s.tiles[target].threat = null; s.tiles[target].age = 0; break;
    case 'protect': {
      const g = grid(s);
      for (const i of g.within(target, 1)) if (!isBuilt(s.tiles[i].biome)) s.tiles[i].protected = true;
      break;
    }
    case 'campaign': {
      const def = s.mission.threats[target];
      s.strength[def.id] = Math.max(0, (s.strength[def.id] ?? def.strength) - 1);
      if (s.strength[def.id] === 0) {
        for (const i of markedTiles(s, def.id)) (s.tiles[i].threat = null, (s.tiles[i].age = 0));
        s.log.push(`${def.label} has stopped.`);
      }
      break;
    }
  }
  planThreats(s); // an action can change what the threats will do: keep the arrows true
  return { ok: true, message: `${label} done.` };
}
