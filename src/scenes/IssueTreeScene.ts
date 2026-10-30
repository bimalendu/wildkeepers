import Phaser from 'phaser';
import catalogue from '../data/catalogue.json';
import { IPBES_DRIVERS } from '../data/frameworks';
import { regionById, sourceLine, tierOne, type IssueDef } from '../data/regions';
import { badge, compareByPriority, priorityScore } from '../sim/priority';
import { BADGE_COLOR, COLORS, THEME_NAME, background, button, enableScroll, getSave, label, openDialog, panel, pin, relayoutOnResize } from './kit';
import { run } from './run';

export class IssueTreeScene extends Phaser.Scene {
  private regionId = '';

  constructor() {
    super('IssueTree');
  }

  init(data: { region?: string }): void {
    this.regionId = data.region ?? this.regionId;
  }

  create(): void {
    const region = regionById(this.regionId);
    if (!region) return void this.scene.start('WorldMap');
    background(this);
    relayoutOnResize(this, { region: this.regionId });
    run.back = { scene: 'IssueTree', data: { region: this.regionId } };
    const save = getSave(this);
    const W = this.scale.width;
    const w = Math.min(680, W - 24);
    const x = (W - w) / 2;
    const hdr = panel(this, 0, 0, W, 64, COLORS.panel);
    const title = label(this, x, 14, region.name, { size: 22, bold: true, width: w - 110 });
    const back = button(this, x + w - 90, 12, 90, 40, 'Back', () => this.scene.start('WorldMap'), { size: 14 });
    [hdr, title, back.container].forEach(pin);

    let y = 76;
    const intro = label(this, x, y, `${region.blurb}\n\nMissions open in order of priority: the most urgent problem first. Each problem has causes (drivers) and places and species at stake.`, { size: 14, color: COLORS.dim, width: w });
    y += intro.height + 16;

    const t1 = tierOne(region);
    t1.forEach((issue, n) => {
      const open = n === 0 || save.starsFor(t1[n - 1].mission!) > 0;
      const stars = save.starsFor(issue.mission!);
      const score = priorityScore(issue.priority);
      const b = badge(score);
      panel(this, x, y, w, 106, open ? COLORS.panel : 0x13261d);
      label(this, x + 14, y + 8, `${n + 1}. ${issue.title}`, { size: 17, bold: true, color: open ? COLORS.ink : COLORS.dim, width: w - 110 });
      const theme = label(this, x + 14, y + 36, THEME_NAME[issue.theme], { size: 13, color: COLORS.dim });
      label(this, x + 14 + theme.width + 10, y + 36, `${b} priority`, { size: 13, color: BADGE_COLOR[b], bold: true });
      label(this, x + w - 14, y + 10, '★'.repeat(stars) + '☆'.repeat(3 - stars), { size: 18, origin: [1, 0], color: COLORS.accent });
      button(this, x + 14, y + 60, (w - 40) / 2, 38, 'Details', () => this.details(issue), { size: 14 });
      button(this, x + 26 + (w - 40) / 2, y + 60, (w - 40) / 2, 38, open ? (stars ? 'Replay' : 'Start') : 'Locked', () => this.start(issue), { size: 14, enabled: open, fill: 0x2f8f5f });
      y += 116;
    });

    const t2 = region.issues.filter((i) => i.tier === 2).sort(compareByPriority);
    label(this, x, y + 6, 'MORE PROBLEMS IN THIS REGION (future missions)', { size: 13, color: COLORS.dim, bold: true });
    y += 34;
    for (const issue of t2) {
      const b = badge(priorityScore(issue.priority));
      panel(this, x, y, w, 44, 0x14291f);
      label(this, x + 12, y + 11, issue.title, { size: 14, width: w - 190 });
      label(this, x + w - 100, y + 12, b, { size: 13, origin: [1, 0], color: BADGE_COLOR[b], bold: true });
      button(this, x + w - 90, y + 5, 80, 34, 'Details', () => this.details(issue), { size: 13 });
      y += 52;
    }
    enableScroll(this, y + 20);
  }

  private start(issue: IssueDef): void {
    this.scene.start('Briefing', { missionId: issue.mission });
  }

  private details(issue: IssueDef): void {
    const lines: string[] = [];
    const b = badge(priorityScore(issue.priority));
    lines.push(`${THEME_NAME[issue.theme]}  ·  ${b} priority  ·  ${IPBES_DRIVERS[issue.driver].name}`);
    lines.push('', 'CAUSES (drivers)');
    for (const d of issue.drivers) lines.push(`• ${d.name}`);
    lines.push('', 'AT STAKE');
    for (const s of issue.sites) lines.push(`• ${s}`);
    if (issue.fact) lines.push('', 'FACT', issue.fact.text, `${sourceLine(issue.fact)} (checked ${issue.fact.checked})`);
    const covered = issue.catalogue.map((id) => catalogue.find((c) => c.id === id)?.name).filter(Boolean);
    if (covered.length) lines.push('', `Covers: ${covered.join('; ')}`);
    if (issue.tier === 2) lines.push('', 'This problem is on the map for a future mission.');
    const buttons = [{ label: 'Close', onTap: () => undefined }];
    if (issue.mission) buttons.unshift({ label: 'Go to mission', onTap: () => this.start(issue), primary: true } as never);
    openDialog(this, issue.title, lines.join('\n'), buttons);
  }
}
