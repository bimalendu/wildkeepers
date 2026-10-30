import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../src/levels';
import { playBot } from '../src/sim/bot';
import { BEHAVIOUR_OF_KIND } from '../src/sim/types';

describe('every mission', () => {
  for (const m of MISSIONS) {
    describe(m.id, () => {
      it('is winnable by the bot', () => {
        const r = playBot(m);
        expect(r.outcome, `bot ended ${r.outcome}/${r.loseReason} on turn ${r.turns}`).toBe('won');
      });
      it('is a real threat: doing nothing loses', () => {
        if (m.hope) return;
        expect(playBot(m, true).outcome).toBe('lost');
      });
      it('has well-formed data', () => {
        expect(m.threats.length).toBeGreaterThan(0);
        expect(m.species.length).toBeGreaterThan(0);
        expect(m.energy).toBeGreaterThanOrEqual(3);
        expect(m.floor).toBeGreaterThan(0);
        expect(m.floor).toBeLessThan(1);
        for (const sp of m.species) expect(sp.need).toBeGreaterThan(0);
        for (const t of m.threats) expect(t.behaviour, `${t.id} behaviour`).toBe(BEHAVIOUR_OF_KIND[t.kind]);
        expect(new Set(m.threats.map((t) => t.id)).size).toBe(m.threats.length);
      });
    });
  }
});
