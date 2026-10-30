import { ACTIONS } from './actions';
import type { Behaviour, ThreatDef } from './types';

/** The whole rulebook. It must stay at 8 lines or fewer (a test enforces it): if a rule does not fit, the rule is too complicated. */
export const RULEBOOK: string[] = [
  'Goal: survive the turns shown. Keep the ecosystem bar above the red line and keep every species alive.',
  'Each turn you get ⚡ Energy to spend on actions. Unspent Energy is lost.',
  'Tiles are Healthy, Damaged or Lost. Each threat hit moves a tile down one step.',
  'Red arrows show exactly where every threat will strike when you end your turn. Nothing is hidden.',
  'Each species needs a number of Healthy tiles of its habitat. With fewer, it loses a ♥ every turn. At 0 ♥ it is gone.',
  `Actions: ${ACTIONS.map((a) => `${a.label} ${a.cost}⚡`).join(' · ')}.`,
  'Tiles marked ⚠ are risky for activists: acting there costs +1⚡.',
  'Stars: ★ survive · ★★ finish at least as healthy as you started · ★★★ every threat stopped.',
];

export const BEHAVIOUR_NAME: Record<Behaviour, string> = { spread: 'Spread', flow: 'Flow', hunt: 'Hunt', strike: 'Strike' };

/** The one-line rule shown on a threat's card in the Briefing and in the tile tooltip. */
export function ruleText(def: Pick<ThreatDef, 'behaviour' | 'strength' | 'lifetime'>, strength = def.strength): string {
  const n = (word: string) => `${strength} ${word}${strength === 1 ? '' : 's'}`;
  switch (def.behaviour) {
    case 'spread':
      return `Each turn it grows onto ${n('tile')} next to it.` + (def.lifetime ? ` Each burns out after ${def.lifetime} turns.` : '');
    case 'flow':
      return `Each turn it flows ${n('tile')} downstream, hurting every tile it passes.`;
    case 'hunt':
      return `Each hunter moves ${n('step')} a turn toward a 🐾 home. If it gets there, that species loses a ♥. Defend or Protect turns it back.`;
    case 'strike':
      return `On the turn shown it hits ${n('marked tile')}. Protect does not help; Defend does.`;
  }
}
