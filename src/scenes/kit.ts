import { playSfx, type Sfx } from '../audio/sfx';
import { attachPad, registerFocusable } from './padNav';
import Phaser from 'phaser';
import type { SaveStore } from '../save/SaveStore';
import type { Biome } from '../sim/types';

export const FONT = '"Atkinson Hyperlegible", system-ui, sans-serif';

export const COLORS = {
  bg: 0x10261c,
  panel: 0x183829,
  panel2: 0x23553d,
  line: 0x3b7a58,
  ink: '#eef6ea',
  dim: '#9bb8a5',
  accent: '#ffd166',
  danger: '#ef476f',
  good: '#7bd88f',
  info: '#5bc0eb',
};

export const BIOME_COLOR: Record<Biome, number> = {
  forest: 0x2f7d4f, grass: 0x8bb34a, wetland: 0x3f8f8a, river: 0x3b7fc4, lake: 0x2f65a8, reef: 0xe07a8f, ocean: 0x1d4e89,
  mangrove: 0x2a6f5c, seagrass: 0x4aa38a, kelp: 0x4b8a3a, ice: 0xcfe8f3, farm: 0xc9a64a, town: 0x8c8c92, mine: 0x6b5b4e,
  road: 0xa58f7a, tundra: 0x8a9a8f, desert: 0xd9b36b,
};

export const BIOME_NAME: Record<Biome, string> = {
  forest: 'Forest', grass: 'Grassland', wetland: 'Wetland', river: 'River', lake: 'Lake', reef: 'Coral reef', ocean: 'Open ocean',
  mangrove: 'Mangrove', seagrass: 'Seagrass', kelp: 'Kelp forest', ice: 'Sea ice', farm: 'Farmland', town: 'Settlement',
  mine: 'Mine', road: 'Road', tundra: 'Tundra', desert: 'Desert',
};

export const HEALTH_NAME = ['Lost', 'Damaged', 'Healthy'];

export const TEXT_SCALE = [1, 1.2, 1.4];

export const getSave = (scene: Phaser.Scene): SaveStore => scene.registry.get('save') as SaveStore;
export const textScale = (scene: Phaser.Scene): number => TEXT_SCALE[getSave(scene).settings.textSize] ?? 1;

export interface TextOpts {
  size?: number;
  color?: string;
  origin?: [number, number];
  align?: 'left' | 'center' | 'right';
  width?: number;
  bold?: boolean;
  lineSpacing?: number;
  /** Cap on the text-size setting for places with a fixed size (the HUD, action buttons). */
  maxScale?: number;
}

/** Text in the game font, sized by the player's text-size setting. */
export function label(scene: Phaser.Scene, x: number, y: number, str: string, o: TextOpts = {}): Phaser.GameObjects.Text {
  const { size = 16, color = COLORS.ink, origin = [0, 0], align = 'left', width, bold = false, lineSpacing = 4, maxScale = Infinity } = o;
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: `${Math.round(size * Math.min(maxScale, textScale(scene)))}px`,
    fontStyle: bold ? 'bold' : 'normal',
    color,
    align,
    lineSpacing,
    wordWrap: width ? { width } : undefined,
  });
  return t.setOrigin(origin[0], origin[1]);
}

export interface Button {
  container: Phaser.GameObjects.Container;
  setLabel(s: string): void;
  setEnabled(on: boolean): void;
  setSelected(on: boolean): void;
}

export interface ButtonOpts {
  size?: number;
  fill?: number;
  color?: string;
  enabled?: boolean;
  align?: 'left' | 'center';
  /** Cap on the text-size setting for this button's text. */
  maxScale?: number;
  /** Called instead of onTap when the button is dimmed, so it can say why. */
  onBlocked?: () => void;
}

export function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string, onTap: () => void, o: ButtonOpts = {}): Button {
  const fill = o.fill ?? COLORS.panel2;
  const bg = scene.add.graphics();
  const txt = label(scene, o.align === 'left' ? 12 : w / 2, h / 2, text, {
    size: o.size ?? 16,
    color: o.color ?? COLORS.ink,
    origin: [o.align === 'left' ? 0 : 0.5, 0.5],
    align: o.align === 'left' ? 'left' : 'center',
    width: w - 20,
    bold: true,
    maxScale: o.maxScale ?? 1.2, // buttons have a fixed height: text can grow, but not past it
  });
  const zone = scene.add.rectangle(w / 2, h / 2, w, h, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
  const container = scene.add.container(x, y, [bg, txt, zone]);
  let enabled = o.enabled ?? true;
  let selected = false;
  let hover = false;
  const draw = () => {
    bg.clear();
    bg.fillStyle(!enabled ? 0x1a2e24 : selected ? 0x3f8f63 : hover ? 0x2f6a4c : fill, 1);
    bg.fillRoundedRect(0, 0, w, h, 10);
    bg.lineStyle(2, selected ? 0xffd166 : enabled ? COLORS.line : 0x2a4638, 1);
    bg.strokeRoundedRect(1, 1, w - 2, h - 2, 10);
    txt.setAlpha(enabled ? 1 : 0.45);
  };
  zone.on('pointerover', () => ((hover = true), draw()));
  zone.on('pointerout', () => ((hover = false), draw()));
  const press = () => {
    sound(scene, enabled ? 'click' : 'error');
    if (enabled) onTap();
    else o.onBlocked?.();
  };
  zone.on('pointerup', () => {
    if (scene.data.get('dragged')) return;
    press();
  });
  registerFocusable(scene, { container, w, h, press });
  draw();
  return {
    container,
    setLabel: (s) => txt.setText(s),
    setEnabled: (on) => ((enabled = on), draw()),
    setSelected: (on) => ((selected = on), draw()),
  };
}

export function panel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill: number = COLORS.panel): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1).fillRoundedRect(x, y, w, h, 12);
  g.lineStyle(2, COLORS.line, 1).strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 12);
  return g;
}

