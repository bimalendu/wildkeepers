/** Odd-r offset hex grid (pointy-top, odd rows shoved right). Tiles are addressed by a flat index `r * w + c`. */
export interface Hex {
  c: number;
  r: number;
}

const EVEN_ROW: readonly [number, number][] = [[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];
const ODD_ROW: readonly [number, number][] = [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]];

/** Direction indices 0..5: E, NE, NW, W, SW, SE. */
export const DIR_COUNT = 6;

export class HexGrid {
  constructor(
    readonly w: number,
    readonly h: number,
  ) {}

  get size(): number {
    return this.w * this.h;
  }

  index(c: number, r: number): number {
    return r * this.w + c;
  }

  hex(i: number): Hex {
    return { c: i % this.w, r: Math.floor(i / this.w) };
  }

  inBounds(c: number, r: number): boolean {
    return c >= 0 && r >= 0 && c < this.w && r < this.h;
  }

  /** The neighbour of `i` in direction `dir` (0..5), or -1 off the map. */
  step(i: number, dir: number): number {
    const { c, r } = this.hex(i);
    const [dc, dr] = (r & 1 ? ODD_ROW : EVEN_ROW)[((dir % 6) + 6) % 6];
    return this.inBounds(c + dc, r + dr) ? this.index(c + dc, r + dr) : -1;
  }

  neighbors(i: number): number[] {
    const out: number[] = [];
    for (let d = 0; d < DIR_COUNT; d++) {
      const n = this.step(i, d);
      if (n >= 0) out.push(n);
    }
    return out;
  }

  /** Cube coordinates, for distance. */
  private cube(i: number): [number, number, number] {
    const { c, r } = this.hex(i);
    const x = c - (r - (r & 1)) / 2;
    return [x, -x - r, r];
  }

  distance(a: number, b: number): number {
    const [ax, ay, az] = this.cube(a);
    const [bx, by, bz] = this.cube(b);
    return Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));
  }

  /** Every tile within `radius` steps of `i`, including `i`. */
  within(i: number, radius: number): number[] {
    const out: number[] = [];
    for (let t = 0; t < this.size; t++) if (this.distance(i, t) <= radius) out.push(t);
    return out;
  }

  /** The first step of a shortest route from `from` toward `to` (or `from` when already there). */
  stepToward(from: number, to: number): number {
    let best = from;
    let bestD = this.distance(from, to);
    for (const n of this.neighbors(from)) {
      const d = this.distance(n, to);
      if (d < bestD) (best = n), (bestD = d);
    }
    return best;
  }
}
