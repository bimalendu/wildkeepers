import { describe, expect, it } from 'vitest';
import { displayedItems } from '../scripts/facts/items';
import { loadLedger, meetsSourceBar } from '../scripts/facts/ledger';

const ledger = loadLedger();
const shown = new Map(displayedItems().map((i) => [i.id, i]));
const entryIds = new Set(ledger.entries.map((e) => e.id));

describe('fact ledger', () => {
  it('has one entry per id', () => {
    expect(ledger.entries.length).toBe(entryIds.size);
  });

  for (const e of ledger.entries) {
    describe(e.id, () => {
      it('has a valid verdict and check date', () => {
        expect(['pass', 'fix', 'drop']).toContain(e.verdict);
        expect(Number.isNaN(Date.parse(e.checked)), 'checked date').toBe(false);
      });
      it('shows exactly the text that was checked (or nothing, if dropped)', () => {
        if (e.verdict === 'drop') expect(shown.has(e.id), 'a dropped item is still displayed').toBe(false);
        else expect(shown.get(e.id)?.text, 'displayed text differs from the checked text').toBe(e.text);
      });
      if (e.verdict !== 'drop' && e.claimless) {
        it('explains why it has no claims', () => {
          expect(e.claims.length).toBe(0);
          expect((e.notes ?? '').trim().length).toBeGreaterThan(0);
        });
      }
      if (e.verdict !== 'drop' && !e.claimless) {
        it('has every claim checked, sourced to the bar and quoted', () => {
          expect(e.claims.length).toBeGreaterThan(0);
          for (const c of e.claims) {
            expect(c.ok, `claim not ok: ${c.claim}`).toBe(true);
            if (c.bar === 'single') {
              expect(e.id.startsWith('species:'), `only species habitat may use the single-source bar: ${e.id}`).toBe(true);
              expect(c.sources.length, `sources: ${c.claim}`).toBeGreaterThan(0);
            } else expect(meetsSourceBar(c.sources), `source bar: ${c.claim}`).toBe(true);
            for (const s of c.sources) expect(s.quote.trim().length, `quote for ${s.url}`).toBeGreaterThan(0);
          }
        });
        it('was checked against every link the game shows', () => {
          const opened = new Set(e.claims.flatMap((c) => c.sources.map((s) => s.url)));
          for (const u of shown.get(e.id)?.urls ?? []) expect(opened.has(u), `link never opened: ${u}`).toBe(true);
        });
      }
    });
  }

  it.runIf(ledger.complete)('covers every displayed item', () => {
    const missing = [...shown.keys()].filter((id) => !entryIds.has(id));
    expect(missing).toEqual([]);
  });
});
