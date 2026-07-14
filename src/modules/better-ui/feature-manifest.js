import { addStyles, isLegacyHUD } from '@utils';

import adventurebook from './modules/adventure-book';
import codexAtBottom from './modules/codex-at-bottom';
import eggMaster from './modules/egg-master';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import largerSkinImages from './modules/larger-skin-images';
import maintenance from './modules/maintenance';
import randomSkinButton from './modules/random-skin-button';
import showUnownedSkins from './modules/show-unowned-skins';
import skinPreviewBase from './modules/skin-preview-base';
import tournamentTrophies from './modules/tournament-trophies';
import userscriptStyles from './modules/userscripts-styles';

import largerCodicesStyles from './modules/larger-codices/styles.css';
import legacyStyles from './modules/legacy-styles/styles.css';
import squareProfilePicsStyles from './modules/square-profile-pics/styles.css';
import trapGradientBackgroundStyles from './modules/trap-gradient-background/styles.css';

const featureManifest = [
  { id: 'adventure-book', load: adventurebook },
  { id: 'friends', load: friends },
  { id: 'kings-promo', load: kingsPromo },
  { id: 'maintenance', load: maintenance },
  { id: 'userscript-styles', load: userscriptStyles },
  { id: 'random-skin-button', load: randomSkinButton },
  { id: 'skin-preview-base', load: skinPreviewBase },
  { id: 'tournament-trophies', load: tournamentTrophies },
  { id: 'codex-at-bottom', setting: 'better-ui.codex-at-bottom', default: true, load: codexAtBottom },
  { id: 'hud', setting: 'better-ui.hud-changes', default: true, load: hud },
  {
    id: 'larger-codices',
    setting: 'better-ui.larger-codices',
    default: true,
    load: () => addStyles(largerCodicesStyles, 'better-ui-larger-codices'),
  },
  { id: 'larger-skin-images', setting: 'better-ui.larger-skin-images', default: true, load: largerSkinImages },
  { id: 'egg-master', setting: 'better-ui.profile-changes', default: true, load: eggMaster },
  { id: 'show-unowned-skins', setting: 'better-ui.show-unowned-skins', default: true, load: showUnownedSkins },
  {
    id: 'trap-gradient-background',
    setting: 'better-ui.trap-gradient-background',
    default: false,
    load: () => addStyles(trapGradientBackgroundStyles, 'better-ui-trap-gradient-background'),
  },
  {
    id: 'square-profile-pics',
    setting: 'better-ui.square-profile-pics',
    default: false,
    load: () => addStyles(squareProfilePicsStyles, 'consistent-profile-pics'),
  },
  {
    id: 'legacy-styles',
    condition: isLegacyHUD,
    load: () => addStyles(legacyStyles, 'better-ui-legacy'),
  },
];

export default featureManifest;
