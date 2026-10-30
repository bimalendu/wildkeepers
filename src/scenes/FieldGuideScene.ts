import Phaser from 'phaser';
import { HOPE_CARDS as hope } from '../data/hope';
import { REGIONS, sourceLine, tierOne } from '../data/regions';
import { missionById } from '../levels';
import { BIOME_NAME, COLORS, background, button, enableScroll, getSave, label, panel, pin, relayoutOnResize } from './kit';

/** The Field Guide: what you have learned. Clearing a mission unlocks its page; Hope cards unlock when they are shown to you. */
export class FieldGuideScene extends Phaser.Scene {
  constructor() {
    super('FieldGuide');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const save = getSave(this);
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;

    const pages = REGIONS.flatMap((r) => tierOne(r).map((issue) => ({ region: r.name, issue })));
    const unlocked = pages.filter((p) => save.starsFor(p.issue.mission!) > 0).length;
    const hdr = panel(this, 0, 0, W, 64, COLORS.panel);
    const title = label(this, x, 8, 'Field Guide', { size: 22, bold: true });
    const count = label(this, x, 38, `${unlocked} of ${pages.length} pages · ${save.data.hopeSeen.length} of ${hope.length} Hope cards`, { size: 14, color: COLORS.accent });
    const back = button(this, x + w - 90, 12, 90, 40, 'Menu', () => this.scene.start('Menu'), { size: 14 });
    [hdr, title, count, back.container].forEach(pin);

    let y = 76;
    label(this, x, y, 'HOPE: RECOVERIES THAT WORKED', { size: 13, color: COLORS.dim, bold: true });
    y += 26;
    for (const card of hope) {
      const seen = save.data.hopeSeen.includes(card.id);
      const text = seen ? `${card.text}\nWhat worked: ${card.cause}\n${sourceLine(card)} (checked ${card.checked})` : 'Finish a mission to find this one.';
      const t = label(this, x + 14, y + 40, text, { size: 13, color: seen ? COLORS.ink : COLORS.dim, width: w - 28 });
      panel(this, x, y, w, t.height + 52, seen ? COLORS.panel : 0x13261d);
      t.setDepth(1);
      label(this, x + 14, y + 10, seen ? card.title : '???', { size: 16, bold: true, color: seen ? COLORS.good : COLORS.dim, width: w - 28 }).setDepth(1);
      y += t.height + 62;
    }

    y += 6;
    label(this, x, y, 'MISSION PAGES', { size: 13, color: COLORS.dim, bold: true });
    y += 26;
    for (const { region, issue } of pages) {
      const open = save.starsFor(issue.mission!) > 0;
      const m = missionById(issue.mission!);
      const species = m ? m.species.map((s) => `${s.name} (${s.habitat.map((h) => BIOME_NAME[h].toLowerCase()).join(', ')})`).join('; ') : '';
      const lines = open
        ? [`${region}`, species ? `Species: ${species}` : '', issue.fact ? `${issue.fact.text}\n${sourceLine(issue.fact)} (checked ${issue.fact.checked})` : '', issue.realWorld ? `You can: ${issue.realWorld}` : ''].filter(Boolean).join('\n\n')
        : `${region}\n\nClear this mission to unlock its page.`;
      const t = label(this, x + 14, y + 40, lines, { size: 13, color: open ? COLORS.ink : COLORS.dim, width: w - 28 });
      panel(this, x, y, w, t.height + 52, open ? COLORS.panel : 0x13261d);
      t.setDepth(1);
      label(this, x + 14, y + 10, open ? issue.title : `${issue.title} (locked)`, { size: 16, bold: true, color: open ? COLORS.ink : COLORS.dim, width: w - 28 }).setDepth(1);
      y += t.height + 62;
    }
    enableScroll(this, y + 16);
  }
}
