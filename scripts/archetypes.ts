// Mission archetypes: a spec (names, labels, facts) plus a rank (0 = highest priority, hardest to leave) becomes a
// base mission. gen-missions.ts then tunes the levers (strength, sources, energy, turns, floor) and sets species needs.
import type { ActionId, Biome, EventCard, MapTemplate, MissionDef, SpeciesDef, Theme, ThreatDef } from '../src/sim/types';

export type Arch = 'frontier' | 'plume' | 'fishing' | 'disease' | 'logging' | 'fire' | 'poison' | 'mining' | 'heat' | 'thaw' | 'network';

export interface MissionSpec {
  id: string;
  title: string;
  blurb: string;
  theme: Theme;
  arch: Arch;
  catalogue: number[];
  /** Threat labels, in the order the archetype defines them. */
  threats: string[];
  species: { id: string; name: string; habitat?: Biome[] }[];
  /** Overrides for the map template. */
  map?: Partial<MapTemplate>;
  /** Tiles the poison archetype's threats can hit; defaults to river, lake and wetland. */
  targets?: Biome[];
  /** Overrides for the action names the archetype picks (flavour only), e.g. "Ranger patrol" for Defend. */
  labels?: Partial<Record<ActionId, string>>;
  /** A hope mission: a real recovery. It starts healthy, is short, and does not need to be a loss when idle. */
  hope?: boolean;
  realWorld: string;
}

type Labels = Record<ActionId, string>;
const LABELS: Record<Arch, Labels> = {
  frontier: { restore: 'Replant', defend: 'Patrol', remove: 'Clear the road', protect: 'Land title', campaign: 'Supply-chain campaign' },
  plume: { restore: 'Rewet', defend: 'Booms', remove: 'Clean up', protect: 'Buffer strip', campaign: 'Ban the discharge' },
  fishing: { restore: 'Regrow coral', defend: 'Patrol boats', remove: 'Haul nets', protect: 'Marine reserve', campaign: 'Fishing-rules campaign' },
  disease: { restore: 'Replant', defend: 'Quarantine', remove: 'Contain outbreak', protect: 'Reserve', campaign: 'Rescue colony and research' },
  logging: { restore: 'Replant', defend: 'Patrol', remove: 'Block the road', protect: 'Community forest', campaign: 'Timber-certification campaign' },
  fire: { restore: 'Replant', defend: 'Firebreak', remove: 'Put out fire', protect: 'Protected area', campaign: 'Fire-safety campaign' },
  poison: { restore: 'Rewet', defend: 'Booms', remove: 'Clean up', protect: 'Buffer strip', campaign: 'Ban the pesticide' },
  mining: { restore: 'Replant', defend: 'Patrol', remove: 'Clean up', protect: 'Indigenous land title', campaign: 'Ban mercury in mining' },
  network: { restore: 'Restore a sink', defend: 'Customs checks', remove: 'Shut a route', protect: 'Protected area', campaign: 'Treaty campaign' },
  thaw: { restore: 'Recover habitat', defend: 'Insulate', remove: 'Drain a meltwater pond', protect: 'Protected area', campaign: 'Emissions campaign' },
  heat: { restore: 'Regrow coral', defend: 'Shade and cool', remove: 'Control an outbreak', protect: 'Marine park', campaign: 'Climate-action campaign' },
};

interface Built {
  map: MapTemplate;
  threats: ThreatDef[];
  species: SpeciesDef[];
  events?: EventCard[];
  risky?: number;
}

