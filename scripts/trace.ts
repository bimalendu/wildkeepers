// Prints the bot's turn-by-turn play of one mission, to see why it wins or loses.   npx tsx scripts/trace.ts la-amazon [seedOffset]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { perform } from '../src/sim/actions';
import { candidates } from '../src/sim/bot';
import { createGame, ecoHealth, endTurn, starChecks } from '../src/sim/engine';
import type { MissionDef } from '../src/sim/types';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const file = walk('src/levels/missions').find((f) => f.endsWith(`${process.argv[2]}.json`));
if (!file) throw new Error('mission not found');
const m = JSON.parse(readFileSync(file, 'utf8')) as MissionDef;
m.seed += 13 * Number(process.argv[3] ?? 0);
const s = createGame(m);
const hearts = () => s.species.map((x) => `${x.def.id}:${x.hearts}♥ ${x.healthy}/${x.def.need}`).join(' ');
console.log(m.id, 'start eco', ecoHealth(s).toFixed(2), 'floor', m.floor, hearts());
while (s.outcome === 'playing') {
  const acts: string[] = [];
  while (s.energy > 0) {
    const cs = candidates(s).sort((a, b) => b.score - a.score);
    if (!cs.length) break;
    const r = perform(s, cs[0].action.id, cs[0].target);
    acts.push(`${cs[0].action.id}@${cs[0].target}${r.ok ? '' : '!'}`);
  }
  const arrows = Object.values(s.plan).reduce((n, items) => n + items.reduce((k, it) => k + it.path.length, 0), 0);
  console.log(`T${s.turn} ⚡${s.mission.energy} arrows ${arrows}`, acts.join(' '));
  endTurn(s);
  console.log(`   eco ${ecoHealth(s).toFixed(2)} ${hearts()} markers ${s.tiles.filter((t) => t.threat).length} ${s.log.slice(0, 2).join('|')}`);
}
console.log(s.outcome, s.loseReason, JSON.stringify(starChecks(s)));
