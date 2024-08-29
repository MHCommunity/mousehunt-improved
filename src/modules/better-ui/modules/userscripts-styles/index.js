import { addStyles, getFlag } from '@utils';

import anyTrapAnySkinStyles from './styles/any-trap-any-skin.css';
import favoriteSetupsStyles from './styles/favorite-setups.css';
import journalHistorianStyles from './styles/journal-historian.css';
import lgsReminderStyles from './styles/lgs-reminder.css';
import profilePlusStyles from './styles/profile-plus.css';
import springEggHuntHelperStyles from './styles/spring-egg-hunt-helper.css';
import tsituAutoloaderStyles from './styles/tsitu-autoloader.css';
import tsituLocationCatchStatsStyles from './styles/tsitu-location-catch-stats.css';
import tsituQolStyles from './styles/tsitu-qol.css';
import tsituSupplySearchStyles from './styles/tsitu-supply-search.css';

/**
 * Add the userscript styles.
 */
export default async () => {
  const userscriptStyles = [
    { id: 'userscript-styles-no-any-trap-any-skin-styles', styles: anyTrapAnySkinStyles },
    { id: 'userscript-styles-no-tsitu-qol-styles', styles: tsituQolStyles },
    { id: 'userscript-styles-no-profile-plus-styles', styles: profilePlusStyles },
    { id: 'userscript-styles-no-spring-egg-hunt-helper-styles', styles: springEggHuntHelperStyles },
    { id: 'userscript-styles-no-lgs-reminder-styles', styles: lgsReminderStyles },
    { id: 'userscript-styles-no-favorite-setups-styles', styles: favoriteSetupsStyles },
    { id: 'userscript-styles-no-tsitu-autoloader-styles', styles: tsituAutoloaderStyles },
    { id: 'userscript-styles-no-journal-historian-styles', styles: journalHistorianStyles },
    { id: 'userscript-styles-no-tsitu-supply-search-styles', styles: tsituSupplySearchStyles },
    { id: 'userscript-styles-no-tsitu-location-catch-stats-styles', styles: tsituLocationCatchStatsStyles },
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
