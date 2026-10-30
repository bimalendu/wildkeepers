import { describe, expect, it } from 'vitest';
import { ACTIONS, costOf, perform, whyNot } from '../src/sim/actions';
import { createGame, ecoHealth, endTurn, stars, starChecks } from '../src/sim/engine';
import { HexGrid } from '../src/sim/hex';
import { RULEBOOK, ruleText } from '../src/sim/rules';
import { executePlan, planThreats } from '../src/sim/threats';
import type { Biome, GameState, MissionDef, SpeciesDef, ThreatDef } from '../src/sim/types';

const SP: SpeciesDef = { id: 'sp', name: 'Test species', habitat: ['grass', 'forest', 'river'], need: 6, homes: 2 };

const spread = (over: Partial<ThreatDef> = {}): ThreatDef => ({ id: 't', kind: 'frontier', behaviour: 'spread', label: 't', strength: 2, ...over });

function mission(threats: ThreatDef[], over: Partial<MissionDef> = {}): MissionDef {
  return {
    id: 't', title: 't', blurb: '', region: 'test', theme: 'land', issue: 'x', catalogue: [], size: [8, 8], seed: 1, turns: 10, energy: 4, floor: 0.2,
    map: { base: 'grass' }, threats, species: [SP], ...over,
  };
}

/** A clean, flat, healthy map with no threat bodies, so each rule can be tested in isolation. */
function blank(m: MissionDef, biome: Biome = 'grass'): GameState {
  const s = createGame(m);
  s.tiles.forEach((t) => Object.assign(t, { biome, health: 2, threat: null, age: 0, protected: false, defended: false, risky: false }));
  s.sources = {};
  s.energy = m.energy;
  s.surge = {};
  s.event = null;
  planThreats(s);
  return s;
}

const g = new HexGrid(8, 8);
const bodyOf = (s: GameState, id: string) => s.tiles.flatMap((t, i) => (t.threat === id ? [i] : []));
const targets = (s: GameState, id: string) => s.plan[id].flatMap((it) => it.path);

describe('the rulebook', () => {
  it('fits in 8 lines and there are exactly 5 actions', () => {
    expect(RULEBOOK.length).toBeLessThanOrEqual(8);
    expect(ACTIONS.length).toBe(5);
  });
  it('quotes the real action costs', () => {
    for (const a of ACTIONS) expect(RULEBOOK.join('\n')).toContain(`${a.label} ${a.cost}⚡`);
  });
  it('gives every behaviour a one-line rule', () => {
    for (const behaviour of ['spread', 'flow', 'hunt', 'strike'] as const) expect(ruleText({ behaviour, strength: 2 })).not.toContain('\n');
  });
});

