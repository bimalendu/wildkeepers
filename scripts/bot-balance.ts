// Plays every mission headlessly: the greedy bot on several seeds, and a do-nothing run. Prints a balance table.
//   npm run bot            # all missions
//   npm run bot -- fire    # missions whose id/file contains "fire"
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { playBot } from '../src/sim/bot';
import { createGame, ecoHealth, stars } from '../src/sim/engine';
import type { MissionDef } from '../src/sim/types';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : [];
  });
}

const filter = process.argv[2] ?? '';
const SEEDS = [0, 1, 2, 3, 4];
for (const file of walk('src/levels/missions').filter((f) => f.includes(filter))) {
  const m = JSON.parse(readFileSync(file, 'utf8')) as MissionDef;
  const start = ecoHealth(createGame(m));
  const runs = SEEDS.map((k) => {
    const mm = structuredClone(m);
    mm.seed += k * 13;
    const r = playBot(mm);
    return { r, stars: stars(r.state) };
  });
  const wins = runs.filter((x) => x.r.outcome === 'won');
  const nothing = playBot(m, true);
  console.log(
    `${m.id.padEnd(22)} start ${start.toFixed(2)} floor ${m.floor.toFixed(2)}  bot ${wins.length}/${SEEDS.length} won` +
      `  stars ${runs.map((x) => x.stars).join('')}  lost: ${runs.filter((x) => x.r.outcome === 'lost').map((x) => x.r.loseReason).join(',') || '-'}` +
      `  do-nothing: ${nothing.outcome}${nothing.loseReason ? `(${nothing.loseReason})` : ''} t${nothing.turns}/${m.turns}`,
  );
}
