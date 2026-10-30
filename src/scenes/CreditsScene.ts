import Phaser from 'phaser';
import { COLORS, background, button, footer, label, panel, relayoutOnResize } from './kit';

const TEXT = `Wildkeepers is a work in progress.

BUILT WITH
Phaser 3 (MIT), Vite, TypeScript.
Atkinson Hyperlegible font by the Braille Institute (SIL Open Font License).

ART
Hex tiles, buildings and trees: Hexagon Pack by Kenney (kenney.nl), CC0. Water, ice, coral, kelp and seagrass tiles are drawn in code.

SCIENCE FRAMEWORKS
IPBES Global Assessment (2019): the five direct drivers of biodiversity loss.
Stockholm Resilience Centre / PIK: the planetary boundaries and the 2025 Planetary Health Check.
IUCN Red List: species status. Statuses are re-checked against the Red List when each region is written.

Hope cards and Real-World Actions are summaries for orientation, not advice. Check local laws and trusted conservation groups before acting.`;

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('Credits');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;
    label(this, x, 16, 'Credits & sources', { size: 28, bold: true });
    const body = label(this, x + 16, 74, TEXT, { size: 15, width: w - 32, color: COLORS.ink });
    panel(this, x, 62, w, body.height + 28);
    body.setDepth(1);
    footer(this, 62 + body.height + 44, (by) => [button(this, x, by, 140, 46, 'Back', () => this.scene.start('Menu'), { size: 16 })]);
  }
}