describe('actions', () => {
  it('Restore lifts a tile one step for 1⚡, and refuses a Healthy or built-up tile', () => {
    const s = blank(mission([spread({ strength: 0 })]));
    s.tiles[5].health = 0;
    expect(perform(s, 'restore', 5).ok).toBe(true);
    expect(s.tiles[5].health).toBe(1);
    expect(s.energy).toBe(3);
    perform(s, 'restore', 5);
    expect(s.tiles[5].health).toBe(2);
    expect(whyNot(s, 'restore', 5)).toMatch(/Healthy/);
    s.tiles[6].biome = 'town';
    expect(whyNot(s, 'restore', 6)).toMatch(/Built/);
  });

  it('Defend blocks a planned hit this turn, and wears off', () => {
    const s = blank(mission([spread({ id: 'f', strength: 3 })]));
    s.tiles[g.index(3, 0)].biome = 'farm';
    s.sources.f = [];
    planThreats(s);
    const hit = targets(s, 'f');
    expect(hit.length).toBe(3);
    for (const i of hit) perform(s, 'defend', i);
    endTurn(s);
    expect(hit.every((i) => s.tiles[i].health === 2 && s.tiles[i].threat === null)).toBe(true);
    expect(s.tiles.every((t) => !t.defended)).toBe(true);
  });

  it('Remove costs 2⚡ and clears a threat, but not at its source', () => {
    const s = blank(mission([spread({ id: 'f' })]));
    s.tiles[10].threat = 'f';
    s.sources.f = [11];
    s.tiles[11].threat = 'f';
    expect(perform(s, 'remove', 10).ok).toBe(true);
    expect(s.tiles[10].threat).toBeNull();
    expect(s.energy).toBe(2);
    expect(whyNot(s, 'remove', 11)).toMatch(/comes from/);
    expect(whyNot(s, 'remove', 12)).toMatch(/No threat/);
  });

  it('Protect costs 3⚡ and covers the tile and its ring', () => {
    const s = blank(mission([spread({ strength: 0 })]));
    const c = g.index(4, 4);
    expect(perform(s, 'protect', c).ok).toBe(true);
    expect(s.energy).toBe(1);
    for (const i of g.within(c, 1)) expect(s.tiles[i].protected).toBe(true);
    expect(s.tiles.filter((t) => t.protected).length).toBe(7);
    expect(whyNot(s, 'protect', c)).toBe('Needs 3⚡ and you have 1.');
  });

  it('Campaign makes a threat 1 weaker for 3⚡, and at 0 it stops and its body is cleared', () => {
    const s = blank(mission([spread({ id: 'f', strength: 2 })]));
    s.energy = 9;
    s.tiles[3].threat = 'f';
    perform(s, 'campaign', 0);
    expect(s.strength.f).toBe(1);
    expect(s.energy).toBe(6);
    perform(s, 'campaign', 0);
    expect(s.strength.f).toBe(0);
    expect(s.tiles[3].threat).toBeNull();
    expect(s.plan.f).toEqual([]);
    expect(whyNot(s, 'campaign', 0)).toBe('Already stopped.');
  });

  it('a risky ⚠ tile costs +1⚡', () => {
    const s = blank(mission([spread({ strength: 0 })]));
    s.tiles[8].risky = true;
    expect(costOf(s, 'restore', 8)).toBe(2);
    s.tiles[8].health = 0;
    perform(s, 'restore', 8);
    expect(s.energy).toBe(2);
  });

  it('a mission can limit which actions exist', () => {
    const s = blank(mission([spread()], { actions: ['restore', 'defend'] }));
    expect(whyNot(s, 'campaign', 0)).toBe('Not available in this mission.');
  });

  it('Energy refills every turn and never banks', () => {
    const s = blank(mission([spread({ strength: 0 })]));
    s.energy = 3;
    endTurn(s);
    expect(s.energy).toBe(4);
  });
});

describe('Spread', () => {
  it('grows onto `strength` open tiles beside its body, and the plan is exactly what happens', () => {
    const s = blank(mission([spread({ id: 'f', strength: 3 })]));
    s.tiles[g.index(3, 3)].threat = 'f';
    planThreats(s);
    const hit = targets(s, 'f');
    expect(hit.length).toBe(3);
    const body = g.index(3, 3);
    for (const i of hit) expect(g.neighbors(body)).toContain(i);
    executePlan(s);
    expect(bodyOf(s, 'f').sort()).toEqual([body, ...hit].sort((a, b) => a - b));
    expect(hit.every((i) => s.tiles[i].health === 1)).toBe(true);
  });

  it('replanning gives the same arrows until something changes', () => {
    const s = blank(mission([spread({ id: 'f', strength: 3 })]));
    s.tiles[g.index(3, 3)].threat = 'f';
    planThreats(s);
    const before = JSON.stringify(s.plan);
    planThreats(s);
    expect(JSON.stringify(s.plan)).toBe(before);
  });

  it('never targets a Protected tile', () => {
    const s = blank(mission([spread({ id: 'f', strength: 6 })]));
    const body = g.index(3, 3);
    s.tiles[body].threat = 'f';
    perform(s, 'protect', g.neighbors(body)[0]);
    planThreats(s);
    for (const i of targets(s, 'f')) expect(s.tiles[i].protected).toBe(false);
  });

  it('fire burns out after its lifetime', () => {
    const s = blank(mission([spread({ id: 'fire', kind: 'fire', strength: 1, lifetime: 2, dir: 0 })], { turns: 20 }));
    s.tiles[g.index(3, 3)].threat = 'fire';
    s.tiles[g.index(3, 3)].age = 0;
    endTurn(s);
    expect(s.tiles[g.index(3, 3)].threat).toBe('fire');
    endTurn(s);
    expect(s.tiles[g.index(3, 3)].threat).toBeNull();
  });

  it('an event card can add strength for one turn only', () => {
    const m = mission([spread({ id: 'f', strength: 1 })], { events: [{ id: 'e', turn: 2, title: 'Dry', text: '', effect: { kind: 'surge', threat: 'f', amount: 1 } }] });
    const s = blank(m);
    s.tiles[g.index(3, 3)].threat = 'f';
    planThreats(s);
    expect(targets(s, 'f').length).toBe(1);
    endTurn(s);
    expect(s.turn).toBe(2);
    expect(targets(s, 'f').length).toBe(2);
    endTurn(s);
    expect(targets(s, 'f').length).toBe(1);
  });
});

