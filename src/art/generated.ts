// Textures drawn in code for what Kenney's pack lacks: water, ice, coral, kelp, seagrass and wetland puddles. They are
// the same size as Kenney's tiles (120 x 140), so they sit in the same grid, and they get their own look for each
// health state: Healthy is bright, Damaged is murky, Lost is dead and grey-brown.
import Phaser from 'phaser';
import { lerpColor } from '../scenes/kit';
import { TILE_H, TILE_W } from './tiles';

const CX = TILE_W / 2;
const CY = TILE_H / 2;
const R = TILE_W / Math.sqrt(3); // circumradius of a regular pointy-top hex that is 120 wide

const hex = (r: number): { x: number; y: number }[] =>
  Array.from({ length: 6 }, (_, k) => ({ x: CX + r * Math.cos((Math.PI / 180) * (60 * k - 30)), y: CY + r * Math.sin((Math.PI / 180) * (60 * k - 30)) }));

const PALETTE = { river: 0x3b86d0, lake: 0x2f6fb8, ocean: 0x2159a0 } as const;
const MURKY = 0x7d8456;
const DEAD = 0x5d5547;

/** The colour of water in a health state. */
const waterColour = (kind: keyof typeof PALETTE, h: number): number => (h === 2 ? PALETTE[kind] : h === 1 ? lerpColor(PALETTE[kind], MURKY, 0.55) : lerpColor(PALETTE[kind], DEAD, 0.85));

type Draw = (g: Phaser.GameObjects.Graphics) => void;

function make(scene: Phaser.Scene, key: string, draw: Draw): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, TILE_W, TILE_H);
  g.destroy();
}

function waterTile(g: Phaser.GameObjects.Graphics, base: number, h: number): void {
  g.fillStyle(lerpColor(base, 0xffffff, 0.35), 1).fillPoints(hex(R), true); // a light rim, like Kenney's borders
  g.fillStyle(base, 1).fillPoints(hex(R * 0.9), true);
  g.lineStyle(3, lerpColor(base, 0xffffff, h === 0 ? 0.08 : 0.3), 0.8);
  const waves = h === 0 ? [[-22, 0, 8, 0], [10, 20, 8, 0]] : [[-30, -16, 14, 1], [6, -2, 12, -1], [-18, 24, 12, 1]];
  for (const [x, y, w, d] of waves) g.beginPath().moveTo(CX + x, CY + y).lineTo(CX + x + w, CY + y + d * 4).lineTo(CX + x + w * 2, CY + y).strokePath();
  if (h === 0) {
    g.fillStyle(0x2c2620, 0.45);
    for (const [x, y, r] of [[-20, -16, 6], [18, 10, 8], [-6, 24, 5], [24, -22, 4]]) g.fillCircle(CX + x, CY + y, r);
  }
}

function iceTile(g: Phaser.GameObjects.Graphics, h: number): void {
  g.fillStyle(0xe9f6fb, 1).fillPoints(hex(R), true);
  g.fillStyle(h === 2 ? 0xd3ecf6 : 0xb7d3df, 1).fillPoints(hex(R * 0.88), true);
  g.lineStyle(3, 0xffffff, 0.8).beginPath().moveTo(CX - 28, CY - 10).lineTo(CX - 8, CY - 22).strokePath();
  if (h === 1) {
    // melting: dark water showing through cracks and a pool
    g.fillStyle(PALETTE.ocean, 0.85).fillEllipse(CX + 8, CY + 12, 46, 26);
    g.lineStyle(3, PALETTE.ocean, 0.9).beginPath().moveTo(CX - 40, CY + 4).lineTo(CX - 18, CY - 4).lineTo(CX - 6, CY + 16).strokePath();
  }
}

/** Overlays are drawn on a transparent tile, over a base. */
const coral = (g: Phaser.GameObjects.Graphics, h: number): void => {
  const blobs: [number, number, number][] = [[-24, -10, 11], [-4, 12, 14], [22, -14, 10], [26, 18, 9], [-30, 22, 8]];
  const colours = h === 2 ? [0xf0708f, 0xff9a62, 0xd45db0] : h === 1 ? [0xe9e2d6, 0xf4efe6, 0xd9cfc0] : [0x6e6a62, 0x58544d, 0x7a756c];
  blobs.forEach(([x, y, r], i) => {
    g.fillStyle(colours[i % 3], 1).fillCircle(CX + x, CY + y, r);
    g.fillStyle(0xffffff, h === 2 ? 0.25 : 0.1).fillCircle(CX + x - r * 0.3, CY + y - r * 0.3, r * 0.35);
  });
};

const strands = (g: Phaser.GameObjects.Graphics, colour: number, tall: number, count: number): void => {
  g.lineStyle(4, colour, 1);
  for (let i = 0; i < count; i++) {
    const x = CX - 36 + (i * 72) / Math.max(1, count - 1);
    const y = CY + 22 - (i % 2) * 14;
    g.beginPath().moveTo(x, y).lineTo(x + 3, y - tall * 0.5).lineTo(x - 3, y - tall).strokePath();
  }
};

const puddles = (g: Phaser.GameObjects.Graphics, h: number): void => {
  g.fillStyle(h === 2 ? 0x4aa3d9 : 0x8a7a55, 0.95);
  for (const [x, y, w, hh] of [[-22, -8, 34, 18], [14, 16, 38, 20], [20, -22, 22, 12]]) g.fillEllipse(CX + x, CY + y, w, hh);
  g.lineStyle(2, 0xffffff, 0.45).strokeEllipse(CX - 22, CY - 8, 22, 10);
};

/** Draws every "gen_" texture. Called once at boot, after the PNGs have loaded. */
export function makeGeneratedTextures(scene: Phaser.Scene): void {
  for (const kind of ['river', 'lake', 'ocean'] as const) {
    for (const h of [0, 1, 2]) make(scene, `gen_${kind}_${h}`, (g) => waterTile(g, waterColour(kind, h), h));
  }
  make(scene, 'gen_ice_1', (g) => iceTile(g, 1));
  make(scene, 'gen_ice_2', (g) => iceTile(g, 2));
  for (const h of [0, 1, 2]) make(scene, `gen_coral_${h}`, (g) => coral(g, h));
  make(scene, 'gen_seagrass_1', (g) => strands(g, 0x9aa856, 26, 5));
  make(scene, 'gen_seagrass_2', (g) => strands(g, 0x4fc08d, 34, 7));
  make(scene, 'gen_kelp_1', (g) => strands(g, 0x8f9a45, 44, 3));
  make(scene, 'gen_kelp_2', (g) => strands(g, 0x3f9c4a, 60, 5));
  make(scene, 'gen_puddles_1', (g) => puddles(g, 1));
  make(scene, 'gen_puddles_2', (g) => puddles(g, 2));
}
