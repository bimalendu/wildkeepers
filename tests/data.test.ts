import { describe, expect, it } from 'vitest';
import catalogue from '../src/data/catalogue.json';
import { BOUNDARIES, IPBES_DRIVERS } from '../src/data/frameworks';
import { REGIONS, tierOne } from '../src/data/regions';
import hopeCards from '../src/data/hope-cards.json';
import { MISSIONS } from '../src/levels';
import { badge, compareByPriority, crisisClock, priorityScore } from '../src/sim/priority';

const ids = new Set(catalogue.map((c) => c.id));
const REQUIRED_THEMES = ['land', 'wildlife', 'plants', 'ocean', 'climate', 'pollution'];

describe('catalogue', () => {
  it('has the 95 issues, numbered 1-95, each tagged with a driver', () => {
    expect(catalogue.length).toBe(95);
    expect([...ids].sort((a, b) => a - b)).toEqual(Array.from({ length: 95 }, (_, i) => i + 1));
    for (const c of catalogue) {
      expect(c.driver in IPBES_DRIVERS, `${c.id} driver`).toBe(true);
      expect(c.placements.length, `${c.id} placement`).toBeGreaterThan(0);
      for (const b of c.boundaries) expect(b in BOUNDARIES, `${c.id} boundary ${b}`).toBe(true);
    }
  });
});

describe('priority', () => {
  it('weights severity, urgency, irreversibility and reach', () => {
    expect(priorityScore({ severity: 5, urgency: 5, irreversibility: 5, reach: 5 })).toBeCloseTo(5);
    expect(priorityScore({ severity: 1, urgency: 1, irreversibility: 1, reach: 1 })).toBeCloseTo(1);
    expect(priorityScore({ severity: 5, urgency: 1, irreversibility: 1, reach: 1 })).toBeCloseTo(0.35 * 5 + 0.3 + 0.2 + 0.15);
  });
  it('badges and crisis clock rise with priority', () => {
    expect(badge(4.5)).toBe('Critical');
    expect(badge(3.6)).toBe('High');
    expect(badge(2.5)).toBe('Elevated');
    expect(crisisClock(5)).toBeGreaterThan(crisisClock(3));
  });
  it('breaks ties by IPBES driver rank, then id', () => {
    const p = { severity: 4, urgency: 4, irreversibility: 4, reach: 4 };
    const list = [
      { id: 'b', priority: p, driver: 'invasives' as const },
      { id: 'a', priority: p, driver: 'land-sea-use' as const },
      { id: 'c', priority: p, driver: 'land-sea-use' as const },
    ].sort(compareByPriority);
    expect(list.map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });
});

describe('regions', () => {
  const missionIds = new Set(MISSIONS.map((m) => m.id));
  it('has at least one region written', () => expect(REGIONS.length).toBeGreaterThan(0));
  for (const region of REGIONS) {
    describe(region.id, () => {
      const t1 = region.issues.filter((i) => i.tier === 1);
      it('has seven Tier 1 missions covering every theme', () => {
        expect(t1.length).toBe(7);
        const themes = new Set(t1.map((i) => i.theme));
        // the poles and the high seas have no plant-led issue; every other region covers all the themes
        if (region.id === 'global-fronts') return; // cross-cutting problems: not tied to one habitat
        for (const t of REQUIRED_THEMES.filter((x) => !(x === 'plants' && region.id === 'polar-high-seas'))) expect(themes.has(t as never), `theme ${t}`).toBe(true);
        expect(themes.has('freshwater') || themes.has('deepsea')).toBe(true);
      });
      it('gives every Tier 1 issue priority inputs, drivers, sites, a sourced fact and a real mission', () => {
        for (const i of t1) {
          for (const v of Object.values(i.priority)) expect(v).toBeGreaterThanOrEqual(1), expect(v).toBeLessThanOrEqual(5);
          expect(i.drivers.length, `${i.id} drivers`).toBeGreaterThanOrEqual(2);
          expect(i.drivers.length).toBeLessThanOrEqual(5);
          expect(i.sites.length, `${i.id} sites`).toBeGreaterThanOrEqual(2);
          expect(i.fact?.url, `${i.id} fact url`).toMatch(/^https:\/\//);
          expect(i.fact?.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(i.realWorld?.length ?? 0).toBeGreaterThan(20);
          expect(i.mission && missionIds.has(i.mission), `${i.id} mission`).toBe(true);
        }
      });
      it('only references real catalogue ids', () => {
        for (const i of region.issues) {
          for (const c of [...i.catalogue, ...i.drivers.flatMap((d) => d.catalogue ?? [])]) expect(ids.has(c), `${i.id} -> ${c}`).toBe(true);
        }
        for (const m of MISSIONS.filter((x) => x.region === region.id)) for (const c of m.catalogue) expect(ids.has(c), `${m.id} -> ${c}`).toBe(true);
      });
      it('unlocks missions in priority order, highest first', () => {
        const order = tierOne(region).map((i) => i.id);
        const sorted = [...t1].sort(compareByPriority).map((i) => i.id);
        expect(order).toEqual(sorted);
        const scores = tierOne(region).map((i) => priorityScore(i.priority));
        for (let k = 1; k < scores.length; k++) expect(scores[k]).toBeLessThanOrEqual(scores[k - 1] + 1e-9);
      });
      it('has Tier 2 nodes for the Issue Tree', () => expect(region.issues.filter((i) => i.tier === 2).length).toBeGreaterThan(0));
    });
  }
});

describe('catalogue coverage', () => {
  const placed = new Set<number>();
  for (const r of REGIONS) for (const i of r.issues) [...i.catalogue, ...i.drivers.flatMap((d) => d.catalogue ?? [])].forEach((c) => placed.add(c));
  for (const m of MISSIONS) m.catalogue.forEach((c) => placed.add(c));

  it('reports what is still unplaced', () => {
    const missing = catalogue.filter((c) => !placed.has(c.id)).map((c) => c.id);
    console.log(`catalogue coverage: ${placed.size}/95 placed; ${missing.length} still to place`);
    expect(placed.size).toBeGreaterThan(0);
  });
  // All nine regions and Global Fronts are written, so full coverage is now required.
  it('places all 95 issues', () => {
    expect(catalogue.filter((c) => !placed.has(c.id)).map((c) => c.id)).toEqual([]);
  });
  it('covers every IPBES driver and every breached boundary with a mission', () => {
    const covered = new Set(catalogue.filter((c) => placed.has(c.id)));
    for (const d of ['land-sea-use', 'exploitation', 'climate', 'pollution', 'invasives']) expect([...covered].some((c) => c.driver === d && c.placements.includes('M')), d).toBe(true);
    for (const [b, v] of Object.entries(BOUNDARIES)) if (v.breached) expect([...covered].some((c) => c.boundaries.includes(b as never)), b).toBe(true);
  });
});

describe('hope cards', () => {
  it('are source-checked: each has a source, an https link and a check date', () => {
    expect(hopeCards.length).toBeGreaterThanOrEqual(6);
    for (const h of hopeCards) {
      expect(h.verified, `${h.id} verified`).toBe(true);
      expect(h.url, `${h.id} url`).toMatch(/^https:\/\//);
      expect(h.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(h.source.length).toBeGreaterThan(3);
    }
  });
  it('has one hope mission, the last in its region', () => {
    const hope = MISSIONS.filter((m) => m.hope);
    expect(hope.map((m) => m.id)).toEqual(['gf-ozone']);
    expect(tierOne(REGIONS.find((r) => r.id === 'global-fronts')!).at(-1)?.mission).toBe('gf-ozone');
  });
});
