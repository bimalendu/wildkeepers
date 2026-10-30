import Phaser from 'phaser';
import { HexGrid } from '../sim/hex';
import { isBuilt, type Biome, type GameState, type Health, type PlanItem, type ThreatDef, type ThreatKind } from '../sim/types';
import { TILE_ART, TILE_W } from '../art/tiles';
import { BIOME_COLOR, FONT, lerpColor } from './kit';

const SQ3 = Math.sqrt(3);

const THREAT_COLOR: Record<ThreatKind, number> = {
  frontier: 0xef476f, fire: 0xff8c42, plume: 0xa06cd5, invasive: 0xe056fd, poaching: 0x0b0b0b, heat: 0xffd23f,
  accumulation: 0xbfc9c9, disease: 0x9be564, field: 0xf4a261, network: 0x00b4d8, thaw: 0x7fd8ff,
};

export interface ViewOpts {
  selected: number;
  patterns: boolean;
}

/** Draws a hex map into a rectangle of the screen and maps taps back to tiles. */
export class HexView {
  readonly grid: HexGrid;
  private size = 20;
  private ox = 0;
  private oy = 0;
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly texts: Phaser.GameObjects.Text[] = [];
  /** The picture layers of each tile: images are made on first use and reused. */
  private readonly images: Phaser.GameObjects.Image[][] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    rect: { x: number; y: number; w: number; h: number },
    w: number,
    h: number,
  ) {
    this.grid = new HexGrid(w, h);
    this.size = Math.min(rect.w / (SQ3 * (w + 0.5)), rect.h / (1.5 * (h - 1) + 2));
    const mapW = SQ3 * this.size * (w + 0.5);
    const mapH = this.size * (1.5 * (h - 1) + 2);
    this.ox = rect.x + (rect.w - mapW) / 2;
    this.oy = rect.y + (rect.h - mapH) / 2;
    this.g = scene.add.graphics().setDepth(5);
  }

  center(i: number): { x: number; y: number } {
    const { c, r } = this.grid.hex(i);
    return { x: this.ox + this.size * SQ3 * (c + 0.5 * (r & 1) + 0.5), y: this.oy + this.size * (1.5 * r + 1) };
  }

  /** The tile under a screen point, or -1. */
  tileAt(px: number, py: number): number {
    let best = -1;
    let bestD = (this.size * 0.95) ** 2;
    for (let i = 0; i < this.grid.size; i++) {
      const c = this.center(i);
      const d = (c.x - px) ** 2 + (c.y - py) ** 2;
      if (d < bestD) (best = i), (bestD = d);
    }
    return best;
  }

  private hexPath(cx: number, cy: number, r: number): { x: number; y: number }[] {
    return Array.from({ length: 6 }, (_, k) => {
      const a = (Math.PI / 180) * (60 * k - 30);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }

  private shade(biome: Biome, health: Health): number {
    if (isBuilt(biome)) return BIOME_COLOR[biome];
    return lerpColor(BIOME_COLOR[biome], 0x4a3b30, (1 - health / 2) * 0.78);
  }

  /** Small text on the map (strike countdowns). The pool is reused between redraws. */
  private text(i: number, str: string, x: number, y: number, size: number): void {
    let t = this.texts[i];
    if (!t) {
      t = this.scene.add.text(0, 0, '', { fontFamily: FONT, fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(10);
      this.texts[i] = t;
    }
    t.setText(str).setFontSize(Math.round(size)).setPosition(x, y).setVisible(true);
  }

  private glyph(biome: Biome, cx: number, cy: number, r: number, alpha: number): void {
    const g = this.g;
    g.lineStyle(Math.max(1.5, r * 0.09), 0xffffff, alpha);
    g.fillStyle(0xffffff, alpha);
    const k = r * 0.38;
    switch (biome) {
      case 'forest': case 'mangrove':
        g.strokeTriangle(cx, cy - k, cx - k, cy + k * 0.7, cx + k, cy + k * 0.7);
        break;
      case 'grass': case 'seagrass': case 'kelp':
        for (const dx of [-k * 0.7, 0, k * 0.7]) g.lineBetween(cx + dx, cy + k * 0.7, cx + dx * 1.2, cy - k * 0.6);
        break;
      case 'wetland': case 'river': case 'lake': case 'ocean':
        for (const dy of [-k * 0.5, k * 0.5]) {
          g.beginPath().moveTo(cx - k, cy + dy).lineTo(cx - k / 2, cy + dy - k / 3).lineTo(cx, cy + dy).lineTo(cx + k / 2, cy + dy - k / 3).lineTo(cx + k, cy + dy).strokePath();
        }
        break;
      case 'reef':
        for (const [dx, dy] of [[-k, 0], [0, -k * 0.6], [k, 0], [0, k * 0.7]]) g.fillCircle(cx + dx, cy + dy, r * 0.09);
        break;
      case 'ice': case 'tundra':
        g.strokePoints([{ x: cx, y: cy - k }, { x: cx + k, y: cy }, { x: cx, y: cy + k }, { x: cx - k, y: cy }], true);
        break;
      case 'farm':
        g.strokeRect(cx - k, cy - k * 0.8, k * 2, k * 1.6);
        g.lineBetween(cx, cy - k * 0.8, cx, cy + k * 0.8);
        g.lineBetween(cx - k, cy, cx + k, cy);
        break;
      case 'town':
        g.strokeRect(cx - k * 0.8, cy - k * 0.2, k * 1.6, k * 1.1);
        g.strokeTriangle(cx - k, cy - k * 0.2, cx + k, cy - k * 0.2, cx, cy - k);
        break;
      case 'mine':
        g.lineBetween(cx - k, cy - k, cx + k, cy + k);
        g.lineBetween(cx + k, cy - k, cx - k, cy + k);
        break;
      case 'road':
        g.lineBetween(cx - k, cy + k * 0.4, cx + k, cy - k * 0.4);
        break;
      case 'desert':
        g.beginPath().arc(cx, cy + k * 0.5, k, Math.PI, 0, false).strokePath();
        break;
    }
  }

  private threatMark(kind: ThreatKind, cx: number, cy: number, r: number): void {
    const g = this.g;
    const col = THREAT_COLOR[kind];
    const k = r * 0.42;
    g.lineStyle(Math.max(2, r * 0.12), 0xffffff, 1);
    g.fillStyle(col, 1);
    switch (kind) {
      case 'frontier': g.fillRect(cx - k, cy - k, k * 2, k * 2).strokeRect(cx - k, cy - k, k * 2, k * 2); g.lineStyle(2, 0xffffff, 1).lineBetween(cx - k, cy - k, cx + k, cy + k); break;
      case 'fire': g.fillTriangle(cx, cy - k * 1.2, cx - k, cy + k, cx + k, cy + k).strokeTriangle(cx, cy - k * 1.2, cx - k, cy + k, cx + k, cy + k); break;
      case 'plume': g.fillCircle(cx, cy, k).strokeCircle(cx, cy, k); break;
      case 'invasive': g.fillPoints([{ x: cx, y: cy - k * 1.2 }, { x: cx + k * 1.2, y: cy }, { x: cx, y: cy + k * 1.2 }, { x: cx - k * 1.2, y: cy }], true).strokePoints([{ x: cx, y: cy - k * 1.2 }, { x: cx + k * 1.2, y: cy }, { x: cx, y: cy + k * 1.2 }, { x: cx - k * 1.2, y: cy }], true); break;
      case 'poaching': g.fillCircle(cx, cy, k).strokeCircle(cx, cy, k); g.lineBetween(cx - k * 1.4, cy, cx + k * 1.4, cy).lineBetween(cx, cy - k * 1.4, cx, cy + k * 1.4); break;
      case 'heat': g.fillCircle(cx, cy, k * 0.7).strokeCircle(cx, cy, k * 1.1); break;
      case 'accumulation': g.fillCircle(cx, cy, k).strokeCircle(cx, cy, k); g.lineStyle(2, 0x222222, 1).strokeCircle(cx, cy, k * 0.45); break;
      case 'disease': g.fillCircle(cx, cy, k).strokeCircle(cx, cy, k); g.lineStyle(2, 0x1d3b10, 1).lineBetween(cx - k * 0.6, cy, cx + k * 0.6, cy).lineBetween(cx, cy - k * 0.6, cx, cy + k * 0.6); break;
      case 'field': g.lineStyle(3, col, 1).strokeCircle(cx, cy, k * 1.3).strokeCircle(cx, cy, k * 0.6); break;
      case 'thaw': g.fillTriangle(cx, cy - k * 1.4, cx - k * 0.85, cy + k * 0.1, cx + k * 0.85, cy + k * 0.1).fillCircle(cx, cy + k * 0.3, k * 0.85).strokeCircle(cx, cy + k * 0.3, k * 0.85); break;
      case 'network': g.fillCircle(cx - k * 0.6, cy, k * 0.6).fillCircle(cx + k * 0.6, cy, k * 0.6).strokeCircle(cx - k * 0.6, cy, k * 0.6).strokeCircle(cx + k * 0.6, cy, k * 0.6); break;
    }
  }

  /** A paw print: the 🐾 home tiles hunters head for. */
  private paw(cx: number, cy: number, r: number): void {
    const g = this.g;
    g.fillStyle(0xffffff, 1).lineStyle(2, 0x000000, 0.8);
    g.fillCircle(cx, cy + r * 0.1, r * 0.2).strokeCircle(cx, cy + r * 0.1, r * 0.2);
    for (const [dx, dy] of [[-0.3, -0.18], [-0.1, -0.34], [0.1, -0.34], [0.3, -0.18]]) {
      g.fillCircle(cx + dx * r, cy + dy * r, r * 0.09).strokeCircle(cx + dx * r, cy + dy * r, r * 0.09);
    }
  }

  private cross(x: number, y: number, k: number): void {
    this.g.lineStyle(5, 0x000000, 0.9).lineBetween(x - k, y - k, x + k, y + k).lineBetween(x + k, y - k, x - k, y + k);
    this.g.lineStyle(3, 0xffffff, 1).lineBetween(x - k, y - k, x + k, y + k).lineBetween(x + k, y - k, x - k, y + k);
  }

  private arrow(a: { x: number; y: number }, b: { x: number; y: number }, color: number, r: number): void {
    const g = this.g;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const x1 = a.x + ux * r * 0.3;
    const y1 = a.y + uy * r * 0.3;
    const x2 = b.x - ux * r * 0.32;
    const y2 = b.y - uy * r * 0.32;
    const hs = r * 0.3;
    const head = [{ x: x2 + ux * hs * 0.6, y: y2 + uy * hs * 0.6 }, { x: x2 - uy * hs * 0.55 - ux * hs * 0.5, y: y2 + ux * hs * 0.55 - uy * hs * 0.5 }, { x: x2 + uy * hs * 0.55 - ux * hs * 0.5, y: y2 - ux * hs * 0.55 - uy * hs * 0.5 }];
    g.lineStyle(Math.max(5, r * 0.25), 0xffffff, 0.95).lineBetween(x1, y1, x2, y2);
    g.fillStyle(0xffffff, 0.95).fillPoints(head, true);
    g.lineStyle(Math.max(3, r * 0.15), color, 1).lineBetween(x1, y1, x2, y2);
    g.fillStyle(color, 1).fillPoints(head.map((p) => ({ x: p.x - ux * 1, y: p.y - uy * 1 })), true);
  }

  /** Draws one threat's announced moves: arrows, strike reticles with countdowns, and an ✕ where a defence will stop it. */
  private drawPlan(s: GameState, def: ThreatDef, items: PlanItem[], textSlot: { n: number }): void {
    const r = this.size;
    const color = THREAT_COLOR[def.kind];
    const stops = (i: number) => s.tiles[i].defended || (def.behaviour !== 'strike' && s.tiles[i].protected);
    for (const item of items) {
      if (def.behaviour === 'strike') {
        for (const i of item.path) {
          const { x, y } = this.center(i);
          if (stops(i)) {
            this.cross(x, y, r * 0.22);
            continue;
          }
          this.g.lineStyle(4, 0x000000, 0.9).strokeCircle(x, y, r * 0.55);
          this.g.lineStyle(3, color, 1).strokeCircle(x, y, r * 0.55);
          this.g.lineBetween(x - r * 0.75, y, x - r * 0.35, y).lineBetween(x + r * 0.35, y, x + r * 0.75, y).lineBetween(x, y - r * 0.75, x, y - r * 0.35).lineBetween(x, y + r * 0.35, x, y + r * 0.75);
          this.text(textSlot.n++, item.eta === 0 ? '!' : String(item.eta), x, y, r * 0.7);
        }
        continue;
      }
      let prev = item.from >= 0 ? this.center(item.from) : null;
      for (const i of item.path) {
        const here = this.center(i);
        if (!stops(i)) this.g.lineStyle(3, color, 0.9).strokePoints(this.hexPath(here.x, here.y, r * 0.8), true);
        if (prev) this.arrow(prev, here, color, r);
        else this.g.lineStyle(3, color, 1).strokeCircle(here.x, here.y, r * 0.5);
        if (stops(i)) {
          this.cross(here.x, here.y, r * 0.22);
          if (def.behaviour === 'hunt') break; // a turned-back hunter goes no further
        }
        prev = here;
      }
    }
  }

  /** Puts the tile's picture layers on the map. Returns false when a picture is missing, so the caller draws a plain hex. */
  private paintTile(i: number, biome: Biome, health: Health, x: number, y: number): boolean {
    const layers = TILE_ART[biome][health];
    const imgs = (this.images[i] ??= []);
    if (!layers.every((l) => this.scene.textures.exists(l.key))) {
      for (const im of imgs) im.setVisible(false);
      return false;
    }
    const f = (SQ3 * this.size * 1.015) / TILE_W; // a hair wider than the hex, so no seams show
    layers.forEach((l, k) => {
      let im = imgs[k];
      if (!im) (im = this.scene.add.image(0, 0, l.key).setDepth(0)), (imgs[k] = im);
      im.setTexture(l.key).setPosition(x + (l.dx ?? 0) * f, y + (l.dy ?? 0) * f).setScale(f * (l.scale ?? 1)).setVisible(true);
    });
    for (let k = layers.length; k < imgs.length; k++) imgs[k].setVisible(false);
    return true;
  }

  draw(s: GameState, o: ViewOpts): void {
    const g = this.g;
    g.clear();
    for (const t of this.texts) t?.setVisible(false);
    const r = this.size;
    const sources = new Set(Object.values(s.sources).flat());
    const homes = new Set(s.species.filter((sp) => !sp.extinct).flatMap((sp) => sp.homes));
    s.tiles.forEach((t, i) => {
      const { x, y } = this.center(i);
      const art = this.paintTile(i, t.biome, t.health, x, y);
      if (!art) {
        // no picture for this tile (it failed to load): a plain coloured hex with cracks for the damage
        const pts = this.hexPath(x, y, r * 0.97);
        g.fillStyle(this.shade(t.biome, t.health), 1).fillPoints(pts, true);
        g.lineStyle(1.5, 0x0d1d15, 0.9).strokePoints(pts, true);
        if (!isBuilt(t.biome) && t.health < 2) {
          g.lineStyle(Math.max(1.5, r * 0.07), 0x1e140d, 0.75);
          g.beginPath().moveTo(x - r * 0.5, y - r * 0.15).lineTo(x - r * 0.15, y + r * 0.05).lineTo(x + r * 0.05, y - r * 0.2).lineTo(x + r * 0.5, y + r * 0.1).strokePath();
          if (t.health === 0) g.beginPath().moveTo(x - r * 0.35, y + r * 0.45).lineTo(x - r * 0.05, y + r * 0.25).lineTo(x + r * 0.2, y + r * 0.5).lineTo(x + r * 0.5, y + r * 0.35).strokePath();
        }
      }
      // symbols on the tiles: always on for colourblind players; a faint hint over the plain fallback hexes
      if (o.patterns) this.glyph(t.biome, x, y, r, 0.85);
      else if (!art) this.glyph(t.biome, x, y, r, 0.28);

      if (t.defended) {
        g.fillStyle(0x5bc0eb, 0.22).fillPoints(this.hexPath(x, y, r * 0.88), true);
        g.lineStyle(4, 0x5bc0eb, 1).strokePoints(this.hexPath(x, y, r * 0.84), true);
      }
      if (t.protected) g.lineStyle(3, 0xffd166, 1).strokePoints(this.hexPath(x, y, r * 0.92), true);
      if (t.risky) g.fillStyle(0xef476f, 1).fillTriangle(x + r * 0.55, y - r * 0.6, x + r * 0.8, y - r * 0.15, x + r * 0.3, y - r * 0.15).lineStyle(1.5, 0xffffff, 1).strokeTriangle(x + r * 0.55, y - r * 0.6, x + r * 0.8, y - r * 0.15, x + r * 0.3, y - r * 0.15);
      if (sources.has(i)) g.lineStyle(2, 0xffffff, 0.9).strokeCircle(x, y, r * 0.2);
      if (homes.has(i)) this.paw(x - r * 0.38, y + r * 0.42, r * 0.8);
      if (t.threat) {
        const def = s.mission.threats.find((d) => d.id === t.threat);
        if (def) this.threatMark(def.kind, x, y, r);
      }
    });
    const slot = { n: 0 };
    for (const def of s.mission.threats) this.drawPlan(s, def, s.plan[def.id] ?? [], slot);
    if (o.selected >= 0) {
      const { x, y } = this.center(o.selected);
      g.lineStyle(4, 0xffffff, 1).strokePoints(this.hexPath(x, y, r * 0.97), true);
    }
  }

  destroy(): void {
    this.g.destroy();
    for (const t of this.texts) t?.destroy();
    for (const imgs of this.images) for (const im of imgs ?? []) im.destroy();
  }
}

export { THREAT_COLOR };
