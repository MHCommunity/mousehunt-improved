import { addStyles, getFlag, onRequest } from '@utils';

import friends from './friends';
import hud from './hud';

import favoriteSetupsStyles from './userscript-styles/favorite-setups.css';
import journalHistorianStyles from './userscript-styles/journal-historian.css';
import lgsReminderStyles from './userscript-styles/lgs-reminder.css';
import mhctStyles from './userscript-styles/mhct.css';
import profilePlusStyles from './userscript-styles/profile-plus.css';
import tsituAutoloaderStyles from './userscript-styles/tsitu-autoloader.css';
import tsituLocationCatchStatsStyles from './userscript-styles/tsitu-location-catch-stats.css';
import tsituQolStyles from './userscript-styles/tsitu-qol.css';
import tsituSupplySearchStyles from './userscript-styles/tsitu-supply-search.css';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const kingsPromoTextChange = () => {
  const kingsPromo = document.querySelector('.shopsPage-kingsCalibratorPromo');
  if (kingsPromo) {
    kingsPromo.innerHTML = kingsPromo.innerHTML.replace('and even', 'and');
  }
};

const addUserscriptStyles = async () => {
  const userscriptStyles = [
    { id: 'userscript-styles-no-profile-plus-styles', styles: profilePlusStyles },
    { id: 'userscript-styles-no-favorite-setups-styles', styles: favoriteSetupsStyles },
    { id: 'userscript-styles-no-journal-historian-styles', styles: journalHistorianStyles },
    { id: 'userscript-styles-no-lgs-reminder-styles', styles: lgsReminderStyles },
    { id: 'userscript-styles-no-mhct-styles', styles: mhctStyles },
    { id: 'userscript-styles-no-tsitu-autoloader-styles', styles: tsituAutoloaderStyles },
    { id: 'userscript-styles-no-tsitu-location-catch-stats-styles', styles: tsituLocationCatchStatsStyles },
    { id: 'userscript-styles-no-tsitu-qol-styles', styles: tsituQolStyles },
    { id: 'userscript-styles-no-tsitu-supply-search-styles', styles: tsituSupplySearchStyles },
  ];

  if (getFlag('no-userscript-styles')) {
    return;
  }

  userscriptStyles.forEach((userscript) => {
    if (! getFlag(userscript.id)) {
      addStyles(userscript.styles, userscript.id);
    }
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-ui');

  addUserscriptStyles();
  friends();
  hud();

  onRequest('users/dailyreward.php', kingsPromoTextChange);
};

export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Updates the MH interface with a variety of UI and style changes.',
  order: -1,
  load: init,
};