describe('Flow', () => {
  const flow = (over: Partial<ThreatDef> = {}): ThreatDef => ({ id: 'p', kind: 'plume', behaviour: 'flow', label: 'p', strength: 3, dir: 5, targets: ['grass'], ...over });

  it('moves `strength` tiles downstream and hurts every tile it passes', () => {
    const s = blank(mission([flow()]));
    const src = g.index(2, 0);
    s.sources.p = [src];
    planThreats(s);
    const path = s.plan.p[0].path;
    expect(path.length).toBe(3);
    expect(path[0]).toBe(src);
    executePlan(s);
    for (const i of path) expect(s.tiles[i].health).toBe(1);
    planThreats(s);
    expect(s.plan.p[0].from).toBe(path[2]); // the next move starts from the head
  });

  it('a Defended tile is passed over unharmed', () => {
    const s = blank(mission([flow()]));
    s.sources.p = [g.index(2, 0)];
    planThreats(s);
    const [a, b] = s.plan.p[0].path;
    perform(s, 'defend', b);
    executePlan(s);
    expect(s.tiles[a].health).toBe(1);
    expect(s.tiles[b].health).toBe(2);
  });
});

describe('Hunt', () => {
  const hunt = (over: Partial<ThreatDef> = {}): ThreatDef => ({ id: 'h', kind: 'poaching', behaviour: 'hunt', label: 'Poachers', strength: 2, ...over });

  function hunted(def = hunt()) {
    const s = blank(mission([def]));
    s.species[0].homes = [g.index(3, 6)];
    s.sources.h = [g.index(3, 0)];
    s.tiles[g.index(3, 0)].threat = 'h';
    planThreats(s);
    return s;
  }

  it('moves `strength` steps toward a 🐾 home', () => {
    const s = hunted();
    const home = s.species[0].homes[0];
    const item = s.plan.h[0];
    expect(item.path.length).toBe(2);
    expect(g.distance(item.path[1], home)).toBe(g.distance(g.index(3, 0), home) - 2);
    executePlan(s);
    expect(s.tiles[item.path[1]].threat).toBe('h');
    expect(s.tiles[g.index(3, 0)].threat).toBeNull();
  });

  it('costs the species a ♥ when it reaches a home, then the hunter goes back to its source', () => {
    const s = hunted(hunt({ strength: 9 }));
    expect(s.plan.h[0].path.at(-1)).toBe(s.species[0].homes[0]);
    executePlan(s);
    expect(s.species[0].hearts).toBe(2);
    expect(s.tiles[g.index(3, 0)].threat).toBe('h');
    expect(bodyOf(s, 'h').length).toBe(1);
  });

  it('is turned back to its source by a Defended tile on its path', () => {
    const s = hunted(hunt({ strength: 9 }));
    perform(s, 'defend', s.plan.h[0].path[3]);
    executePlan(s);
    expect(s.species[0].hearts).toBe(3);
    expect(s.tiles[g.index(3, 0)].threat).toBe('h');
  });

  it('is turned back by Protect around a home', () => {
    const s = hunted(hunt({ strength: 9 }));
    s.energy = 3;
    perform(s, 'protect', s.species[0].homes[0]);
    executePlan(s);
    expect(s.species[0].hearts).toBe(3);
  });

  it('Remove kills a hunter for good', () => {
    const s = hunted();
    s.tiles[g.index(3, 1)].threat = 'h';
    s.tiles[g.index(3, 0)].threat = null;
    s.tiles[g.index(3, 1)].age = 0;
    perform(s, 'remove', g.index(3, 1));
    expect(bodyOf(s, 'h')).toEqual([]);
    expect(s.plan.h).toEqual([]);
  });
});

