import type { IpbesDriver } from '../../src/data/frameworks';
import type { FactCard } from '../../src/data/regions';
import type { PriorityInputs } from '../../src/sim/priority';
import type { Theme } from '../../src/sim/types';
import type { MissionSpec } from '../archetypes';

export interface Tier1Spec {
  mission: MissionSpec;
  driver: IpbesDriver;
  priority: PriorityInputs;
  drivers: { name: string; catalogue?: number[] }[];
  sites: string[];
  fact: FactCard;
}

export interface Tier2Spec {
  id: string;
  title: string;
  theme: Theme;
  driver: IpbesDriver;
  priority: PriorityInputs;
  catalogue: number[];
  drivers: { name: string; catalogue?: number[] }[];
  sites: string[];
}

export interface RegionSpec {
  id: string;
  code: string;
  name: string;
  blurb: string;
  tier1: Tier1Spec[];
  tier2: Tier2Spec[];
}
