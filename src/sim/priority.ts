import { IPBES_DRIVERS, type IpbesDriver } from '../data/frameworks';

/** Each rated 1 (low) to 5 (extreme). */
export interface PriorityInputs {
  severity: number;
  urgency: number;
  irreversibility: number;
  reach: number;
}

export type Badge = 'Critical' | 'High' | 'Elevated';

/** priority = 0.35·severity + 0.30·urgency + 0.20·irreversibility + 0.15·reach, in 1..5. */
export function priorityScore(p: PriorityInputs): number {
  return 0.35 * p.severity + 0.3 * p.urgency + 0.2 * p.irreversibility + 0.15 * p.reach;
}

export function badge(score: number): Badge {
  return score >= 4.2 ? 'Critical' : score >= 3.4 ? 'High' : 'Elevated';
}

/** Highest priority first; ties go to the larger IPBES driver (land and sea use before invasives), then by id. */
export function compareByPriority<T extends { id: string; priority: PriorityInputs; driver: IpbesDriver }>(a: T, b: T): number {
  const d = priorityScore(b.priority) - priorityScore(a.priority);
  if (Math.abs(d) > 1e-9) return d;
  const r = IPBES_DRIVERS[a.driver].rank - IPBES_DRIVERS[b.driver].rank;
  return r !== 0 ? r : a.id.localeCompare(b.id);
}

/** How much faster a threat spreads in a higher-priority mission: 1.0 at priority 3, up to about 1.4 at priority 5. */
export function crisisClock(score: number): number {
  return Math.max(0.8, 1 + (score - 3) * 0.2);
}
