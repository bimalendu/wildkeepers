import { describe, expect, it } from 'vitest';
import { PadTracker, nextFocus, readPad } from '../src/input/pad';
import { playSfx } from '../src/audio/sfx';

const pad = (down: number[] = [], axes: number[] = [0, 0]): Gamepad =>
  ({ connected: true, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: down.includes(i), touched: false, value: 0 })), axes }) as unknown as Gamepad;

describe('controller input', () => {
  it('reads buttons, the D-pad and the left stick from a standard pad', () => {
    expect(readPad([null])).toBeNull();
    const r = readPad([pad([0, 15], [0, -0.9])])!;
    expect(r.buttons.a).toBe(true);
    expect(r.buttons.b).toBe(false);
    expect(r.dirs.right).toBe(true);
    expect(r.dirs.up).toBe(true); // from the stick
    expect(r.dirs.left).toBe(false);
  });
  it('fires a button once per press, not while held', () => {
    const t = new PadTracker();
    expect(t.poll(0, readPad([pad([0])]))).toEqual([{ kind: 'button', button: 'a' }]);
    expect(t.poll(16, readPad([pad([0])]))).toEqual([]);
    expect(t.poll(32, readPad([pad([])]))).toEqual([]);
    expect(t.poll(48, readPad([pad([0])]))).toHaveLength(1);
  });
  it('fires a direction at once, then repeats after a pause while held', () => {
    const t = new PadTracker();
    const held = () => readPad([pad([13])]);
    expect(t.poll(0, held())).toEqual([{ kind: 'dir', dir: 'down' }]);
    expect(t.poll(200, held())).toEqual([]);
    expect(t.poll(400, held())).toEqual([{ kind: 'dir', dir: 'down' }]);
    expect(t.poll(450, held())).toEqual([]);
    expect(t.poll(560, held())).toEqual([{ kind: 'dir', dir: 'down' }]);
  });
  it('forgets a pad that is unplugged', () => {
    const t = new PadTracker();
    t.poll(0, readPad([pad([0])]));
    expect(t.poll(10, null)).toEqual([]);
    expect(t.poll(20, readPad([pad([0])]))).toHaveLength(1);
  });
  it('moves focus to the nearest button in a direction', () => {
    const boxes = [{ cx: 100, cy: 100 }, { cx: 100, cy: 200 }, { cx: 300, cy: 105 }, { cx: 110, cy: 300 }];
    expect(nextFocus(boxes, 0, 'down')).toBe(1);
    expect(nextFocus(boxes, 1, 'down')).toBe(3);
    expect(nextFocus(boxes, 0, 'right')).toBe(2);
    expect(nextFocus(boxes, 0, 'up')).toBe(-1);
    expect(nextFocus(boxes, 2, 'left')).toBe(0);
    expect(nextFocus([], -1, 'down')).toBe(-1);
  });
});

describe('sound', () => {
  it('does nothing, and does not throw, when muted or when audio is unavailable', () => {
    expect(() => playSfx('ok', true)).not.toThrow();
    expect(() => playSfx('win', false)).not.toThrow(); // no AudioContext in this environment
  });
});
