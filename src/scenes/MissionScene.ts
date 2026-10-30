import Phaser from 'phaser';
import { availableActions, costOf, labelOf, perform, whyNot, type ActionDef } from '../sim/actions';
import { ecoHealth, endTurn, stars as starsOf } from '../sim/engine';
import { BEHAVIOUR_NAME, ruleText } from '../sim/rules';
import { strengthOf } from '../sim/threats';
import { isBuilt } from '../sim/types';
import { BIOME_NAME, COLORS, HEALTH_NAME, background, button, buzz, getSave, isPortrait, label, panel, relayoutOnResize, sound, textScale, type Button } from './kit';
import { HexView } from './HexView';
import { HexGrid } from '../sim/hex';
import type { PadEvent } from '../input/pad';
import type { PadScene } from './padNav';
import { run } from './run';
import { THREAT_NAME } from './names';

const HUD_H = 112;

export class MissionScene extends Phaser.Scene implements PadScene {
  private view!: HexView;
  private get selected(): number {
    return run.ui.selected;
  }
  private set selected(i: number) {
    run.ui.selected = i;
  }
  private armed: ActionDef | null = null;
  private hud!: Phaser.GameObjects.Text;
  private speciesRow!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;
  private barRect = { x: 0, y: 0, w: 0, h: 0 };
  private msg!: Phaser.GameObjects.Text;
  private threatsText!: Phaser.GameObjects.Text;
  private overlay: Phaser.GameObjects.GameObject[] = [];
  private actionButtons: { def: ActionDef; button: Button }[] = [];
  private panelRect = { x: 0, y: 0, w: 0, h: 0 };
  private busy = false;

  constructor() {
    super('Mission');
  }

  create(): void {
    const s = run.state;
    if (!s) return void this.scene.start('Menu');
    background(this);
    this.overlay = [];
    this.actionButtons = [];
    this.armed = null;
    this.busy = false;
    relayoutOnResize(this);

    const W = this.scale.width;
    const H = this.scale.height;
    const portrait = isPortrait(this);
    const ts = textScale(this);
    const panelW = portrait ? W : Math.min(460, Math.max(340, W * 0.36));
    const panelH = portrait ? Math.min(400 + (ts - 1) * 250, Math.max(300, H * 0.44) + (ts - 1) * 260) : H - HUD_H;
    this.panelRect = portrait ? { x: 0, y: H - panelH, w: W, h: panelH } : { x: W - panelW, y: HUD_H, w: panelW, h: panelH };
    const mapRect = portrait ? { x: 6, y: HUD_H, w: W - 12, h: H - HUD_H - panelH } : { x: 6, y: HUD_H + 6, w: W - panelW - 12, h: H - HUD_H - 12 };

    // HUD: turn and Energy, the ecosystem bar with its red line, and the species hearts
    panel(this, 0, 0, W, HUD_H - 4, COLORS.panel);
    this.hud = label(this, 12, 8, '', { size: 17, bold: true, maxScale: 1.2 });
    this.barRect = { x: 12, y: 40, w: W - 24, h: 16 };
    this.bar = this.add.graphics();
    this.speciesRow = label(this, 12, 78, '', { size: 14, width: W - 24, maxScale: 1.2 });
    button(this, W - 168, 4, 76, 30, 'Rules', () => this.openRules(), { size: 13 });
    button(this, W - 88, 4, 76, 30, 'Menu', () => this.openMenu(), { size: 13 });

    this.view = new HexView(this, mapRect, s.mission.size[0], s.mission.size[1]);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointer(p));

    panel(this, this.panelRect.x + 4, this.panelRect.y + 4, this.panelRect.w - 8, this.panelRect.h - 8, COLORS.panel);
    this.buildActions();
    this.threatsText = label(this, this.panelRect.x + 16, 0, '', { size: 13, width: this.panelRect.w - 32, maxScale: 1.2 });
    this.msg = label(this, this.panelRect.x + 16, 0, '', { size: 14, color: COLORS.dim, width: this.panelRect.w - 32, maxScale: 1.2 });
    button(this, this.panelRect.x + 12, this.panelRect.y + this.panelRect.h - 60, this.panelRect.w - 24, 48, 'End turn', () => this.finishTurn(), { size: 18, fill: 0x2f8f5f });
    this.input.keyboard?.on('keydown-ENTER', () => this.finishTurn());
    this.input.keyboard?.on('keydown-ESC', () => this.openMenu());

