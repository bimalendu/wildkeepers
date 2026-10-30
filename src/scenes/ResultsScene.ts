import Phaser from 'phaser';
import { HOPE_CARDS as hope } from '../data/hope';
import { sourceLine } from '../data/regions';
import { ecoHealth, starChecks } from '../sim/engine';
import { COLORS, background, button, label, panel, relayoutOnResize, getSave, sound, footer } from './kit';
import { run } from './run';

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('Results');
  }

  create(): void {
    const s = run.state;
    if (!s) return void this.scene.start('Menu');
    background(this);
    relayoutOnResize(this);
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;
    const won = s.outcome === 'won';
    const stars = run.result?.stars ?? 0;
    const why = { extinction: 'A species was lost for good.', collapse: 'The ecosystem fell below the red line.' }[s.loseReason ?? 'collapse'];

    label(this, x + w / 2, 16, won ? 'Ecosystem saved!' : 'Not this time', { size: 32, bold: true, origin: [0.5, 0], color: won ? COLORS.good : COLORS.danger });
    label(this, x + w / 2, 62, won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : why, { size: won ? 30 : 17, origin: [0.5, 0], color: COLORS.accent });
    sound(this, won ? 'win' : 'lose');
    const c = starChecks(s);
    const pct = (v: number) => `${Math.round(v * 100)}%`;
    const lines: string[] = [
      `${c.survive ? '✓' : '○'} ★  Survive ${s.mission.turns} turns`,
      `${c.eco ? '✓' : '○'} ★★  Finish at least as healthy as you started (${pct(s.startEco)} → ${pct(ecoHealth(s))})`,
      `${c.stopped ? '✓' : '○'} ★★★  Every threat stopped`,
    ];
    if (won) lines.push('', `Impact earned: +${run.result?.impact ?? 0}`);
    if (won && !c.stopped) lines.push('Tip: a Campaign makes a threat 1 weaker for good. At 0 it has stopped.');
    // a Hope card: real recoveries show what sustained action achieves
    const card = hope.find((h) => h.id === 'ozone' && s.mission.hope) ?? hope[(s.mission.seed + s.turn) % hope.length];
    getSave(this).seeHope(card.id);
    const hopeText = `HOPE: ${card.title}\n${card.text}\nWhat worked: ${card.cause}\n${sourceLine(card)}`;
    const real = s.mission.realWorld ? `\n\nTHINGS YOU CAN DO\n${s.mission.realWorld}` : '';
    const body = label(this, x + 16, 118, `${lines.join('\n')}\n\n${hopeText}${real}`, { size: 15, width: w - 32 });
    panel(this, x, 108, w, body.height + 28);
    body.setDepth(1);
    footer(this, 108 + body.height + 44, (by) => [
      button(this, x, by, 160, 46, 'Continue', () => this.scene.start(run.back.scene, run.back.data), { size: 16 }),
      button(this, x + w - 200, by, 200, 46, won ? 'Replay' : 'Try again', () => this.scene.start('Briefing', { missionId: s.mission.id }), { size: 16, fill: 0x2f8f5f }),
    ]);
  }
}
