import Phaser from 'phaser';
import { COLORS, TEXT_SCALE, background, enableScroll, button, getSave, label, relayoutOnResize } from './kit';

const SIZE_NAME = ['Normal', 'Large', 'Largest'];

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create(): void {
    background(this);
    relayoutOnResize(this);
    const save = getSave(this);
    const W = this.scale.width;
    const w = Math.min(520, W - 24);
    const x = (W - w) / 2;
    label(this, x, 16, 'Settings', { size: 28, bold: true });
    const rows: { name: () => string; tap: () => void }[] = [
      { name: () => `Text size: ${SIZE_NAME[save.settings.textSize]}`, tap: () => save.update((d) => (d.settings.textSize = (d.settings.textSize + 1) % TEXT_SCALE.length)) },
      { name: () => `Biome symbols: ${save.settings.patterns ? 'On' : 'Off'}`, tap: () => save.update((d) => (d.settings.patterns = !d.settings.patterns)) },
      { name: () => `Reduce motion: ${save.settings.reduceMotion ? 'On' : 'Off'}`, tap: () => save.update((d) => (d.settings.reduceMotion = !d.settings.reduceMotion)) },
      { name: () => `Sound: ${save.settings.muted ? 'Off' : 'On'}`, tap: () => save.update((d) => (d.settings.muted = !d.settings.muted)) },
      { name: () => `Vibration: ${save.settings.haptics ? 'On' : 'Off'}`, tap: () => save.update((d) => (d.settings.haptics = !d.settings.haptics)) },
    ];
    rows.forEach((r, i) => {
      button(this, x, 70 + i * 62, w, 52, r.name(), () => {
        r.tap();
        this.scene.restart();
      }, { size: 17, align: 'left' });
    });
    const hint = label(this, x, 70 + rows.length * 62 + 4, 'CONTROLLER\nStick or D-pad: move the tile cursor or the button focus\nA: use or press · B: back · LB / RB: pick an action\nY: end turn · Start: pause', { size: 13, color: COLORS.dim, width: w });
    const back = button(this, x, hint.y + hint.height + 14, w, 48, 'Back', () => this.scene.start('Menu'), { size: 17 });
    enableScroll(this, back.container.y + 48 + 20);
  }
}
