/** Controller support: reads the browser Gamepad API and turns it into a few edge-triggered events. */
export type PadButton = 'a' | 'b' | 'x' | 'y' | 'lb' | 'rb' | 'start';
export type PadDir = 'up' | 'down' | 'left' | 'right';
export type PadEvent = { kind: 'dir'; dir: PadDir } | { kind: 'button'; button: PadButton };

/** Standard-mapping button indexes. */
const BUTTON_INDEX: Record<PadButton, number> = { a: 0, b: 1, x: 2, y: 3, lb: 4, rb: 5, start: 9 };
const DPAD: Record<PadDir, number> = { up: 12, down: 13, left: 14, right: 15 };
const STICK = 0.6;
/** A held direction repeats after this many ms, then every REPEAT ms. */
const FIRST = 380;
const REPEAT = 140;

interface Pressed {
  buttons: Partial<Record<PadButton, boolean>>;
  dirs: Partial<Record<PadDir, boolean>>;
}

export function readPad(pads: ArrayLike<Gamepad | null> | undefined = typeof navigator !== 'undefined' ? navigator.getGamepads?.() : undefined): Pressed | null {
  const pad = pads ? Array.from(pads).find((p) => p && p.connected) : null;
  if (!pad) return null;
  const down = (i: number) => !!pad.buttons[i]?.pressed;
  const ax = pad.axes[0] ?? 0;
  const ay = pad.axes[1] ?? 0;
  return {
    buttons: Object.fromEntries((Object.keys(BUTTON_INDEX) as PadButton[]).map((b) => [b, down(BUTTON_INDEX[b])])),
    dirs: { up: down(DPAD.up) || ay < -STICK, down: down(DPAD.down) || ay > STICK, left: down(DPAD.left) || ax < -STICK, right: down(DPAD.right) || ax > STICK },
  };
}

/** Turns successive readings into events: a press fires once, a held direction repeats. */
export class PadTracker {
  private prevButtons: Partial<Record<PadButton, boolean>> = {};
  private heldSince: Partial<Record<PadDir, number>> = {};
  private lastFire: Partial<Record<PadDir, number>> = {};

  poll(now: number, pressed: Pressed | null): PadEvent[] {
    const out: PadEvent[] = [];
    if (!pressed) {
      this.prevButtons = {};
      this.heldSince = {};
      return out;
    }
    for (const b of Object.keys(BUTTON_INDEX) as PadButton[]) {
      if (pressed.buttons[b] && !this.prevButtons[b]) out.push({ kind: 'button', button: b });
    }
    this.prevButtons = { ...pressed.buttons };
    for (const d of Object.keys(DPAD) as PadDir[]) {
      if (!pressed.dirs[d]) {
        delete this.heldSince[d];
        continue;
      }
      const since = this.heldSince[d];
      if (since === undefined) {
        this.heldSince[d] = now;
        this.lastFire[d] = now;
        out.push({ kind: 'dir', dir: d });
      } else if (now - since >= FIRST && now - (this.lastFire[d] ?? 0) >= REPEAT) {
        this.lastFire[d] = now;
        out.push({ kind: 'dir', dir: d });
      }
    }
    return out;
  }
}

export interface Box {
  cx: number;
  cy: number;
}

/** The index of the box to move focus to, or -1. Prefers boxes straight ahead over ones off to the side. */
export function nextFocus(boxes: Box[], from: number, dir: PadDir): number {
  const cur = boxes[from];
  if (!cur) return boxes.length ? 0 : -1;
  let best = -1;
  let bestScore = Infinity;
  boxes.forEach((b, i) => {
    if (i === from) return;
    const dx = b.cx - cur.cx;
    const dy = b.cy - cur.cy;
    const ahead = dir === 'up' ? -dy : dir === 'down' ? dy : dir === 'left' ? -dx : dx;
    const side = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
    if (ahead < 1) return;
    const score = ahead + side * 2.5;
    if (score < bestScore) (bestScore = score), (best = i);
  });
  return best;
}
