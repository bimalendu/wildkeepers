import { maxLevel, perkById, nextCost } from '../sim/perks';
export const SAVE_VERSION = 3;
const KEY = 'wildkeepers:save';

export interface Settings {
  muted: boolean;
  haptics: boolean;
  /** 0 normal, 1 large, 2 largest */
  textSize: number;
  /** Draw a distinct symbol on every biome so colour is never the only cue. */
  patterns: boolean;
  reduceMotion: boolean;
}

export interface SaveData {
  version: number;
  /** Impact points earned from stars; spent at the Movement HQ. */
  impact: number;
  /** Best star rating per mission id (0 = not cleared). */
  stars: Record<string, number>;
  /** Movement HQ perks bought, by perk id. */
  perks: Record<string, number>;
  /** The player has been shown the rulebook once (it opens by itself before the first mission). */
  rulesSeen: boolean;
  /** Hope cards the player has been shown; they fill the Field Guide. */
  hopeSeen: string[];
  settings: Settings;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const defaultSettings = (reducedMotion = false): Settings => ({
  muted: false,
  haptics: true,
  textSize: 0,
  patterns: false,
  reduceMotion: reducedMotion,
});

export const defaultSave = (reducedMotion = false): SaveData => ({
  version: SAVE_VERSION,
  impact: 0,
  stars: {},
  perks: {},
  rulesSeen: false,
  hopeSeen: [],
  settings: defaultSettings(reducedMotion),
});

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const int = (v: unknown, fallback: number, min: number, max: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : fallback;
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

function intMap(v: unknown, max: number): Record<string, number> {
  const out: Record<string, number> = {};
  if (!isObj(v)) return out;
  for (const [k, n] of Object.entries(v)) {
    if (/^[a-z0-9-]{1,64}$/.test(k)) out[k] = int(n, 0, 0, max);
  }
  return out;
}

/**
 * Turns whatever was in storage into a valid SaveData: anything missing, out of range or of the wrong type falls back
 * to its default, so a corrupt or hand-edited save can never crash the game. MIGRATIONS[n] upgrades version n to n + 1.
 */
export function migrate(raw: unknown, reducedMotion = false): SaveData {
  const out = defaultSave(reducedMotion);
  let data: Record<string, unknown> = isObj(raw) ? raw : {};
  let version = int(data.version, 0, 0, 1_000_000);
  while (version < SAVE_VERSION) {
    data = MIGRATIONS[version](data);
    version++;
  }
  out.impact = int(data.impact, 0, 0, 9_999_999);
  out.stars = intMap(data.stars, 3);
  out.perks = {};
  for (const [id, n] of Object.entries(intMap(data.perks, 9))) {
    const perk = perkById(id);
    if (perk && n > 0) out.perks[id] = Math.min(n, maxLevel(perk)); // a hand-edited save cannot go past the top level
  }
  out.rulesSeen = bool(data.rulesSeen, false);
  out.hopeSeen = Array.isArray(data.hopeSeen) ? data.hopeSeen.filter((v): v is string => typeof v === 'string' && /^[a-z0-9-]{1,64}$/.test(v)).slice(0, 64) : [];
  const s = isObj(data.settings) ? data.settings : {};
  const d = out.settings;
  out.settings = {
    muted: bool(s.muted, d.muted),
    haptics: bool(s.haptics, d.haptics),
    textSize: int(s.textSize, d.textSize, 0, 2),
    patterns: bool(s.patterns, d.patterns),
    reduceMotion: bool(s.reduceMotion, d.reduceMotion),
  };
  out.version = SAVE_VERSION;
  return out;
}

const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  // v0 -> v1: there was no save file before.
  0: (d) => d,
  // v1 -> v2: Rules v2 changed how stars are earned, so old stars no longer mean anything. Impact and settings stay.
  1: (d) => ({ ...d, stars: {} }),
  // v2 -> v3: the Field Guide remembers which Hope cards were shown.
  2: (d) => ({ ...d, hopeSeen: [] }),
};

/** Persists the save in localStorage (or any StorageLike). Writes tolerate storage being unavailable. */
export class SaveStore {
  data: SaveData;

  constructor(
    private readonly storage: StorageLike | null,
    reducedMotion = false,
  ) {
    let raw: unknown;
    try {
      raw = JSON.parse(storage?.getItem(KEY) ?? 'null');
    } catch {
      raw = null; // corrupt JSON: start fresh rather than crash
    }
    this.data = migrate(raw, reducedMotion);
  }

  update(change: (data: SaveData) => void): void {
    change(this.data);
    this.save();
  }

  save(): void {
    try {
      this.storage?.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // storage full or blocked (private mode): progress lasts for this session only
    }
  }

  get settings(): Settings {
    return this.data.settings;
  }

  starsFor(id: string): number {
    return this.data.stars[id] ?? 0;
  }

  /** Records a finished mission; keeps the best stars. Returns the Impact earned (only for improvements). */
  recordMission(id: string, stars: number): number {
    const before = this.starsFor(id);
    if (stars <= before) return 0;
    const gained = (stars - before) * 10;
    this.update((d) => {
      d.stars[id] = stars;
      d.impact += gained;
    });
    return gained;
  }

  perkLevel(id: string): number {
    return this.data.perks[id] ?? 0;
  }

  /** Buys the next level of a perk if there is one and Impact covers it. Returns whether it was bought. */
  buyPerk(id: string): boolean {
    const perk = perkById(id);
    if (!perk) return false;
    const level = this.perkLevel(id);
    const cost = level < maxLevel(perk) ? nextCost(perk, level) : null;
    if (cost === null || this.data.impact < cost) return false;
    this.update((d) => {
      d.impact -= cost;
      d.perks[id] = level + 1;
    });
    return true;
  }

  /** Remembers that a Hope card was shown. */
  seeHope(id: string): void {
    if (this.data.hopeSeen.includes(id)) return;
    this.update((d) => void d.hopeSeen.push(id));
  }
}
