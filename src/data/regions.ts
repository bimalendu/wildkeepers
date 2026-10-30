import type { IpbesDriver } from './frameworks';
import type { PriorityInputs } from '../sim/priority';
import { compareByPriority } from '../sim/priority';
import type { Theme } from '../sim/types';

export interface FactCard {
  text: string;
  /** Where the fact comes from. */
  source: string;
  url: string;
  /** ISO date the fact and its status were last checked against the source. */
  checked: string;
  /** A second independent source, for a fact that rests on two secondary sources rather than one primary one. */
  also?: { source: string; url: string }[];
}

/** "Source: A" or, when a fact rests on two sources, "Sources: A; B". */
export const sourceLine = (c: { source: string; also?: { source: string }[] }): string =>
  `${c.also?.length ? 'Sources' : 'Source'}: ${[c.source, ...(c.also ?? []).map((a) => a.source)].join('; ')}`;

/** An L3 issue. Tier 1 issues have a mission; Tier 2 issues are Issue Tree nodes for later missions. */
export interface IssueDef {
  id: string;
  title: string;
  theme: Theme;
  tier: 1 | 2;
  driver: IpbesDriver;
  priority: PriorityInputs;
  /** Catalogue ids this issue covers. */
  catalogue: number[];
  /** L4: the drivers (causes) of the issue. */
  drivers: { name: string; catalogue?: number[] }[];
  /** L5: the concrete sites and species at stake. */
  sites: string[];
  /** Required for Tier 1 issues; Tier 2 nodes may leave it out until they become missions. */
  fact?: FactCard;
  /** One concrete, lawful step for the player in real life (Tier 1). */
  realWorld?: string;
  /** Tier 1 only: the mission that plays this issue. */
  mission?: string;
}

export interface RegionDef {
  id: string;
  name: string;
  blurb: string;
  issues: IssueDef[];
}

const files = import.meta.glob('./regions/*.json', { eager: true, import: 'default' }) as Record<string, RegionDef>;

export const WORLD_ORDER = ['latin-america', 'africa', 'middle-east-central-asia', 'south-asia', 'east-southeast-asia', 'oceania', 'europe', 'north-america', 'polar-high-seas', 'global-fronts'];

/** Regions in world order; regions not yet written are simply absent. */
export const REGIONS: RegionDef[] = WORLD_ORDER.flatMap((id) => {
  const r = Object.values(files).find((x) => x.id === id);
  return r ? [r] : [];
});

export const regionById = (id: string): RegionDef | undefined => REGIONS.find((r) => r.id === id);

/** A region's Tier 1 missions in play order: highest priority first. */
export const tierOne = (r: RegionDef): IssueDef[] => r.issues.filter((i) => i.tier === 1).sort(compareByPriority);
