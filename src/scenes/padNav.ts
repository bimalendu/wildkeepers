import Phaser from 'phaser';
import { PadTracker, nextFocus, readPad, type PadEvent } from '../input/pad';

interface Focusable {
  container: Phaser.GameObjects.Container;
  w: number;
  h: number;
  press: () => void;
}

const registry = new WeakMap<Phaser.Scene, Focusable[]>();

/** Called by `button`: lets a controller move focus onto it and press it. */
export function registerFocusable(scene: Phaser.Scene, f: Focusable): void {
  const list = registry.get(scene) ?? [];
  list.push(f);
  registry.set(scene, list);
}

/** A scene can take over controller input (the mission screen does, for its map). Return true when handled. */
export interface PadScene extends Phaser.Scene {
  padInput?(ev: PadEvent): boolean;
  /** While set, controller focus stays on these objects (an open dialog). */
  padScope?(): Phaser.GameObjects.GameObject[] | null;
}

const BACK = /^(Back|Menu|Cancel|Resume|Close|Continue)/;

const screenPos = (f: Focusable, cam: Phaser.Cameras.Scene2D.Camera) => ({
  cx: f.container.x + f.w / 2 - cam.scrollX * f.container.scrollFactorX,
  cy: f.container.y + f.h / 2 - cam.scrollY * f.container.scrollFactorY,
});

const labelOf = (f: Focusable): string => ((f.container.list[1] as Phaser.GameObjects.Text | undefined)?.text ?? '').trim();

/** Wires a controller to a scene: D-pad or stick moves a focus ring between buttons, A presses, B goes back. */
export function attachPad(scene: PadScene): void {
  const tracker = new PadTracker();
  let focus: Focusable | null = null;
  const ring = scene.add.graphics().setDepth(1000);

  const live = (): Focusable[] => {
    const scope = scene.padScope?.() ?? null;
    return (registry.get(scene) ?? []).filter((f) => f.container.active && f.container.visible && (!scope || scope.includes(f.container)));
  };

  const handle = (ev: PadEvent): void => {
    if (scene.padInput?.(ev)) return;
    const cam = scene.cameras.main;
    const items = live().sort((a, b) => screenPos(a, cam).cy - screenPos(b, cam).cy || screenPos(a, cam).cx - screenPos(b, cam).cx);
    if (!items.length) return;
    if (!focus || !items.includes(focus)) {
      // the first press only shows where focus is
      if (ev.kind === 'dir' || (ev.kind === 'button' && ev.button === 'a')) focus = items[0];
    } else if (ev.kind === 'dir') {
      const to = nextFocus(items.map((f) => screenPos(f, cam)), items.indexOf(focus), ev.dir);
      if (to >= 0) focus = items[to];
    } else if (ev.button === 'a') {
      focus.press();
    } else if (ev.button === 'b') {
      items.find((f) => BACK.test(labelOf(f)))?.press();
    }
    // keep the focused button on screen in scrolling scenes
    if (focus && focus.container.scrollFactorY !== 0) {
      const { cy } = screenPos(focus, cam);
      const H = scene.scale.height;
      if (cy < 60) cam.scrollY = Math.max(0, cam.scrollY + cy - 80);
      else if (cy > H - 40) cam.scrollY += cy - (H - 80);
    }
  };

  const onUpdate = (time: number): void => {
    for (const ev of tracker.poll(time, readPad())) handle(ev);
    ring.clear();
    if (focus && focus.container.active && focus.container.visible) {
      const cam = scene.cameras.main;
      const { cx, cy } = screenPos(focus, cam);
      ring.setScrollFactor(0);
      ring.lineStyle(4, 0xffd166, 1).strokeRoundedRect(cx - focus.w / 2 - 3, cy - focus.h / 2 - 3, focus.w + 6, focus.h + 6, 12);
    } else focus = null;
  };
  scene.events.on('update', onUpdate);
  scene.events.once('shutdown', () => {
    scene.events.off('update', onUpdate);
    registry.delete(scene);
  });
}
