import Phaser from 'phaser';
import { PERKS, maxLevel, nextCost } from '../sim/perks';
import { COLORS, background, button, enableScroll, getSave, label, panel, pin, relayoutOnResize } from './kit';

/** The Movement HQ: spend Impact (10 per star) on small, permanent perks. */
export class HQScene extends Phaser.Scene {
  constructor() {
    super('HQ');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const save = getSave(this);
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;

    const hdr = panel(this, 0, 0, W, 64, COLORS.panel);
    const title = label(this, x, 8, 'Movement HQ', { size: 22, bold: true });
    const impact = label(this, x, 38, `Impact ${save.data.impact}  ·  10 for every ★ you win`, { size: 14, color: COLORS.accent });
    const back = button(this, x + w - 90, 12, 90, 40, 'Menu', () => this.scene.start('Menu'), { size: 14 });
    [hdr, title, impact, back.container].forEach(pin);

    let y = 76;
    const intro = label(this, x, y, 'Your movement grows with every campaign. Perks are small and permanent, and they never change how stars are earned.', { size: 14, color: COLORS.dim, width: w });
    y += intro.height + 14;

    for (const perk of PERKS) {
      const level = save.perkLevel(perk.id);
      const top = level >= maxLevel(perk);
      const cost = nextCost(perk, level);
      panel(this, x, y, w, 124);
      label(this, x + 14, y + 10, perk.name, { size: 18, bold: true, width: w - 130 });
      label(this, x + w - 14, y + 12, '●'.repeat(level) + '○'.repeat(maxLevel(perk) - level), { size: 16, origin: [1, 0], color: COLORS.accent });
      const now = level > 0 ? `Now: ${perk.effect(level)}` : 'Not bought yet';
      const next = top ? 'Top level reached.' : `Next: ${perk.effect(level + 1)}`;
      label(this, x + 14, y + 38, `${now}\n${next}`, { size: 13, color: COLORS.dim, width: w - 28 });
      const can = cost !== null && save.data.impact >= cost;
      button(
        this, x + 14, y + 78, w - 28, 36,
        top ? 'Maxed' : can ? `Buy for ${cost} Impact` : `Needs ${cost} Impact`,
        () => {
          if (save.buyPerk(perk.id)) this.scene.restart();
        },
        { size: 14, enabled: can, fill: 0x2f8f5f },
      );
      y += 134;
    }
    enableScroll(this, y + 16);
  }
}
