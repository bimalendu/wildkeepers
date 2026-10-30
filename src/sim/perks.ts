/** Movement HQ perks: small, fixed modifiers bought with Impact. None of them changes the rules or how stars are earned. */
export interface PerkDef {
  id: string;
  name: string;
  /** Impact price of each level, in order. */
  costs: number[];
  /** What the perk does at `level` (1-based). */
  effect: (level: number) => string;
}

export const PERKS: PerkDef[] = [
  { id: 'volunteers', name: 'Volunteers', costs: [30, 60], effect: (l) => `+${l}⚡ on the first turn of every mission` },
  { id: 'seedbank', name: 'Seed bank', costs: [30, 60], effect: (l) => (l === 1 ? 'Your first Restore in each mission is free' : 'Your first two Restores in each mission are free') },
  { id: 'rapid', name: 'Rapid response', costs: [30, 60], effect: (l) => (l === 1 ? 'Your first Defend in each mission is free' : 'Your first two Defends in each mission are free') },
  { id: 'legalaid', name: 'Legal aid', costs: [50], effect: () => 'Risky ⚠ tiles cost no extra Energy' },
];

export const perkById = (id: string): PerkDef | undefined => PERKS.find((p) => p.id === id);
export const maxLevel = (p: PerkDef): number => p.costs.length;

/** Impact the next level costs, or null when the perk is at its top level. */
export const nextCost = (p: PerkDef, level: number): number | null => p.costs[level] ?? null;

/** One line per perk the player has, for the Briefing. */
export function activePerks(levels: Record<string, number>): string[] {
  return PERKS.filter((p) => (levels[p.id] ?? 0) > 0).map((p) => `${p.name}: ${p.effect(Math.min(levels[p.id], maxLevel(p)))}`);
}
