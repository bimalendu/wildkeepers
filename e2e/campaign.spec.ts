import { expect, test } from '@playwright/test';
import { clickText, findText, tileCenter, waitForScene } from './helpers';

const open = async (page: import('@playwright/test').Page) => {
  await page.goto('./?debug');
  await waitForScene(page, 'Menu');
};

test('menu -> campaign -> briefing -> mission -> results', async ({ page }) => {
  await open(page);
  await clickText(page, 'Play');
  await waitForScene(page, 'WorldMap');
  await clickText(page, 'Open');
  await waitForScene(page, 'Campaign');
  await clickText(page, 'Start');
  await waitForScene(page, 'Briefing');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'HowToPlay'); // the rulebook opens by itself before the first mission
  expect(await findText(page, 'How to play')).not.toBeNull();
  expect(await findText(page, '1.  Goal')).not.toBeNull();
  await clickText(page, 'Start the mission');
  await waitForScene(page, 'Mission');
  expect(await findText(page, 'Turn 1/')).not.toBeNull();

  // Do nothing until the mission ends: the forest is lost, so we reach Results.
  for (let i = 0; i < 30; i++) {
    const active = await page.evaluate(() => (window as any).__game.scene.getScenes(true).map((s: any) => s.scene.key));
    if (active.includes('Results')) break;
    const end = await findText(page, 'End turn');
    if (end) await page.mouse.click(end.x, end.y);
    await page.waitForTimeout(120);
  }
  await waitForScene(page, 'Results');
  expect(await findText(page, 'Not this time')).not.toBeNull();
});

test('tapping a tile and restoring it improves the tile', async ({ page }) => {
  await open(page);
  await clickText(page, 'Play');
  await clickText(page, 'Open');
  await clickText(page, 'Start');
  await clickText(page, 'Begin mission');
  await clickText(page, 'Start the mission');
  await waitForScene(page, 'Mission');
  // pick a damaged natural tile
  const idx = await page.evaluate(() => {
    const s = (window as any).__game.scene.getScene('Mission');
    void s;
    const st = (window as any).__wkRun?.state;
    return st ? st.tiles.findIndex((t: any) => t.biome === 'forest' && t.health < 2) : -1;
  });
  expect(idx).toBeGreaterThanOrEqual(0);
  const before = await page.evaluate((i) => (window as any).__wkRun.state.tiles[i].health, idx);
  const p = await tileCenter(page, idx);
  await page.mouse.click(p.x, p.y);
  await clickText(page, '🌱 Replant');
  const after = await page.evaluate((i) => (window as any).__wkRun.state.tiles[i].health, idx);
  expect(after).toBe(before + 1);
});

test('progress survives a reload and unlocks the next mission', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('wildkeepers:save', JSON.stringify({ version: 2, impact: 20, stars: { 'prologue-1': 2 }, rulesSeen: true })));
  await page.reload();
  await waitForScene(page, 'Menu');
  await clickText(page, 'Play');
  await waitForScene(page, 'WorldMap');
  await clickText(page, 'Open');
  await waitForScene(page, 'Campaign');
  expect(await findText(page, 'Replay')).not.toBeNull();
  expect(await findText(page, 'Start')).not.toBeNull(); // mission 2 is now open
  expect(await findText(page, 'Locked')).not.toBeNull(); // mission 3 still locked
});

test('after the Prologue a region opens, shows its Issue Tree in priority order, and starts a mission', async ({ page }) => {
  await open(page);
  await page.evaluate(() =>
    localStorage.setItem('wildkeepers:save', JSON.stringify({ version: 2, impact: 90, stars: { 'prologue-1': 3, 'prologue-2': 3, 'prologue-3': 3 }, rulesSeen: true })),
  );
  await page.reload();
  await waitForScene(page, 'Menu');
  await clickText(page, 'Play');
  await waitForScene(page, 'WorldMap');
  // the second 'Open' button belongs to Latin America (the first is the Prologue)
  const opens = await page.evaluate(() => {
    const game = (window as any).__game;
    const rect = game.canvas.getBoundingClientRect();
    const out: { x: number; y: number }[] = [];
    const stack = [...game.scene.getScenes(true)[0].children.list];
    while (stack.length) {
      const o = stack.shift();
      if (o.list) stack.push(...o.list);
      if (o.text === 'Open') {
        const m = o.getWorldTransformMatrix();
        out.push({ x: rect.left + m.tx + o.displayWidth / 2, y: rect.top + m.ty + o.displayHeight / 2 });
      }
    }
    return out;
  });
  expect(opens.length).toBeGreaterThanOrEqual(2);
  await page.mouse.click(opens[1].x, opens[1].y);
  await waitForScene(page, 'IssueTree');
  expect(await findText(page, '1. The Arc of Deforestation')).not.toBeNull();
  expect(await findText(page, '2. The Frog Fungus')).not.toBeNull();
  await clickText(page, 'Start');
  await waitForScene(page, 'Briefing');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'Mission');
  expect(await findText(page, 'Turn 1/')).not.toBeNull();
});

