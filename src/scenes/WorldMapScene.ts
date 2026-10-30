import Phaser from 'phaser';
import { REGIONS, WORLD_ORDER, tierOne, type RegionDef } from '../data/regions';
import { MISSIONS, PROLOGUE } from '../levels';
import { COLORS, background, button, enableScroll, getSave, label, panel, pin, relayoutOnResize } from './kit';
import { run } from './run';

const NAMES: Record<string, string> = {
  'latin-america': 'Latin America & Caribbean', africa: 'Africa', 'middle-east-central-asia': 'Middle East & Central Asia',
  'south-asia': 'South Asia', 'east-southeast-asia': 'East & Southeast Asia', oceania: 'Oceania', europe: 'Europe',
  'north-america': 'North America', 'polar-high-seas': 'Polar & High Seas', 'global-fronts': 'Global Fronts',
};

/** Stars won and available in a region's Tier 1 missions. */
export function regionProgress(r: RegionDef, stars: (id: string) => number): { won: number; cleared: number; total: number } {
  const ms = tierOne(r).map((i) => i.mission!);
  return { won: ms.reduce((a, id) => a + stars(id), 0), cleared: ms.filter((id) => stars(id) > 0).length, total: ms.length };
}

export const prologueDone = (stars: (id: string) => number): boolean => PROLOGUE.every((m) => stars(m.id) > 0);

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMap');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    run.back = { scene: 'WorldMap' };
    const save = getSave(this);
    const stars = (id: string) => save.starsFor(id);
    const W = this.scale.width;
    const w = Math.min(680, W - 24);
    const x = (W - w) / 2;
    let y = 76;

    const hdr = panel(this, 0, 0, W, 64, COLORS.panel);
    const title = label(this, x, 8, 'World campaign', { size: 22, bold: true });
    const impact = label(this, x, 38, `Impact ${save.data.impact}`, { size: 14, color: COLORS.accent });
    const back = button(this, x + w - 90, 12, 90, 40, 'Menu', () => this.scene.start('Menu'), { size: 14 });
    [hdr, title, impact, back.container].forEach(pin);

    const card = (name: string, sub: string, progress: string, open: boolean, tap: () => void) => {
      panel(this, x, y, w, 78, open ? COLORS.panel : 0x13261d);
      label(this, x + 14, y + 10, name, { size: 18, bold: true, color: open ? COLORS.ink : COLORS.dim, width: w - 150 });
      label(this, x + 14, y + 38, sub, { size: 13, color: COLORS.dim, width: w - 150 });
      label(this, x + w - 14, y + 12, progress, { size: 15, origin: [1, 0], color: COLORS.accent });
      button(this, x + w - 104, y + 36, 90, 34, open ? 'Open' : 'Locked', tap, { size: 14, enabled: open, fill: 0x2f8f5f });
      y += 88;
    };

    const pDone = prologueDone(stars);
    const pStars = PROLOGUE.reduce((a, m) => a + stars(m.id), 0);
    card('Prologue: first steps', 'Three short missions that teach the basics.', `${pStars}/${PROLOGUE.length * 3} ★`, true, () => this.scene.start('Campaign'));

    for (const id of WORLD_ORDER) {
      const region = REGIONS.find((r) => r.id === id);
      if (!region) {
        card(NAMES[id], 'Coming soon.', '', false, () => undefined);
        continue;
      }
      const p = regionProgress(region, stars);
      const first = region.blurb.split(/[.:]/)[0];
      const sub = pDone ? (first.length > 62 ? first.slice(0, 60) + '…' : first) : 'Finish the Prologue to open every region.';
      card(region.name, sub, `${p.won}/${p.total * 3} ★`, pDone, () => this.scene.start('IssueTree', { region: id }));
    }
    void MISSIONS;
    enableScroll(this, y + 16);
  }
}