export function build(spec: MissionSpec, rank: number, region: string, issue: string, seed: number): MissionDef {
  const L = spec.threats;
  const sp = (i: number, hab: Biome[], homes = 2): SpeciesDef => ({
    id: spec.species[i].id,
    name: spec.species[i].name,
    habitat: spec.species[i].habitat ?? hab,
    need: 1, // set by the generator from the number of Healthy tiles the map starts with
    homes,
  });
  const tail = Math.floor(rank / 3); // later missions: a little more pressure
  let b: Built;
  switch (spec.arch) {
    case 'frontier':
      b = {
        map: { base: 'forest', pressure: ['farm', 'road'], side: 'n', depth: 6 },
        threats: [
          { id: 'frontier', kind: 'frontier', behaviour: 'spread', label: L[0], strength: 2 + tail, from: 'pressure', sources: 3 },
          { id: 'access', kind: 'frontier', behaviour: 'spread', label: L[1], strength: 1, every: 2, from: 'pressure', sources: 2 },
        ],
        species: [sp(0, ['forest'])],
      };
      break;
    case 'plume': {
      // a plume can also drift through open water (ghost nets): the spec then gives an ocean map
      const sea = spec.map?.base === 'ocean';
      b = {
        map: { base: 'wetland', accent: 'forest', accentAmount: 0.3, pressure: ['town', 'mine'], side: 'n', river: true, depth: 4 },
        threats: [{ id: 'plume', kind: 'plume', behaviour: 'flow', label: L[0], strength: 2 + tail, from: sea ? 'edge' : 'river', sources: 1, dir: 5, targets: sea ? ['ocean', 'reef', 'seagrass', 'kelp'] : ['river', 'lake', 'wetland'] }],
        species: [sp(0, sea ? ['ocean', 'reef'] : ['river', 'wetland'])],
      };
      break;
    }
    case 'fishing':
      b = {
        map: { base: 'ocean', accent: 'reef', accentAmount: 0.35, pressure: ['town'], side: 's', depth: 3 },
        threats: [
          { id: 'fleet', kind: 'poaching', behaviour: 'hunt', label: L[0], strength: 2, from: 'edge', sources: 2 + (tail ? 1 : 0), hurts: [spec.species[0].id] },
          ...(L[1] ? [{ id: 'bycatch', kind: 'poaching' as const, behaviour: 'hunt' as const, label: L[1], strength: 1, every: 2, from: 'edge' as const, sources: 2, hurts: [spec.species[spec.species.length - 1].id] }] : []),
        ],
        species: spec.species.map((_, i) => sp(i, ['ocean', 'reef'])),
      };
      break;
    case 'disease':
      b = {
        map: { base: 'forest', accent: 'wetland', accentAmount: 0.3, pressure: ['farm'], side: 'n', river: true, depth: 4 },
        threats: [
          { id: 'disease', kind: 'disease', behaviour: 'hunt', label: L[0], strength: 2, every: 2, hurts: spec.species.map((s) => s.id), from: 'species', sources: 2 + (tail ? 1 : 0) },
          { id: 'clearing', kind: 'frontier', behaviour: 'spread', label: L[1], strength: 1, every: 2, from: 'pressure', sources: 2 },
        ],
        species: spec.species.map((_, i) => sp(i, ['forest', 'wetland', 'river'])),
      };
      break;
    case 'logging':
      b = {
        map: { base: 'forest', pressure: ['road', 'farm'], side: 'n', depth: 5 },
        threats: [
          { id: 'loggers', kind: 'poaching', behaviour: 'hunt', label: L[0], strength: 2, from: 'edge', sources: 2 + (tail ? 1 : 0), hurts: [spec.species[0].id] },
          { id: 'clearing', kind: 'frontier', behaviour: 'spread', label: L[1], strength: 1, from: 'pressure', sources: 3 },
        ],
        species: [sp(0, ['forest'])],
      };
      break;
    case 'fire':
      b = {
        map: { base: 'grass', accent: 'wetland', accentAmount: 0.25, pressure: ['farm', 'road'], side: 'w', depth: 4 },
        threats: [
          { id: 'fire', kind: 'fire', behaviour: 'spread', label: L[0], strength: 3, dir: 0, lifetime: 2, from: 'random' },
          { id: 'conversion', kind: 'frontier', behaviour: 'spread', label: L[1], strength: 1, from: 'pressure', sources: 2 },
        ],
        species: [sp(0, ['wetland', 'grass'])],
        events: [
          { id: 'dry1', turn: 3, title: 'A dry spell', text: 'Weeks without rain. The fire spreads one tile further this turn.', effect: { kind: 'surge', threat: 'fire', amount: 1 } },
          { id: 'dry2', turn: 7, title: 'Heat wave', text: 'Record temperatures dry out the vegetation again. The fire spreads one tile further this turn.', effect: { kind: 'surge', threat: 'fire', amount: 1 } },
        ],
      };
      break;
    case 'poison':
      b = {
        map: { base: 'wetland', accent: 'forest', accentAmount: 0.25, pressure: ['farm'], side: 'n', river: true, depth: 4 },
        threats: [
          { id: 'poison', kind: 'accumulation', behaviour: 'flow', label: L[0], strength: 2 + tail, from: 'pressure', sources: 2, targets: spec.targets ?? ['river', 'lake', 'wetland'] },
          { id: 'runoff', kind: 'plume', behaviour: 'flow', label: L[1], strength: 1, from: 'river', sources: 1, dir: 5, targets: spec.targets ?? ['river', 'lake', 'wetland'] },
        ],
        species: spec.species.map((_, i) => sp(i, ['wetland', 'river'])),
      };
      break;
    case 'heat':
      b = {
        map: { base: 'ocean', accent: 'reef', accentAmount: 0.4, pressure: ['town'], side: 's', depth: 3 },
        threats: [
          { id: 'heatwave', kind: 'heat', behaviour: 'strike', label: L[0], strength: 3 + tail, start: 3, every: 3, targets: ['reef', 'seagrass', 'kelp'] },
          { id: 'outbreak', kind: 'disease', behaviour: 'hunt', label: L[1], strength: 1, every: 2, from: 'species', sources: 2, hurts: spec.species.map((x) => x.id) },
        ],
        species: spec.species.map((_, i) => sp(i, ['ocean', 'reef'])),
      };
      break;
    case 'network':
      // trade routes carry the pressure; a second, hunting threat walks toward the species
      b = {
        map: spec.hope
          ? { base: 'wetland', accent: 'forest', accentAmount: 0.3, pressure: [], river: false }
          : { base: 'forest', accent: 'grass', accentAmount: 0.25, pressure: ['town', 'road', 'mine'], side: 'n', depth: 5 },
        threats: spec.hope
          ? [{ id: 'network', kind: 'network', behaviour: 'spread', label: L[0], strength: 2, from: 'random', sources: 2 }]
          : [
              { id: 'network', kind: 'network', behaviour: 'spread', label: L[0], strength: 2 + tail, from: 'pressure', sources: 3 },
              { id: 'demand', kind: 'poaching', behaviour: 'hunt', label: L[1], strength: 1, every: 2, from: 'edge', sources: 2 + (tail ? 1 : 0), hurts: [spec.species[0].id] },
            ],
        species: [sp(0, ['forest'])],
      };
      break;
    case 'thaw':
      // warming creeps in from the open-water edge and eats the ice or frozen ground
      b = {
        map: { base: 'ice', pressure: ['ocean'], side: 's', depth: 5 },
        threats: [
          { id: 'thaw', kind: 'thaw', behaviour: 'spread', label: L[0], strength: 2 + tail, from: 'pressure', sources: 3, targets: ['ice', 'tundra', 'wetland'] },
          { id: 'pulse', kind: 'thaw', behaviour: 'spread', label: L[1], strength: 1, every: 2, from: 'pressure', sources: 2, targets: ['ice', 'tundra', 'wetland'] },
        ],
        species: [sp(0, ['ice', 'tundra'])],
      };
      break;
    case 'mining':
      b = {
        map: { base: 'forest', pressure: ['mine', 'road'], side: 'n', river: true, depth: 5 },
        threats: [
          { id: 'claims', kind: 'frontier', behaviour: 'spread', label: L[0], strength: 2 + tail, from: 'pressure', sources: 3 },
          { id: 'mercury', kind: 'accumulation', behaviour: 'flow', label: L[1], strength: 2, from: 'river', sources: 1, dir: 5, targets: ['river', 'lake', 'wetland'] },
        ],
        species: spec.species.map((_, i) => sp(i, ['forest', 'river'])),
        risky: 6,
      };
      break;
  }
  return {
    id: spec.id,
    title: spec.title,
    blurb: spec.blurb,
    region,
    theme: spec.theme,
    issue,
    catalogue: spec.catalogue,
    size: [8 + (rank >= 4 ? 1 : 0), 9 + (rank >= 2 ? 1 : 0)],
    seed,
    turns: spec.hope ? 8 : 12 + Math.floor(rank / 3),
    energy: spec.hope ? 4 : 3,
    floor: 0,
    map: { ...b.map, ...spec.map },
    threats: b.threats,
    species: b.species,
    events: b.events,
    risky: b.risky,
    hope: spec.hope || undefined,
    labels: { ...LABELS[spec.arch], ...spec.labels },
    realWorld: spec.realWorld,
  };
}
