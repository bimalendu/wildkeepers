import Phaser from 'phaser';
import { makeGeneratedTextures } from '../art/generated';
import { TILE_FILES } from '../art/tiles';
import { COLORS } from './kit';

/** Loads the tile art and waits for the web font, so the first screen is not drawn in a fallback face, then opens the menu. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const { width, height } = this.scale;
    const bar = this.add.graphics();
    this.load.on('progress', (p: number) => {
      bar.clear().fillStyle(COLORS.panel2, 1).fillRect(width / 2 - 100, height / 2, 200, 8).fillStyle(0x7bd88f, 1).fillRect(width / 2 - 100, height / 2, 200 * p, 8);
    });
    this.load.setPath(`${import.meta.env.BASE_URL}tiles/`);
    // a tile that fails to load is drawn as a plain coloured hex instead, so a missing file never blocks the game
    this.load.on('loaderror', () => undefined);
    for (const key of TILE_FILES) this.load.image(key, `${key}.png`);
  }

  create(): void {
    makeGeneratedTextures(this);
    const go = (): void => void this.scene.start('Menu');
    const fonts = document.fonts;
    if (!fonts) return go();
    Promise.race([
      Promise.all([fonts.load('16px "Atkinson Hyperlegible"'), fonts.load('bold 16px "Atkinson Hyperlegible"')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]).then(go, go);
  }
}
