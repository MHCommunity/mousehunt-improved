import { addStyles, isLegacyHUD } from '@utils';

import bigTimer from './modules/big-timer';
import eggMaster from './modules/egg-master';
import friends from './modules/friends';
import hud from './modules/hud';
import kingsPromo from './modules/kings-promo';
import maintenance from './modules/maintenance';
import pageSelector from './modules/page-selector';
import replaceFavicon from './modules/replace-favicon';
import team from './modules/team';
import tournamentTrophies from './modules/tournament-trophies';
import userscriptStyles from './modules/userscripts-styles';

import legacyStyles from './modules/legacy-styles/styles.css';
import squareProfilePicsStyles from './modules/square-profile-pics/styles.css';

const featureManifest = [
  { id: 'big-timer', load: bigTimer },
  { id: 'friends', load: friends },
  { id: 'kings-promo', load: kingsPromo },
  { id: 'maintenance', load: maintenance },
  { id: 'userscript-styles', load: userscriptStyles },
  { id: 'page-selector', load: pageSelector },
  { id: 'team', load: team },
  { id: 'tournament-trophies', load: tournamentTrophies },
  { id: 'hud', setting: 'better-ui.hud-changes', default: true, load: hud },
  { id: 'replace-favicon', setting: 'better-ui.replace-favicon', default: true, load: replaceFavicon },
  { id: 'egg-master', setting: 'better-ui.profile-changes', default: true, load: eggMaster },
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
