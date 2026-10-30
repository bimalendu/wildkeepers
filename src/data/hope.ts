import cards from './hope-cards.json';

export interface HopeCard {
  id: string;
  title: string;
  text: string;
  /** What made the recovery happen. */
  cause: string;
  source: string;
  url: string;
  checked: string;
  verified: boolean;
  /** A second independent source, when the card rests on two secondary sources. */
  also?: { source: string; url: string }[];
}

export const HOPE_CARDS = cards as HopeCard[];