describe('Strike', () => {
  const strike = (over: Partial<ThreatDef> = {}): ThreatDef => ({ id: 'k', kind: 'heat', behaviour: 'strike', label: 'Heat wave', strength: 4, start: 3, targets: ['grass'], ...over });

  it('announces its tiles with a countdown and hits only on the turn', () => {
    const s = blank(mission([strike()], { turns: 12 }));
    expect(s.plan.k.length).toBe(4);
    expect(s.plan.k[0].eta).toBe(2);
    const hit = targets(s, 'k');
    endTurn(s);
    expect(hit.every((i) => s.tiles[i].health === 2)).toBe(true);
    expect(s.plan.k[0].eta).toBe(1);
    expect(targets(s, 'k')).toEqual(hit); // the same tiles all the way down
    endTurn(s);
    expect(s.plan.k[0].eta).toBe(0);
    endTurn(s);
    expect(hit.every((i) => s.tiles[i].health === 1)).toBe(true);
  });

  it('is not stopped by Protect, but is by Defend', () => {
    const s = blank(mission([strike({ start: 1 })]));
    const [a, b] = targets(s, 'k');
    s.tiles[a].protected = true;
    perform(s, 'defend', b);
    executePlan(s);
    expect(s.tiles[a].health).toBe(1);
    expect(s.tiles[b].health).toBe(2);
  });
});

describe('plan is exact', () => {
  it('after startTurn, the end of turn hits exactly the planned tiles that are not Defended or Protected', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const threats: ThreatDef[] = [
        spread({ id: 'a', strength: 3, from: 'pressure', sources: 2 }),
        { id: 'b', kind: 'plume', behaviour: 'flow', label: 'b', strength: 2, from: 'river', dir: 5 },
        { id: 'c', kind: 'heat', behaviour: 'strike', label: 'c', strength: 3, start: 1 },
      ];
      const s = createGame(mission(threats, { seed, map: { base: 'forest', accent: 'wetland', accentAmount: 0.2, pressure: ['farm'], side: 'n', river: true, depth: 4 } }));
      const planned = new Set(Object.entries(s.plan).flatMap(([id, items]) => items.filter((it) => it.eta === 0).flatMap((it) => it.path.map((i) => `${id}:${i}`))));
      const defended = [...planned].slice(0, 2).map((k) => Number(k.split(':')[1]));
      for (const i of defended) s.tiles[i].defended = true;
      const before = s.tiles.map((t) => t.health);
      executePlan(s);
      s.tiles.forEach((t, i) => {
        const hit = [...planned].some((k) => Number(k.split(':')[1]) === i);
        const shielded = t.defended || (t.protected && ![...planned].some((k) => k === `c:${i}`));
        if (hit && !shielded) expect(t.health, `seed ${seed} tile ${i}`).toBeLessThanOrEqual(before[i]);
        if (!hit) expect(t.health, `seed ${seed} tile ${i}`).toBe(before[i]);
        if (shielded) expect(t.health).toBe(before[i]);
      });
    }
  });
});

