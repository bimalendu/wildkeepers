import { ACTIONS, costOf, perform, whyNot, type ActionDef } from './actions';
import { createGame, endTurn } from './engine';
import { grid, isStopped, strengthOf } from './threats';
import { isBuilt, type GameState, type MissionDef, type ThreatDef } from './types';

/**
 * A greedy player. Each turn it scores every legal (action, tile or threat) pair by value per Energy, using the same
 * arrows the player sees, and takes the best until the Energy runs out. It is the balance yardstick: a mission must
 * be winnable by this bot, and a do-nothing run must lose.
 */
export interface Candidate {
  action: ActionDef;
  target: number;
  score: number;
}

interface Incoming {
  def: ThreatDef;
  /** The hunter reaches a 🐾 home with this step. */
  atHome: boolean;
}

/** For each tile, the planned hits that would actually land this turn. */
function incoming(s: GameState): Map<number, Incoming[]> {
  const out = new Map<number, Incoming[]>();
  for (const def of s.mission.threats) {
    for (const item of s.plan[def.id] ?? []) {
      if (item.eta > 0) continue;
      item.path.forEach((i, k) => {
        const t = s.tiles[i];
        if (t.defended || (def.behaviour !== 'strike' && t.protected)) return;
        const atHome = def.behaviour === 'hunt' && k === item.path.length - 1 && s.species.some((sp) => sp.homes.includes(i));
        out.set(i, [...(out.get(i) ?? []), { def, atHome }]);
      });
    }
  }
  return out;
}

const turnsLeft = (s: GameState): number => s.mission.turns - s.turn + 1;

function scoreTile(s: GameState, hits: Map<number, Incoming[]>, id: string, i: number): number {
  const g = grid(s);
  const t = s.tiles[i];
  const mine = hits.get(i) ?? [];
  switch (id) {
    case 'defend': {
      let v = 0;
      for (const h of mine) {
        if (h.def.behaviour === 'hunt') v += h.atHome ? 4 : 1.4;
        else v += (t.health > 0 ? 1 : 0.1) + (h.def.behaviour === 'strike' ? 0 : 0.5);
      }
      return v;
    }
    case 'restore': {
      if (mine.some((h) => h.def.behaviour !== 'hunt') && t.health > 0) return 0.1; // it would just be knocked back
      const habitat = s.species.filter((sp) => !sp.extinct && sp.def.habitat.includes(t.biome));
      let v = 1;
      for (const sp of habitat) if (t.health === 1 && sp.healthy - sp.def.need <= 1) v += 3;
      for (const sp of habitat) if (t.health === 1 && sp.healthy - sp.def.need <= 3) v += 0.6;
      return t.health === 0 ? v * 0.8 : v;
    }
    case 'remove': {
      const def = s.mission.threats.find((d) => d.id === t.threat);
      if (!def) return 0;
      if (def.behaviour === 'hunt') return 5;
      const grows = (s.plan[def.id] ?? []).filter((it) => it.from === i).length;
      return 0.8 + grows * 1.2;
    }
    case 'protect': {
      // worth it where a lasting threat keeps pressing: next to its body, or on its way. Fire moves on, so it does not count.
      const lasting = (id: string | null): boolean => !!id && s.mission.threats.find((d) => d.id === id)?.lifetime === undefined;
      const frontier = s.mission.threats.some((d) => d.kind === 'frontier');
      let v = 0;
      for (const r of g.within(i, 1)) {
        const tr = s.tiles[r];
        if (isBuilt(tr.biome) || tr.protected) continue;
        v += 0.15;
        if (hits.get(r)?.some((h) => h.def.behaviour !== 'strike')) v += 1;
        if (g.neighbors(r).some((n) => lasting(s.tiles[n].threat) || (frontier && isBuilt(s.tiles[n].biome)))) v += 0.55;
        if (s.species.some((sp) => sp.homes.includes(r))) v += 1.5;
      }
      return v;
    }
    default: return 0;
  }
}

function scoreThreat(s: GameState, def: ThreatDef): number {
  const per = def.behaviour === 'hunt' ? 1.6 : 1.3;
  const rate = 1 / (def.every ?? 1);
  const left = Math.max(0, turnsLeft(s) - 1);
  const str = strengthOf(s, def);
  const bonus = str === 1 ? 2.5 : 0; // stopping it for good also clears its body
  return per * rate * Math.min(left, 8) * 0.6 + bonus;
}

export function candidates(s: GameState): Candidate[] {
  const hits = incoming(s);
  const out: Candidate[] = [];
  for (const action of ACTIONS) {
    if (action.target === 'tile') {
      for (let i = 0; i < s.tiles.length; i++) {
        if (whyNot(s, action.id, i)) continue;
        const score = scoreTile(s, hits, action.id, i) / costOf(s, action.id, i);
        if (score > 0) out.push({ action, target: i, score });
      }
    } else {
      s.mission.threats.forEach((def, i) => {
        if (whyNot(s, action.id, i) || isStopped(s, def)) return;
        const score = scoreThreat(s, def) / action.cost;
        if (score > 0) out.push({ action, target: i, score });
      });
    }
  }
  return out;
}

/** Plays one turn: spends the Energy on the best-scoring actions, then ends the turn. */
export function botTurn(s: GameState): void {
  let guard = 0;
  while (s.energy > 0 && s.outcome === 'playing' && guard++ < 20) {
    const cs = candidates(s).sort((a, b) => b.score - a.score || a.target - b.target);
    if (!cs.length) break;
    perform(s, cs[0].action.id, cs[0].target);
  }
  endTurn(s);
}

export interface BotResult {
  outcome: GameState['outcome'];
  loseReason: GameState['loseReason'];
  turns: number;
}

export function playBot(mission: MissionDef, doNothing = false): BotResult & { state: GameState } {
  const s = createGame(mission);
  while (s.outcome === 'playing') {
    if (doNothing) endTurn(s);
    else botTurn(s);
  }
  return { outcome: s.outcome, loseReason: s.loseReason, turns: s.turn, state: s };
}
