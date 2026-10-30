import { readdirSync, readFileSync } from 'node:fs';
import type { HopeCard } from '../../src/data/hope';
import type { RegionDef } from '../../src/data/regions';
import { compareByPriority } from '../../src/sim/priority';
import type { MissionDef } from '../../src/sim/types';
import { RULEBOOK } from '../../src/sim/rules';

/** One piece of real-world information the game shows, as the player sees it. */
export interface Item {
  id: string;
  /** Exactly what the game displays; the ledger must hold the same text. */
  text: string;
  /** Links the game displays for it (fact and Hope cards). */
  urls: string[];
}

// Read the shipped JSON directly (import.meta.glob only exists under Vite), so tsx scripts and vitest see the same data.
const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')) as T;
const jsonIn = (dir: string): string[] => readdirSync(new URL(`../../${dir}`, import.meta.url)).filter((f) => f.endsWith('.json')).sort().map((f) => `${dir}/${f}`);

const missions = (): MissionDef[] =>
  readdirSync(new URL('../../src/levels/missions', import.meta.url)).sort().flatMap((d) => jsonIn(`src/levels/missions/${d}`).map((p) => readJson<MissionDef>(p)));

/** Tier C: the labels the Issue Tree and Briefing show (titles, drivers, sites, threat names), the catalogue names and the general statements. */
function labelItems(): Item[] {
  const items: Item[] = [];
  const all = missions();
  for (const path of jsonIn('src/data/regions')) {
    const r = readJson<RegionDef>(path);
    for (const issue of r.issues.filter((i) => i.tier === 1).sort(compareByPriority)) {
      const m = all.find((x) => x.id === issue.mission)!;
      items.push({ id: `label:${m.id}`, text: [issue.title, `Drivers: ${issue.drivers.map((d) => d.name).join('; ')}`, `Sites: ${issue.sites.join('; ')}`, `Threats: ${m.threats.map((t) => t.label).join('; ')}`].join('\n'), urls: [] });
    }
    for (const issue of r.issues.filter((i) => i.tier === 2).sort(compareByPriority)) {
      items.push({ id: `tier2:${issue.id}`, text: [issue.title, `Drivers: ${issue.drivers.map((d) => d.name).join('; ')}`, `Sites: ${issue.sites.join('; ')}`].join('\n'), urls: [] });
    }
  }
  const catalogue = readJson<{ id: number; name: string }[]>('src/data/catalogue.json');
  items.push({ id: 'general:catalogue', text: catalogue.map((c) => `${c.id}. ${c.name}`).join('\n'), urls: [] });
  items.push({ id: 'general:rulebook', text: RULEBOOK.join('\n'), urls: [] });
  items.push({ id: 'general:risky-tile', text: '⚠ risky for activists: +1⚡', urls: [] });
  const events = new Map<string, string>();
  for (const m of all) for (const e of m.events ?? []) events.set(e.id, `${e.title}: ${e.text}`);
  items.push({ id: 'general:events', text: [...events.values()].sort().join('\n'), urls: [] });
  return items;
}

/** Tier A, B and C: the items whose ledger text must match the game word for word. */
export function displayedItems(): Item[] {
  const items: Item[] = [];
  for (const h of readJson<HopeCard[]>('src/data/hope-cards.json')) {
    items.push({ id: `hope:${h.id}`, text: `${h.title}\n${h.text}\n${h.cause}`, urls: [h.url, ...(h.also ?? []).map((a) => a.url)] });
  }
  const all = missions();
  for (const path of jsonIn('src/data/regions')) {
    const r = readJson<RegionDef>(path);
    items.push({ id: `region:${r.id}`, text: r.blurb, urls: [] });
    for (const issue of r.issues.filter((i) => i.tier === 1).sort(compareByPriority)) {
      const m = all.find((x) => x.id === issue.mission)!;
      if (issue.fact) items.push({ id: `fact:${m.id}`, text: issue.fact.text, urls: [issue.fact.url, ...(issue.fact.also ?? []).map((a) => a.url)] });
      items.push({ id: `blurb:${m.id}`, text: m.blurb, urls: [] });
      if (issue.realWorld) items.push({ id: `advice:${m.id}`, text: issue.realWorld, urls: [] });
    }
  }
  for (const m of all) for (const sp of m.species) items.push({ id: `species:${m.id}:${sp.id}`, text: sp.name, urls: [] });
  return [...items, ...labelItems()];
}