describe('species', () => {
  it('loses a ♥ every turn with too few Healthy tiles, and is gone at 0', () => {
    const s = blank(mission([spread({ strength: 0 })], { turns: 30 }));
    s.tiles.forEach((t, i) => (t.health = i < 3 ? 2 : 1)); // 3 healthy, needs 6
    ecoHealth(s);
    endTurn(s);
    expect(s.species[0].hearts).toBe(2);
    endTurn(s);
    endTurn(s);
    expect(s.species[0].extinct).toBe(true);
    expect(s.outcome).toBe('lost');
    expect(s.loseReason).toBe('extinction');
  });

  it('is fine while enough tiles stay Healthy', () => {
    const s = blank(mission([spread({ strength: 0 })]));
    for (let i = 0; i < 5; i++) endTurn(s);
    expect(s.species[0].hearts).toBe(3);
  });
});

describe('winning, losing and stars', () => {
  it('loses when the ecosystem bar falls below the red line', () => {
    const s = blank(mission([spread({ strength: 0 })], { floor: 0.9 }));
    s.tiles.slice(0, 20).forEach((t) => (t.health = 0));
    s.species[0].def.need = 0;
    endTurn(s);
    expect(s.outcome).toBe('lost');
    expect(s.loseReason).toBe('collapse');
  });

  it('wins by surviving the last turn, with ★ only if nothing improved', () => {
    const s = blank(mission([spread({ id: 'f', strength: 1 })], { turns: 3, floor: 0 }));
    s.species[0].def.need = 0;
    s.startEco = 1;
    s.tiles[g.index(3, 3)].threat = 'f';
    planThreats(s);
    while (s.outcome === 'playing') endTurn(s);
    expect(s.outcome).toBe('won');
    expect(starChecks(s)).toEqual({ survive: true, eco: false, stopped: false });
    expect(stars(s)).toBe(1);
  });

  it('★★ for ending as healthy as it started, ★★★ when every threat is stopped as well', () => {
    const s = blank(mission([spread({ id: 'f', strength: 1 })], { turns: 2, floor: 0 }));
    s.species[0].def.need = 0;
    s.startEco = ecoHealth(s);
    perform(s, 'campaign', 0);
    while (s.outcome === 'playing') endTurn(s);
    expect(stars(s)).toBe(3);
  });

  it('a lost mission earns no stars', () => {
    const s = blank(mission([spread({ strength: 0 })], { floor: 1.5 }));
    endTurn(s);
    expect(s.outcome).toBe('lost');
    expect(stars(s)).toBe(0);
  });
});

describe('Movement HQ perks', () => {
  const m = mission([spread()]);
  it('Volunteers add Energy on the first turn only', () => {
    const s = createGame(m, { volunteers: 2 });
    expect(s.energy).toBe(m.energy + 2);
    endTurn(s);
    expect(s.energy).toBe(m.energy);
  });
  it('Seed bank makes the first Restore free, once per level', () => {
    const s = blank(m);
    s.perks = { seedbank: 1 };
    s.free = { restore: 1 };
    s.tiles[8].health = 0;
    s.tiles[9].health = 0;
    expect(costOf(s, 'restore', 8)).toBe(0);
    perform(s, 'restore', 8);
    expect(s.energy).toBe(m.energy);
    expect(costOf(s, 'restore', 9)).toBe(1);
    perform(s, 'restore', 9);
    expect(s.energy).toBe(m.energy - 1);
  });
  it('Rapid response makes the first Defend free', () => {
    const s = blank(m);
    s.free = { defend: 1 };
    perform(s, 'defend', 8);
    expect(s.energy).toBe(m.energy);
    perform(s, 'defend', 9);
    expect(s.energy).toBe(m.energy - 1);
  });
  it('Legal aid removes the risky ⚠ surcharge', () => {
    const s = blank(m);
    s.tiles[8].risky = true;
    expect(costOf(s, 'restore', 8)).toBe(2);
    s.perks = { legalaid: 1 };
    expect(costOf(s, 'restore', 8)).toBe(1);
  });
  it('a game started with no perks is unchanged', () => {
    expect(createGame(m).energy).toBe(m.energy);
    expect(createGame(m).free).toEqual({ restore: 0, defend: 0 });
  });
});
