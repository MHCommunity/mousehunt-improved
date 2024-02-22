import { addStyles, getFlag, onNavigation } from '@utils';

import friends from './friends';
import hud from './hud';

import favoriteSetupsStyles from './userscript-styles/favorite-setups.css';
import journalHistorianStyles from './userscript-styles/journal-historian.css';
import lgsReminderStyles from './userscript-styles/lgs-reminder.css';
import mhctStyles from './userscript-styles/mhct.css';
import profilePlusStyles from './userscript-styles/profile-plus.css';
import tsituLocationCatchStatsStyles from './userscript-styles/tsitu-location-catch-stats.css';
import tsituQolStyles from './userscript-styles/tsitu-qol.css';
import tsituSupplySearchStyles from './userscript-styles/tsitu-supply-search.css';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const addUserscriptStyles = () => {
  const userscriptStyles = [
    { id: 'better-ui-no-profile-plus-styles', styles: profilePlusStyles },
    { id: 'better-ui-no-favorite-setups-styles', styles: favoriteSetupsStyles },
    { id: 'better-ui-no-journal-historian-styles', styles: journalHistorianStyles },
    { id: 'better-ui-no-lgs-reminder-styles', styles: lgsReminderStyles },
    { id: 'better-ui-no-mhct-styles', styles: mhctStyles },
    { id: 'better-ui-no-tsitu-location-catch-stats-styles', styles: tsituLocationCatchStatsStyles },
    { id: 'better-ui-no-tsitu-qol-styles', styles: tsituQolStyles },
    { id: 'better-ui-no-tsitu-supply-search-styles', styles: tsituSupplySearchStyles },
  ];

  userscriptStyles.forEach(({ id, userscriptStyle }) => {
    if (! getFlag(id, false)) {
      addStyles(userscriptStyle, id);
    }
  });

  if (! getFlag('better-ui-no-profile-plus-styles', getFlag('no-better-ui-profile-plus', false))) {
    onNavigation(() => {
      setTimeout(profilePlusStyles, 1000);
    }, {
      page: 'hunterprofile',
    });
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-ui');

  addUserscriptStyles();
  friends();
  hud();
};

export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Updates the MH interface with a variety of UI and style changes.',
  load: init,
};
