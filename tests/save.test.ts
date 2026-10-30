import { describe, expect, it } from 'vitest';
import { SaveStore, migrate, SAVE_VERSION } from '../src/save/SaveStore';
import { PERKS } from '../src/sim/perks';

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('save', () => {
  it('recovers from garbage', () => {
    for (const raw of [null, 7, 'x', [], { stars: 'no', settings: 5, impact: -4 }, { version: 99, impact: 1e12 }]) {
      const s = migrate(raw);
      expect(s.version).toBe(SAVE_VERSION);
      expect(s.impact).toBeGreaterThanOrEqual(0);
      expect(s.impact).toBeLessThanOrEqual(9_999_999);
    }
  });
  it('clears stars from before Rules v2 but keeps Impact and settings', () => {
    const s = migrate({ version: 1, impact: 40, stars: { 'prologue-1': 3 }, settings: { muted: true } });
    expect(s.stars).toEqual({});
    expect(s.impact).toBe(40);
    expect(s.settings.muted).toBe(true);
  });
  it('keeps the best stars and pays Impact only for improvements', () => {
    const store = new SaveStore(memory());
    expect(store.recordMission('a', 2)).toBe(20);
    expect(store.recordMission('a', 1)).toBe(0);
    expect(store.recordMission('a', 3)).toBe(10);
    expect(store.starsFor('a')).toBe(3);
    expect(store.data.impact).toBe(30);
  });
  it('round-trips through storage and survives corrupt JSON', () => {
    const mem = memory();
    new SaveStore(mem).recordMission('b', 3);
    expect(new SaveStore(mem).starsFor('b')).toBe(3);
    mem.setItem('wildkeepers:save', '{oops');
    expect(new SaveStore(mem).data.impact).toBe(0);
  });
  it('works with no storage at all', () => {
    const s = new SaveStore(null);
    expect(() => s.recordMission('c', 1)).not.toThrow();
  });
  it('adds an empty Field Guide to a version 2 save', () => {
    const s = migrate({ version: 2, impact: 25, stars: { a: 2 } });
    expect(s.hopeSeen).toEqual([]);
    expect(s.impact).toBe(25);
    expect(s.stars).toEqual({ a: 2 });
  });
  it('sells perks one level at a time and takes the Impact', () => {
    const store = new SaveStore(memory());
    expect(store.buyPerk('volunteers')).toBe(false); // no Impact yet
    store.update((d) => (d.impact = 100));
    expect(store.buyPerk('volunteers')).toBe(true);
    expect(store.perkLevel('volunteers')).toBe(1);
    expect(store.data.impact).toBe(70);
    expect(store.buyPerk('volunteers')).toBe(true);
    expect(store.buyPerk('volunteers')).toBe(false); // top level
    expect(store.data.impact).toBe(10);
    expect(store.buyPerk('nonsense')).toBe(false);
  });
  it('a hand-edited save cannot go past a perk’s top level or invent perks', () => {
    const s = migrate({ version: SAVE_VERSION, perks: { volunteers: 9, legalaid: 5, fake: 3 } });
    expect(s.perks).toEqual({ volunteers: 2, legalaid: 1 });
  });
  it('remembers each Hope card once', () => {
    const store = new SaveStore(memory());
    store.seeHope('ozone');
    store.seeHope('ozone');
    expect(store.data.hopeSeen).toEqual(['ozone']);
  });
  it('has fixed, increasing prices for every perk', () => {
    for (const p of PERKS) expect(p.costs.every((c, i) => c > 0 && (i === 0 || c >= p.costs[i - 1]))).toBe(true);
  });
});
