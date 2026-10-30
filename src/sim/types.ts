export type Biome =
  | 'forest' | 'grass' | 'wetland' | 'river' | 'lake' | 'reef' | 'ocean' | 'mangrove' | 'seagrass' | 'kelp'
  | 'ice' | 'farm' | 'town' | 'mine' | 'road' | 'tundra' | 'desert';

/** Biomes that are people-made and do not count toward ecosystem health. */
export const BUILT: readonly Biome[] = ['farm', 'town', 'mine', 'road'];
export const isBuilt = (b: Biome): boolean => BUILT.includes(b);
export const WATER: readonly Biome[] = ['river', 'lake', 'ocean', 'reef', 'seagrass', 'kelp'];

/** Flavour of a threat: picks the icon and the text. The rule it follows is its `behaviour`. */
export type ThreatKind =
  | 'frontier' | 'plume' | 'fire' | 'invasive' | 'poaching' | 'heat' | 'accumulation' | 'disease' | 'field' | 'network' | 'thaw';

/** The four rules a threat can follow (Rules v2). */
export type Behaviour = 'spread' | 'flow' | 'hunt' | 'strike';

export const BEHAVIOUR_OF_KIND: Record<ThreatKind, Behaviour> = {
  frontier: 'spread', invasive: 'spread', fire: 'spread', network: 'spread', thaw: 'spread',
  plume: 'flow', accumulation: 'flow',
  poaching: 'hunt', disease: 'hunt',
  heat: 'strike', field: 'strike',
};

export type Theme = 'land' | 'freshwater' | 'ocean' | 'wildlife' | 'plants' | 'climate' | 'pollution' | 'deepsea';

/** 0 Lost, 1 Damaged, 2 Healthy. */
export type Health = 0 | 1 | 2;

export interface ThreatDef {
  id: string;
  kind: ThreatKind;
  behaviour: Behaviour;
  label: string;
  /** Spread: tiles grown per turn. Flow: tiles moved. Hunt: steps per hunter. Strike: tiles hit. Campaign lowers it by 1. */
  strength: number;
  /** Acts every N turns (1 = every turn). */
  every?: number;
  /** First turn it acts. Defaults to 1. */
  start?: number;
  /** Biomes it can hit. Defaults depend on the kind. */
  targets?: Biome[];
  /** Flow / fire direction (0..5). */
  dir?: number;
  /** Spread markers burn out after this many turns (fire). */
  lifetime?: number;
  /** Where its sources sit: the 'pressure' side of the map, a 'river', the map 'edge', anywhere, or on a 'species'. */
  from?: 'pressure' | 'river' | 'edge' | 'random' | 'species';
  /** Number of source tiles (for Hunt: number of hunters). */
  sources?: number;
  /** Species ids a hunter goes after. Defaults to every species. */
  hurts?: string[];
  /** Catalogue ids this driver represents. */
  catalogue?: number[];
}

export interface SpeciesDef {
  id: string;
  name: string;
  /** Biomes it lives in. */
  habitat: Biome[];
  /** Healthy habitat tiles it needs. Fewer than this and it loses a heart each turn. */
  need: number;
  /** How many 🐾 home tiles it has (the places hunters head for). Default 2. */
  homes?: number;
  /** Status line for the Field Guide (verified against IUCN at content time). */
  status?: string;
}

export const ACTION_IDS = ['restore', 'defend', 'remove', 'protect', 'campaign'] as const;
export type ActionId = (typeof ACTION_IDS)[number];

export interface EventCard {
  id: string;
  title: string;
  text: string;
  turn?: number;
  effect:
    | { kind: 'energy'; amount: number }
    | { kind: 'surge'; threat: string; amount: number };
}

export type MapTemplate = {
  base: Biome;
  accent?: Biome;
  accentAmount?: number;
  /** Built/pressure biomes laid along one edge. */
  pressure?: Biome[];
  side?: 'n' | 's' | 'e' | 'w';
  river?: boolean;
  /** How far the damage reaches inward from the pressure side. */
  depth?: number;
};

export interface MissionDef {
  id: string;
  title: string;
  /** One line shown on the map card. */
  blurb: string;
  region: string;
  theme: Theme;
  /** Issue id in the region tree this mission belongs to. */
  issue: string;
  /** Catalogue ids this mission covers. */
  catalogue: number[];
  size: [number, number];
  seed: number;
  /** Turns to survive. */
  turns: number;
  /** Energy per turn. */
  energy: number;
  /** The ecosystem bar must stay at or above this (0..1). */
  floor: number;
  map: MapTemplate;
  threats: ThreatDef[];
  species: SpeciesDef[];
  /** Number of risky ⚠ tiles (they cost +1 Energy to act on). */
  risky?: number;
  events?: EventCard[];
  /** Per-mission flavour names for the five actions, e.g. { restore: 'Replant' }. */
  labels?: Partial<Record<ActionId, string>>;
  /** One concrete, lawful step the player can take in real life (shown on the Results screen). */
  realWorld?: string;
  /** Tutorial prompts shown in order (Prologue only). */
  hints?: string[];
  /** Actions this mission lets the player use (default: all five). */
  actions?: ActionId[];
  /** Hope mission: starts nearly healed (no do-nothing loss check). */
  hope?: boolean;
}

export interface Tile {
  biome: Biome;
  health: Health;
  /** Safe from Spread, Flow and Hunt for good (not from Strike). */
  protected: boolean;
  /** Safe from everything, this turn only. */
  defended: boolean;
  /** Risky for activists: acting here costs +1 Energy. */
  risky: boolean;
  /** The threat whose body is on this tile (a spread trail, a plume, a hunter), if any. */
  threat: string | null;
  /** Turns the marker has been there. */
  age: number;
}

export interface SpeciesState {
  def: SpeciesDef;
  hearts: number;
  extinct: boolean;
  /** 🐾 tiles hunters head for. */
  homes: number[];
  /** Healthy habitat tiles right now. */
  healthy: number;
}

/** One announced move of a threat. `from` is where the arrow starts (-1 for a strike with no origin). */
export interface PlanItem {
  from: number;
  /** Tiles it will hit, in order. A hunter's path ends where it stops. */
  path: number[];
  /** Turns until it happens. 0 = at the end of this turn. Only Strike waits. */
  eta: number;
}

export type Outcome = 'playing' | 'won' | 'lost';
export type LoseReason = 'extinction' | 'collapse' | null;

export interface GameState {
  mission: MissionDef;
  turn: number;
  tiles: Tile[];
  species: SpeciesState[];
  /** Current strength per threat (Campaign lowers it; 0 = stopped). */
  strength: Record<string, number>;
  /** Extra strength this turn from an event card. */
  surge: Record<string, number>;
  /** Threat sources: tile indices where each threat originates. */
  sources: Record<string, number[]>;
  energy: number;
  /** What every threat will do at the end of this turn. The arrows on the map. */
  plan: Record<string, PlanItem[]>;
  startEco: number;
  /** Movement HQ perk levels this run was started with. */
  perks: Record<string, number>;
  /** Free uses left per action id this mission (Seed bank, Rapid response). */
  free: Record<string, number>;
  outcome: Outcome;
  loseReason: LoseReason;
  /** The event card drawn at the start of this turn, if any. */
  event: EventCard | null;
  log: string[];
  rngState: number;
  stats: { actionsTaken: number };
}
