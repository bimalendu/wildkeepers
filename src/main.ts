import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import Phaser from 'phaser';
import './style.css';
import { SaveStore } from './save/SaveStore';
import { initPwa } from './pwa';
import { BootScene } from './scenes/BootScene';
import { BriefingScene } from './scenes/BriefingScene';
import { CampaignScene } from './scenes/CampaignScene';
import { HQScene } from './scenes/HQScene';
import { FieldGuideScene } from './scenes/FieldGuideScene';
import { HowToPlayScene } from './scenes/HowToPlayScene';
import { IssueTreeScene } from './scenes/IssueTreeScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { CreditsScene } from './scenes/CreditsScene';
import { MenuScene } from './scenes/MenuScene';
import { MissionScene } from './scenes/MissionScene';
import { ResultsScene } from './scenes/ResultsScene';
import { run } from './scenes/run';
import { SettingsScene } from './scenes/SettingsScene';

const storage = (() => {
  try {
    return window.localStorage; // can throw when storage is blocked (private windows, strict privacy settings)
  } catch {
    return null;
  }
})();
const save = new SaveStore(storage, window.matchMedia('(prefers-reduced-motion: reduce)').matches);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#10261c',
  scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
  disableContextMenu: true,
  input: { activePointers: 2 },
  scene: [BootScene, MenuScene, WorldMapScene, IssueTreeScene, CampaignScene, BriefingScene, MissionScene, ResultsScene, SettingsScene, CreditsScene, HowToPlayScene, HQScene, FieldGuideScene],
  callbacks: {
    preBoot: (g) => g.registry.set('save', save),
  },
});

initPwa();

// Test hook for Playwright: available in dev, or in any build via ?debug.
if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
  Object.assign(window, { __game: game, __wkRun: run });
}
