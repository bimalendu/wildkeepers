import type { ThreatKind } from '../sim/types';

export const THREAT_NAME: Record<ThreatKind, string> = {
  frontier: 'advancing frontier',
  plume: 'pollution plume',
  fire: 'wildfire',
  invasive: 'invasive species',
  poaching: 'poaching',
  heat: 'heat event',
  accumulation: 'accumulating poison',
  disease: 'wildlife disease',
  field: 'light / noise field',
  network: 'trade network',
  thaw: 'spreading thaw',
};