    this.refresh();
    this.say(this.tip() ?? 'Tap a tile, then choose an action. Red arrows show what happens when you end the turn.');
    this.maybeShowEvent();
  }

  private tip(): string | null {
    const s = run.state!;
    const hints = s.mission.hints;
    return hints && s.turn - 1 < hints.length ? `Tip: ${hints[s.turn - 1]}` : null;
  }

  private say(text: string): void {
    this.msg.setText(text);
    this.layoutBody();
  }

  /** The five action buttons: a grid at the top of the panel. */
  private buildActions(): void {
    const s = run.state!;
    const { x, y, w } = this.panelRect;
    const list = availableActions(s);
    const ts = textScale(this);
    const cols = ts > 1.1 && w < 560 ? 2 : Math.min(3, list.length); // bigger text needs wider buttons
    const bw = (w - 24 - (cols - 1) * 6) / cols;
    const bh = 54 + (ts - 1) * 40;
    list.forEach((a, i) => {
      const b = button(this, x + 12 + (i % cols) * (bw + 6), y + 12 + Math.floor(i / cols) * (bh + 6), bw, bh, '', () => this.chooseAction(a), {
        size: 13,
        maxScale: 1.2,
        onBlocked: () => this.say(this.blockedReason(a)),
      });
      this.actionButtons.push({ def: a, button: b });
    });
    this.actionsBottom = y + 12 + Math.ceil(list.length / cols) * (bh + 6);
  }
  private actionsBottom = 0;

  private blockedReason(a: ActionDef): string {
    const s = run.state!;
    if (s.outcome !== 'playing') return 'The mission is over.';
    return `${labelOf(s.mission, a.id)} needs ${a.cost}⚡ and you have ${s.energy}.`;
  }

  private layoutBody(): void {
    const { x, y, h } = this.panelRect;
    const bottom = y + h - 60 - 10;
    this.msg.setPosition(x + 16, bottom - this.msg.height);
    this.threatsText.setPosition(x + 16, Math.min(this.actionsBottom + 4, this.msg.y - this.threatsText.height - 6));
  }

  /** Redraws the map, HUD and action buttons from the game state. */
  private refresh(): void {
    const s = run.state!;
    const pips = '●'.repeat(Math.max(0, s.energy)) + '○'.repeat(Math.max(0, s.mission.energy - s.energy));
    this.hud.setText(`Turn ${s.turn}/${s.mission.turns}      ⚡ ${pips}`);
    this.drawBar();
    this.speciesRow.setText(
      s.species.map((sp) => `${sp.def.name} ${sp.extinct ? 'gone' : '♥'.repeat(sp.hearts) + '♡'.repeat(Math.max(0, 3 - sp.hearts))} ${sp.healthy}/${sp.def.need}`).join('     '),
    );
    this.view.draw(s, { selected: this.selected, patterns: getSave(this).settings.patterns });
    for (const { def, button: b } of this.actionButtons) {
      const cost = costOf(s, def.id, def.target === 'tile' ? this.selected : -1);
      b.setLabel(`${def.icon} ${labelOf(s.mission, def.id)}\n${cost}⚡`);
      b.setEnabled(s.outcome === 'playing' && s.energy >= cost);
      b.setSelected(this.armed?.id === def.id);
    }
    this.threatsText.setText(
      s.mission.threats
        .map((t) => {
          const str = strengthOf(s, t);
          return `▸ ${t.label}: ${BEHAVIOUR_NAME[t.behaviour]}${str > 0 ? ` ${str}` : ''}${str === 0 ? ' (stopped)' : ''}`;
        })
        .join('\n'),
    );
    this.layoutBody();
  }

  /** The ecosystem bar: a red line at the floor, a tick where it started. */
  private drawBar(): void {
    const s = run.state!;
    const { x, y, w, h } = this.barRect;
    const eco = ecoHealth(s);
    const g = this.bar;
    g.clear();
    g.fillStyle(0x0d1d15, 1).fillRoundedRect(x, y, w, h, 6);
    const low = eco < s.mission.floor + 0.08;
    g.fillStyle(low ? 0xef476f : eco >= s.startEco ? 0x7bd88f : 0xffd166, 1).fillRoundedRect(x, y, Math.max(4, w * eco), h, 6);
    g.lineStyle(3, 0xef476f, 1).lineBetween(x + w * s.mission.floor, y - 4, x + w * s.mission.floor, y + h + 4);
    g.lineStyle(2, 0xffffff, 1).lineBetween(x + w * s.startEco, y - 2, x + w * s.startEco, y + h + 2);
    if (!this.barLabel) this.barLabel = label(this, x + w, y + h + 2, '', { size: 11, color: COLORS.dim, origin: [1, 0], maxScale: 1.2 });
    this.barLabel.setText(`Ecosystem ${Math.round(eco * 100)}%   red line ${Math.round(s.mission.floor * 100)}%   start ${Math.round(s.startEco * 100)}%`);
  }
  private barLabel?: Phaser.GameObjects.Text;

  // ------------------------------------------------------------------ input

  /** While a dialog is open, the controller moves between its buttons only. */
  padScope(): Phaser.GameObjects.GameObject[] | null {
    return this.overlay.length ? this.overlay : null;
  }

  /** Controller: stick or D-pad moves the tile cursor, LB/RB pick an action, A uses it, Y ends the turn, Start pauses, B cancels. */
  padInput(ev: PadEvent): boolean {
    const s = run.state;
    if (!s) return false;
    if (this.overlay.length) {
      if (ev.kind === 'button' && ev.button === 'b') (this.closeOverlay(), sound(this, 'click'));
      return ev.kind === 'button' && ev.button === 'b';
    }
    if (this.busy || s.outcome !== 'playing') return true;
    if (ev.kind === 'dir') {
      const g = new HexGrid(s.mission.size[0], s.mission.size[1]);
      const from = this.selected >= 0 ? this.selected : g.index(Math.floor(g.w / 2), Math.floor(g.h / 2));
      const { c, r } = g.hex(from);
      const [nc, nr] = ev.dir === 'left' ? [c - 1, r] : ev.dir === 'right' ? [c + 1, r] : ev.dir === 'up' ? [c, r - 1] : [c, r + 1];
      this.selected = this.selected < 0 ? from : g.inBounds(nc, nr) ? g.index(nc, nr) : from;
      this.refresh();
      this.describeTile(this.selected);
      return true;
    }
    const list = this.actionButtons.map((x) => x.def);
    switch (ev.button) {
      case 'a':
        if (this.selected < 0) break;
        if (this.armed) {
          const a = this.armed;
          this.armed = null;
          this.doAction(a, this.selected);
        } else this.describeTile(this.selected);
        break;
      case 'lb':
      case 'rb': {
        const at = this.armed ? list.findIndex((d) => d.id === this.armed!.id) : -1;
        const a = list[(at + (ev.button === 'rb' ? 1 : list.length - 1) + list.length) % list.length];
        if (a.target === 'threat') this.chooseAction(a);
        else {
          this.armed = a;
          this.refresh();
          const why = this.selected >= 0 ? whyNot(s, a.id, this.selected) : null;
          this.say(`${labelOf(s.mission, a.id)}: ${a.desc}\n${why ? `${why} ` : 'Press A to use it on the selected tile.'}`);
        }
        break;
      }
      case 'y': this.finishTurn(); break;
      case 'start': this.openMenu(); break;
      case 'b':
        this.armed = null;
        this.refresh();
        break;
    }
    return true;
  }

  private onPointer(p: Phaser.Input.Pointer): void {
    if (this.busy || this.overlay.length) return;
    const s = run.state!;
    if (s.outcome !== 'playing') return;
    const i = this.view.tileAt(p.x, p.y);
    if (i < 0) return;
    this.selected = i;
    if (this.armed) {
      const a = this.armed;
      this.armed = null;
      this.doAction(a, i);
      return;
    }
    this.refresh();
    this.describeTile(i);
  }

  private describeTile(i: number): void {
    const s = run.state!;
    const t = s.tiles[i];
    const bits = [BIOME_NAME[t.biome]];
    if (!isBuilt(t.biome)) bits.push(HEALTH_NAME[t.health]);
    if (t.protected) bits.push('Protected');
    if (t.defended) bits.push('Defended this turn');
    if (t.risky) bits.push('⚠ risky for activists: +1⚡');
    if (s.species.some((sp) => sp.homes.includes(i))) bits.push('🐾 a species home');
    let text = bits.join(' · ');
    if (t.threat) {
      const def = s.mission.threats.find((d) => d.id === t.threat);
      if (def) text += `\n${def.label} (${THREAT_NAME[def.kind]}). ${ruleText(def, strengthOf(s, def))}`;
    }
    this.say(text);
  }

  private chooseAction(a: ActionDef): void {
    const s = run.state!;
    if (s.outcome !== 'playing' || this.busy) return;
    const name = labelOf(s.mission, a.id);
    if (a.target === 'threat') {
      this.say(`${name}: ${a.desc}`);
      const options = s.mission.threats.map((t, i) => ({ name: `${t.label}  ·  strength ${strengthOf(s, t)}`, i, ok: !whyNot(s, a.id, i) }));
      return this.pick(`${name}: which threat?`, options, (i) => this.doAction(a, i));
    }
    if (this.selected >= 0 && !whyNot(s, a.id, this.selected)) return void this.doAction(a, this.selected);
    this.armed = a;
    this.refresh();
    const why = this.selected >= 0 ? whyNot(s, a.id, this.selected) : null;
    this.say(`${name}: ${a.desc}\n${why ? `${why} ` : ''}Tap a tile to use it.`);
  }

  private pick(title: string, options: { name: string; i: number; ok: boolean }[], onPick: (i: number) => void): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const w = Math.min(520, W - 32);
    const bh = 46;
    const h = 70 + options.length * (bh + 8) + 60;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive();
    const box = panel(this, x, y, w, h, COLORS.panel);
    const head = label(this, x + 16, y + 14, title, { size: 16, bold: true, width: w - 32 });
    const items: Phaser.GameObjects.GameObject[] = [shade, box, head];
    options.forEach((o, k) => {
      const b = button(this, x + 16, y + 56 + k * (bh + 8), w - 32, bh, o.name, () => {
        this.closeOverlay();
        onPick(o.i);
      }, { size: 14, enabled: o.ok, align: 'left' });
      items.push(b.container);
    });
    items.push(button(this, x + 16, y + h - 54, w - 32, 42, 'Cancel', () => this.closeOverlay(), { size: 14 }).container);
    this.overlay = items;
  }

  private closeOverlay(): void {
    for (const o of this.overlay) o.destroy();
    this.overlay = [];
  }

  private doAction(a: ActionDef, target: number): void {
    const s = run.state!;
    const r = perform(s, a.id, target);
    buzz(this, r.ok ? 12 : 40);
    sound(this, r.ok ? 'ok' : 'error');
    this.refresh();
    this.say(r.message);
  }

  private maybeShowEvent(): void {
    const s = run.state!;
    if (!s.event || run.ui.lastEventTurn === s.turn) return;
    run.ui.lastEventTurn = s.turn;
    this.modal(s.event.title, s.event.text, 'Continue');
  }

  private modal(title: string, text: string, ok: string, onOk?: () => void): void {
    const W = this.scale.width;
    const H = this.scale.height;
    const w = Math.min(480, W - 32);
    const h = 230;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive();
    const box = panel(this, x, y, w, h, COLORS.panel);
    const head = label(this, x + 16, y + 14, title, { size: 18, bold: true, color: COLORS.accent, width: w - 32 });
    const body = label(this, x + 16, y + 52, text, { size: 15, width: w - 32 });
    const b = button(this, x + 16, y + h - 58, w - 32, 44, ok, () => {
      this.closeOverlay();
      onOk?.();
    }, { size: 16, fill: 0x2f8f5f });
    this.overlay = [shade, box, head, body, b.container];
  }

  private openRules(): void {
    if (this.overlay.length) return;
    this.scene.start('HowToPlay', { next: 'Mission' });
  }

  private openMenu(): void {
    if (this.overlay.length) return;
    const W = this.scale.width;
    const H = this.scale.height;
    const w = Math.min(420, W - 32);
    const h = 230;
    const x = (W - w) / 2;
    const y = (H - h) / 2;
    const shade = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setOrigin(0).setInteractive();
    const box = panel(this, x, y, w, h, COLORS.panel);
    const head = label(this, x + 16, y + 14, 'Paused', { size: 20, bold: true, width: w - 32 });
    const resume = button(this, x + 16, y + 56, w - 32, 44, 'Resume', () => this.closeOverlay(), { size: 16, fill: 0x2f8f5f });
    const retry = button(this, x + 16, y + 108, w - 32, 44, 'Restart mission', () => {
      this.closeOverlay();
      this.scene.start('Briefing', { missionId: run.state!.mission.id });
    }, { size: 16 });
    const quit = button(this, x + 16, y + 160, w - 32, 44, 'Back to campaign', () => this.scene.start(run.back.scene, run.back.data), { size: 16 });
    this.overlay = [shade, box, head, resume.container, retry.container, quit.container];
  }

  // ------------------------------------------------------------------ turn

  private finishTurn(): void {
    const s = run.state!;
    if (this.busy || s.outcome !== 'playing' || this.overlay.length) return;
    this.armed = null;
    sound(this, 'turn');
    endTurn(s);
    this.refresh();
    if (s.outcome !== 'playing') {
      this.busy = true;
      const stars = starsOf(s);
      const impact = stars > 0 ? getSave(this).recordMission(s.mission.id, stars) : 0;
      run.result = { stars, impact };
      this.time.delayedCall(getSave(this).settings.reduceMotion ? 100 : 900, () => this.scene.start('Results'));
      return;
    }
    const tip = this.tip();
    this.say([...s.log.slice(0, 3), tip ?? ''].filter(Boolean).join('\n') || 'A new turn begins.');
    this.maybeShowEvent();
  }
}
