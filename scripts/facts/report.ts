import { writeFileSync } from 'node:fs';
import { displayedItems } from './items';
import { loadLedger } from './ledger';

const ledger = loadLedger();
const shown = displayedItems();
const have = new Set(ledger.entries.map((e) => e.id));
const count = (v: string) => ledger.entries.filter((e) => e.verdict === v).length;
const unchecked = shown.filter((i) => !have.has(i.id));
const kind = (id: string) => id.split(':')[0];
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

const out: string[] = [
  '# Fact check',
  '',
  'Every real-world claim the game shows, checked against a source opened during the check. A claim is kept only with a primary source, or two independent reputable secondary sources that agree.',
  '',
  `Items in the game: ${shown.length}. Checked: ${ledger.entries.length}. **Pass ${count('pass')} · Fix ${count('fix')} · Drop ${count('drop')}.** Still to check: ${unchecked.length}.`,
  '',
];
for (const k of [...new Set(ledger.entries.map((e) => kind(e.id)))]) {
  out.push(`## ${k}`, '', '| Item | Verdict | Text | Notes |', '|---|---|---|---|');
  for (const e of ledger.entries.filter((x) => kind(x.id) === k)) out.push(`| ${e.id} | ${e.verdict} | ${cell(e.text)} | ${cell(e.notes ?? '')} |`);
  out.push('');
}
if (unchecked.length) out.push('## Not yet checked', '', ...unchecked.map((i) => `- ${i.id}`), '');
writeFileSync('docs/fact-check.md', out.join('\n'));
console.log(`docs/fact-check.md: ${ledger.entries.length}/${shown.length} checked (pass ${count('pass')}, fix ${count('fix')}, drop ${count('drop')})`);
