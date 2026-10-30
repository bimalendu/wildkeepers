import Phaser from 'phaser';
import { RULEBOOK } from '../sim/rules';
import { COLORS, background, button, getSave, label, panel, relayoutOnResize, footer } from './kit';

/** The whole rulebook on one screen. Opens by itself before the first mission, and from the Menu and the Mission screen. */
export class HowToPlayScene extends Phaser.Scene {
  private next = 'Menu';
  private nextData: object | undefined;
  private missionStart = false;

  constructor() {
    super('HowToPlay');
  }

  init(data: { next?: string; nextData?: object; missionStart?: boolean }): void {
    this.next = data.next ?? this.next;
    this.nextData = data.nextData ?? this.nextData;
    this.missionStart = data.missionStart ?? false;
  }

  create(): void {
    background(this);
    relayoutOnResize(this, { next: this.next, nextData: this.nextData, missionStart: this.missionStart });
    getSave(this).update((d) => (d.rulesSeen = true));
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;
    label(this, x, 16, 'How to play', { size: 28, bold: true, color: COLORS.good });
    const body = label(this, x + 16, 74, RULEBOOK.map((l, i) => `${i + 1}.  ${l}`).join('\n\n'), { size: 16, width: w - 32 });
    panel(this, x, 62, w, body.height + 28);
    body.setDepth(1);
    footer(this, 62 + body.height + 44, (by) => [
      button(this, x + w - 220, by, 220, 48, this.missionStart ? 'Start the mission' : 'Got it', () => this.scene.start(this.next, this.nextData), { size: 17, fill: 0x2f8f5f }),
    ]);
  }
}
