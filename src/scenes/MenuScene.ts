import Phaser from 'phaser';
import { COLORS, background, button, enableScroll, label, relayoutOnResize } from './kit';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const top = Math.max(24, H * 0.12);
    const title = label(this, cx, top, 'Wildkeepers', { size: 44, bold: true, origin: [0.5, 0], color: COLORS.good });
    while (title.width > W - 24 && title.style.fontSize !== '12px') title.setFontSize(parseInt(String(title.style.fontSize), 10) - 2); // large text must still fit
    const sub = label(this, cx, title.y + title.height + 8, 'Lead activist campaigns to restore\necosystems in every region of the world.', { size: 18, origin: [0.5, 0], align: 'center', color: COLORS.dim, width: Math.min(560, W - 32) });
    const bw = Math.min(320, W - 48);
    const y0 = sub.y + sub.height + 24;
    button(this, cx - bw / 2, y0, bw, 56, 'Play', () => this.scene.start('WorldMap'), { size: 22, fill: 0x2f8f5f });
    button(this, cx - bw / 2, y0 + 68, bw, 48, 'Movement HQ', () => this.scene.start('HQ'), { size: 17 });
    button(this, cx - bw / 2, y0 + 128, bw, 48, 'Field Guide', () => this.scene.start('FieldGuide'), { size: 17 });
    button(this, cx - bw / 2, y0 + 188, bw, 48, 'How to play', () => this.scene.start('HowToPlay', { next: 'Menu' }), { size: 17 });
    button(this, cx - bw / 2, y0 + 248, bw, 48, 'Settings', () => this.scene.start('Settings'), { size: 17 });
    button(this, cx - bw / 2, y0 + 308, bw, 48, 'Credits & sources', () => this.scene.start('Credits'), { size: 17 });
    enableScroll(this, y0 + 308 + 48 + 24);
  }
}
