import { readFileSync } from 'node:fs';

export interface LedgerSource {
  url: string;
  kind: 'primary' | 'secondary';
  /** How the page was opened: the live site, a DOI, PubMed Central or a Wayback snapshot. */
  via: 'live' | 'doi' | 'pmc' | 'wayback';
  /** A short passage from the page that supports the claim. */
  quote: string;
}

export interface LedgerClaim {
  claim: string;
  sources: LedgerSource[];
  ok: boolean;
  /** 'single' lets one source of any kind carry the claim. Only species habitat claims may use it, for want of an openable second source. */
  bar?: 'single';
}

export interface LedgerEntry {
  id: string;
  /** What the game displayed when this was checked (the new text, for a fix). */
  text: string;
  verdict: 'pass' | 'fix' | 'drop';
  claims: LedgerClaim[];
  /** Set instead of `claims` for text that makes no checkable factual statement (advice, framing); `notes` says why. */
  claimless?: boolean;
  /** For a fix or drop: the old text and why it changed. */
  notes?: string;
  checked: string;
}

export interface Ledger {
  /** Set once every item has been checked; until then the coverage test only reports what is left. */
  complete: boolean;
  entries: LedgerEntry[];
}

export const LEDGER_PATH = new URL('./ledger.json', import.meta.url);

export const loadLedger = (): Ledger => JSON.parse(readFileSync(LEDGER_PATH, 'utf8')) as Ledger;

export const host = (url: string): string => new URL(url).hostname.replace(/^www\./, '');

/** The source bar: one primary source, or two secondary sources on different sites. */
export const meetsSourceBar = (sources: LedgerSource[]): boolean =>
  sources.some((s) => s.kind === 'primary') || new Set(sources.filter((s) => s.kind === 'secondary').map((s) => host(s.url))).size >= 2;
