import type { Page } from '@playwright/test';

type Pt = { x: number; y: number } | null;

/** Screen position of the Phaser text object whose text starts with `text`, in the active scene (looks inside containers). */
export async function findText(page: Page, text: string): Promise<Pt> {
  return page.evaluate((needle) => {
    const game = (window as unknown as { __game: any }).__game;
    const canvas = game.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const sx = rect.width / game.scale.width;
    const sy = rect.height / game.scale.height;
    for (const scene of game.scene.getScenes(true)) {
      const stack = [...scene.children.list];
      while (stack.length) {
        const o = stack.shift();
        if (o.list) stack.push(...o.list);
        if (typeof o.text === 'string' && o.text.startsWith(needle) && o.visible) {
          const m = o.getWorldTransformMatrix();
          const p = o.getCenter ? o.getCenter() : { x: o.x, y: o.y };
          const w = m.tx + (p.x - o.x);
          const h = m.ty + (p.y - o.y);
          return { x: rect.left + w * sx, y: rect.top + h * sy };
        }
      }
    }
    return null;
  }, text);
}

export async function clickText(page: Page, text: string): Promise<void> {
  const deadline = Date.now() + 8000;
  let p: Pt = null;
  while (Date.now() < deadline && !(p = await findText(page, text))) await page.waitForTimeout(100);
  if (!p) throw new Error(`no text starting with "${text}" on screen`);
  await page.mouse.click(p.x, p.y);
}

export async function activeScene(page: Page): Promise<string> {
  return page.evaluate(() => (window as unknown as { __game: any }).__game.scene.getScenes(true)[0]?.scene.key ?? '');
}

export async function waitForScene(page: Page, key: string): Promise<void> {
  await page.waitForFunction((k) => (window as unknown as { __game?: any }).__game?.scene.getScenes(true).some((s: any) => s.scene.key === k), key, { timeout: 10000 });
}

export async function tileCenter(page: Page, index: number): Promise<{ x: number; y: number }> {
  return page.evaluate((i) => {
    const game = (window as unknown as { __game: any }).__game;
    const scene = game.scene.getScene('Mission');
    const rect = (game.canvas as HTMLCanvasElement).getBoundingClientRect();
    const c = scene.view.center(i);
    return { x: rect.left + c.x * (rect.width / game.scale.width), y: rect.top + c.y * (rect.height / game.scale.height) };
  }, index);
}