test('the plan arrows tell the truth: ending the turn changes exactly the planned tiles', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('wildkeepers:save', JSON.stringify({ version: 2, rulesSeen: true })));
  await page.reload();
  await waitForScene(page, 'Menu');
  await clickText(page, 'Play');
  await clickText(page, 'Open');
  await clickText(page, 'Start');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'Mission');
  const result = await page.evaluate(() => {
    const st = (window as any).__wkRun.state;
    const planned = new Set<number>(Object.values(st.plan).flatMap((items: any) => items.flatMap((it: any) => it.path)));
    const before = st.tiles.map((t: any) => t.health);
    return { planned: [...planned], before };
  });
  expect(result.planned.length).toBeGreaterThan(0);
  await clickText(page, 'End turn');
  const changed = await page.evaluate((before: number[]) => (window as any).__wkRun.state.tiles.flatMap((t: any, i: number) => (t.health !== before[i] ? [i] : [])), result.before);
  for (const i of changed) expect(result.planned).toContain(i);
  expect(changed.length).toBeGreaterThan(0);
});

test('the Rules button opens the rulebook and comes back to the same mission', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('wildkeepers:save', JSON.stringify({ version: 2, rulesSeen: true })));
  await page.reload();
  await waitForScene(page, 'Menu');
  await clickText(page, 'Play');
  await clickText(page, 'Open');
  await clickText(page, 'Start');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'Mission');
  await clickText(page, 'Rules');
  await waitForScene(page, 'HowToPlay');
  await clickText(page, 'Got it');
  await waitForScene(page, 'Mission');
  expect(await findText(page, 'Turn 1/')).not.toBeNull();
});

test('the tile pictures load with no failed requests and the mission screen draws them', async ({ page }) => {
  const failed: string[] = [];
  page.on('requestfailed', (r) => failed.push(r.url()));
  page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  await open(page);
  await page.evaluate(() => localStorage.setItem('wildkeepers:save', JSON.stringify({ version: 2, rulesSeen: true })));
  await page.reload();
  await waitForScene(page, 'Menu');
  await clickText(page, 'Play');
  await clickText(page, 'Open');
  await clickText(page, 'Start');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'Mission');
  const shown = await page.evaluate(() => {
    const scene = (window as any).__game.scene.getScene('Mission');
    const imgs = scene.children.list.filter((o: any) => o.type === 'Image' && o.visible);
    return { images: imgs.length, tiles: (window as any).__wkRun.state.tiles.length };
  });
  expect(shown.images).toBeGreaterThanOrEqual(shown.tiles); // at least one picture per tile
  expect(failed.filter((u) => u.includes('/tiles/'))).toEqual([]);
});

test('the Movement HQ and the Field Guide open from the menu', async ({ page }) => {
  await open(page);
  await clickText(page, 'Movement HQ');
  await waitForScene(page, 'HQ');
  expect(await findText(page, 'Volunteers')).not.toBeNull();
  expect(await findText(page, 'Needs 30 Impact')).not.toBeNull(); // a new player cannot afford anything yet
  await clickText(page, 'Menu');
  await waitForScene(page, 'Menu');
  await clickText(page, 'Field Guide');
  await waitForScene(page, 'FieldGuide');
  expect(await findText(page, '0 of ')).not.toBeNull();
  await clickText(page, 'Menu');
  await waitForScene(page, 'Menu');
});

test('a controller can drive the menu: D-pad moves focus, A presses, B goes back', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { down: [] as number[] };
    (window as any).__padDown = (...b: number[]) => (state.down = b);
    navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: state.down.includes(i), touched: false, value: 0 })) } as any];
  });
  await open(page);
  const tap = async (...b: number[]) => {
    await page.evaluate((x) => (window as any).__padDown(...x), b);
    await page.waitForTimeout(120);
    await page.evaluate(() => (window as any).__padDown());
    await page.waitForTimeout(120);
  };
  await tap(0); // A: the first press shows the focus ring on the first button (Play)
  await tap(13); // D-pad down: Movement HQ
  await tap(0); // A: press it
  await waitForScene(page, 'HQ');
  await tap(1); // B: back to the menu
  await waitForScene(page, 'Menu');
});

test('a controller can play a turn: move the cursor, pick an action with RB, use it with A, end the turn with Y', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { down: [] as number[] };
    (window as any).__padDown = (...b: number[]) => (state.down = b);
    navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: state.down.includes(i), touched: false, value: 0 })) } as any];
  });
  await open(page);
  await clickText(page, 'Play');
  await waitForScene(page, 'WorldMap');
  await clickText(page, 'Open');
  await waitForScene(page, 'Campaign');
  await clickText(page, 'Start');
  await waitForScene(page, 'Briefing');
  await clickText(page, 'Begin mission');
  await waitForScene(page, 'HowToPlay');
  await clickText(page, 'Start the mission');
  await waitForScene(page, 'Mission');
  const tap = async (...b: number[]) => {
    await page.evaluate((x) => (window as any).__padDown(...x), b);
    await page.waitForTimeout(100);
    await page.evaluate(() => (window as any).__padDown());
    await page.waitForTimeout(100);
  };
  const snap = () => page.evaluate(() => { const s = (window as any).__wkRun.state; return { energy: s.energy, turn: s.turn, selected: (window as any).__wkRun.ui.selected }; });
  const before = await snap();
  await tap(13); // down: a tile gets selected
  expect((await snap()).selected).toBeGreaterThanOrEqual(0);
  await tap(5); // RB: arm an action (Restore)
  await tap(0); // A: use it on the selected tile
  const after = await snap();
  expect(after.energy).toBeLessThanOrEqual(before.energy);
  await tap(3); // Y: end turn
  expect((await snap()).turn).toBe(before.turn + 1);
});
