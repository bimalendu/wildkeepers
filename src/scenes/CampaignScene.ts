import Phaser from 'phaser';
import { PROLOGUE } from '../levels';
import { run } from './run';
import { COLORS, background, button, getSave, label, panel, relayoutOnResize } from './kit';

/** Whether a mission is open: the first of its region always is; the rest unlock in order as the one before is cleared. */
export function isUnlocked(stars: (id: string) => number, missions: { id: string; region: string }[], index: number): boolean {
  if (index === 0) return true;
  const prev = missions[index - 1];
  return stars(prev.id) > 0;
}

export class CampaignScene extends Phaser.Scene {
  constructor() {
    super('Campaign');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const save = getSave(this);
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;
    label(this, x, 16, 'Prologue', { size: 28, bold: true });
    label(this, x + w, 22, `Impact ${save.data.impact}`, { size: 16, origin: [1, 0], color: COLORS.accent });
    button(this, x, 62, 90, 38, 'Back', () => this.scene.start('WorldMap'), { size: 14 });

    run.back = { scene: 'Campaign' };
    const list = PROLOGUE;
    list.forEach((m, i) => {
      const y = 116 + i * 98;
      const open = isUnlocked((id) => save.starsFor(id), list, i);
      panel(this, x, y, w, 88, open ? COLORS.panel : 0x13261d);
      const stars = save.starsFor(m.id);
      label(this, x + 14, y + 10, m.title, { size: 17, bold: true, color: open ? COLORS.ink : COLORS.dim, width: w - 170 });
      label(this, x + 14, y + 36, open ? m.blurb : 'Clear the previous mission to unlock.', { size: 13, color: COLORS.dim, width: w - 170 });
      label(this, x + w - 14, y + 10, '★'.repeat(stars) + '☆'.repeat(3 - stars), { size: 20, origin: [1, 0], color: COLORS.accent });
      button(this, x + w - 112, y + 44, 98, 36, open ? (stars ? 'Replay' : 'Start') : 'Locked', () => {
        this.scene.start('Briefing', { missionId: m.id });
      }, { size: 14, enabled: open, fill: 0x2f8f5f });
    });
  }
}