export function background(scene: Phaser.Scene): void {
  scene.cameras.main.setBackgroundColor(COLORS.bg);
  attachPad(scene); // every scene calls this first, so every scene can be driven by a controller
}

/** Restarts the scene when the window changes size, so the layout is rebuilt for the new shape. */
export function relayoutOnResize(scene: Phaser.Scene, data?: object): void {
  let timer: Phaser.Time.TimerEvent | undefined;
  const onResize = () => {
    timer?.remove();
    timer = scene.time.delayedCall(150, () => scene.scene.restart(data));
  };
  scene.scale.on('resize', onResize);
  scene.events.once('shutdown', () => scene.scale.off('resize', onResize));
}

export const isPortrait = (scene: Phaser.Scene): boolean => scene.scale.height > scene.scale.width * 1.05;

/** Plays a sound effect unless the player has muted sound. */
export function sound(scene: Phaser.Scene, name: Sfx): void {
  playSfx(name, getSave(scene).settings.muted);
}

export function buzz(scene: Phaser.Scene, ms = 15): void {
  if (getSave(scene).settings.haptics) navigator.vibrate?.(ms);
}

/** Blends two 0xRRGGBB colours; `t` 0 gives `a`, 1 gives `b`. */
export function lerpColor(a: number, b: number, t: number): number {
  const ch = (shift: number) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/**
 * Buttons under a page of text. When the text is short they sit right below it; when it is long (or the text size is
 * large) they stay pinned to a bar at the bottom of the screen and the page scrolls behind them.
 */
export function footer(scene: Phaser.Scene, flowY: number, make: (y: number) => Button[]): void {
  const H = scene.scale.height;
  const barH = 70;
  const pinned = flowY + 46 > H - 8;
  if (pinned) scene.add.rectangle(0, H - barH, scene.scale.width, barH, COLORS.bg).setOrigin(0).setScrollFactor(0).setDepth(50);
  const buttons = make(pinned ? H - barH + 12 : flowY);
  if (pinned) for (const b of buttons) pin(b.container).setDepth(60);
  enableScroll(scene, pinned ? flowY + 46 + barH : flowY + 70);
}

/** Vertical drag / wheel scrolling for tall screens. Taps that were really drags are ignored by buttons. */
export function enableScroll(scene: Phaser.Scene, contentHeight: number): void {
  const cam = scene.cameras.main;
  const max = Math.max(0, contentHeight - scene.scale.height);
  let startY = 0;
  let startScroll = 0;
  let down = false;
  scene.data.set('dragged', false);
  scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
    down = true;
    startY = p.y;
    startScroll = cam.scrollY;
    scene.data.set('dragged', false);
  });
  scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
    if (!down || max === 0) return;
    if (Math.abs(p.y - startY) > 8) scene.data.set('dragged', true);
    if (scene.data.get('dragged')) cam.scrollY = Math.min(max, Math.max(0, startScroll + (startY - p.y)));
  });
  scene.input.on('pointerup', () => {
    down = false;
    scene.time.delayedCall(30, () => scene.data.set('dragged', false));
  });
  scene.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
    cam.scrollY = Math.min(max, Math.max(0, cam.scrollY + dy));
  });
}

/** Pins game objects to the screen so they stay put while the page scrolls. */
export function pin<T extends Phaser.GameObjects.GameObject>(obj: T): T {
  (obj as unknown as { setScrollFactor(n: number): void }).setScrollFactor(0);
  return obj;
}

export interface DialogButton {
  label: string;
  onTap: () => void;
  primary?: boolean;
}

/** A modal dialog pinned to the screen. Returns a function that closes it. */
export function openDialog(scene: Phaser.Scene, title: string, text: string, buttons: DialogButton[]): () => void {
  const W = scene.scale.width;
  const H = scene.scale.height;
  const w = Math.min(560, W - 24);
  const x = (W - w) / 2;
  const body = label(scene, x + 16, 0, text, { size: 14, width: w - 32 });
  const head = label(scene, x + 16, 0, title, { size: 19, bold: true, color: COLORS.accent, width: w - 32 });
  const h = Math.min(H - 16, head.height + body.height + 52 + buttons.length * 52 + 24);
  const y = (H - h) / 2;
  const shade = scene.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setInteractive();
  const box = panel(scene, x, y, w, h, COLORS.panel);
  head.setPosition(x + 16, y + 14);
  body.setPosition(x + 16, y + 20 + head.height);
  const items: Phaser.GameObjects.GameObject[] = [shade, box, head, body];
  const close = () => items.forEach((o) => o.destroy());
  buttons.forEach((b, i) => {
    const btn = button(scene, x + 16, y + h - (buttons.length - i) * 52 - 8, w - 32, 44, b.label, () => {
      close();
      b.onTap();
    }, { size: 16, fill: b.primary ? 0x2f8f5f : undefined });
    items.push(btn.container);
  });
  items.forEach((o) => pin(o));
  return close;
}

export const THEME_NAME: Record<string, string> = {
  land: 'Land & Forests', freshwater: 'Freshwater', ocean: 'Oceans & Coasts', wildlife: 'Wildlife', plants: 'Plants & Fungi',
  climate: 'Climate & Air', pollution: 'Pollution & Waste', deepsea: 'Deep Sea',
};

export const BADGE_COLOR: Record<string, string> = { Critical: '#ef476f', High: '#ffd166', Elevated: '#5bc0eb' };
