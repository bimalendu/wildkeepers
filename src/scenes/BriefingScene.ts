import { activePerks } from '../sim/perks';
import Phaser from 'phaser';
import { missionById } from '../levels';
import { createGame, ecoHealth } from '../sim/engine';
import { BEHAVIOUR_NAME, ruleText } from '../sim/rules';
import { BIOME_NAME, background, button, getSave, label, panel, relayoutOnResize, footer } from './kit';
import { THREAT_NAME } from './names';
import { run } from './run';

export class BriefingScene extends Phaser.Scene {
  private missionId = '';

  constructor() {
    super('Briefing');
  }

  init(data: { missionId?: string }): void {
    this.missionId = data.missionId ?? this.missionId;
  }

  create(): void {
    const m = missionById(this.missionId);
    if (!m) return void this.scene.start('WorldMap');
    background(this);
    relayoutOnResize(this, { missionId: this.missionId });
    const W = this.scale.width;
    const w = Math.min(640, W - 24);
    const x = (W - w) / 2;
    const start = ecoHealth(createGame(m));
    label(this, x, 16, m.title, { size: 26, bold: true, width: w });
    const lines: string[] = [m.blurb, '', ...(m.hope ? ['HOPE MISSION: a real recovery, so it starts healthy and is short.', ''] : []), 'YOUR GOAL'];
    lines.push(`• Survive ${m.turns} turns, with ${m.energy}⚡ Energy each turn.`);
    lines.push(`• Keep the ecosystem above ${Math.round(m.floor * 100)}% (it starts at ${Math.round(start * 100)}%).`);
    lines.push('• Keep every species alive.', '', 'WHAT IS AT STAKE');
    for (const sp of m.species) lines.push(`• ${sp.name} (3 ♥): needs ${sp.need} Healthy tiles of ${sp.habitat.map((h) => BIOME_NAME[h].toLowerCase()).join(' or ')}.`);
    lines.push('', 'WHAT IS THREATENING IT');
    for (const t of m.threats) lines.push(`• ${t.label} (${THREAT_NAME[t.kind]}) · ${BEHAVIOUR_NAME[t.behaviour]}\n   ${ruleText(t)}`);
    const perks = activePerks(getSave(this).data.perks);
    if (perks.length) lines.push('', 'YOUR MOVEMENT HQ PERKS', ...perks.map((p) => `• ${p}`));
    const body = label(this, x + 16, 74, lines.join('\n'), { size: 15, width: w - 32 });
    panel(this, x, 62, w, body.height + 28);
    body.setDepth(1);
    footer(this, 62 + body.height + 44, (by) => [
      button(this, x, by, 84, 46, 'Back', () => this.scene.start(run.back.scene, run.back.data), { size: 15 }),
      button(this, x + 92, by, 96, 46, 'Rules', () => this.scene.start('HowToPlay', { next: 'Briefing', nextData: { missionId: this.missionId } }), { size: 15 }),
      button(this, x + 196, by, w - 196, 46, 'Begin mission', () => {
        run.state = createGame(m, getSave(this).data.perks);
        run.result = null;
        run.ui = { selected: -1, lastEventTurn: 0 };
        // the rulebook opens by itself once, before the very first mission
        if (!getSave(this).data.rulesSeen) this.scene.start('HowToPlay', { next: 'Mission', missionStart: true });
        else this.scene.start('Mission');
      }, { size: 17, fill: 0x2f8f5f }),
    ]);
  }
}
