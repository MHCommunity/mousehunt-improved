import {
  addStyles,
  getCurrentPage,
  getFlag,
  isLegacyHUD,
  makeElement,
  onNavigation,
  onRequest,
  sessionGet,
  sessionSet
} from '@utils';

import friends from './friends';
import hud from './hud';

import anyTrapAnySkinStyles from './userscript-styles/any-trap-any-skin.css';
import favoriteSetupsStyles from './userscript-styles/favorite-setups.css';
import journalHistorianStyles from './userscript-styles/journal-historian.css';
import lgsReminderStyles from './userscript-styles/lgs-reminder.css';
import mhctStyles from './userscript-styles/mhct.css';
import profilePlusStyles from './userscript-styles/profile-plus.css';
import springEggHuntHelperStyles from './userscript-styles/spring-egg-hunt-helper.css';
import tsituAutoloaderStyles from './userscript-styles/tsitu-autoloader.css';
import tsituLocationCatchStatsStyles from './userscript-styles/tsitu-location-catch-stats.css';
import tsituQolStyles from './userscript-styles/tsitu-qol.css';
import tsituSupplySearchStyles from './userscript-styles/tsitu-supply-search.css';

import legacyStyles from './legacy-styles.css';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Change the text in the Kings Calibrator promo.
 */
const kingsPromoTextChange = () => {
  const kingsPromo = document.querySelector('.shopsPage-kingsCalibratorPromo');
  if (kingsPromo) {
    kingsPromo.innerHTML = kingsPromo.innerHTML.replace('and even', 'and');
  }
};

/**
 * Add the adventure book class to the adventure book banner.
 */
const addAdventureBookClass = () => {
  if (! user?.quests?.QuestAdventureBook?.adventure?.can_claim || ! getCurrentPage('camp')) {
    return;
  }

  const adventureBook = document.querySelector('.adventureBookBanner');
  if (! adventureBook) {
    return;
  }

  adventureBook.classList.add('adventureBookBanner-complete');
};

/**
 * Add the userscript styles.
 */
const addUserscriptStyles = async () => {
  const userscriptStyles = [
    { id: 'userscript-styles-no-any-trap-any-skin-styles', styles: anyTrapAnySkinStyles },
    { id: 'userscript-styles-no-mhct-styles', styles: mhctStyles },
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

const addMaintenceClasses = () => {
/**
 * Add the maintenance banner classes.
 */
  const banner = document.querySelector('div[style="background: #f2f27c; border:1px solid #555; border-radius: 3px; text-align: center; font-size: 12px; padding: 6px 3px"]');
  if (! banner) {
    return;
  }

  const isHidden = sessionGet('maintenance-banner-hidden');
  if (isHidden) {
    banner.classList.add('hidden');
    return;
  }

  banner.classList.add('maintenance-banner', 'mh-ui-fade', 'mh-ui-fade-in');

  const existingClose = banner.querySelector('.close');
  if (existingClose) {
    return;
  }

  banner.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.innerHTML = `${node.innerHTML}.`;
    } else if (node.nodeType === Node.TEXT_NODE) {
      node.textContent = `${node.textContent}.`;
    }
  });

  const close = makeElement('div', 'close', '✕');
  close.addEventListener('click', () => {
    banner.classList.add('mh-ui-fade-out');

    setTimeout(() => {
      banner.classList.add('hidden');
      sessionSet('maintenance-banner-hidden', true);
    }, 350);
  });

  banner.append(close);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-ui');

  if (isLegacyHUD()) {
    addStyles(legacyStyles, 'better-ui-legacy');
  }

  addMaintenceClasses();
  addUserscriptStyles();
  friends();
  hud();

  onRequest('*', addAdventureBookClass);
  onRequest('users/dailyreward.php', kingsPromoTextChange);
  onNavigation(() => {
    addMaintenceClasses();
    addAdventureBookClass();
  }, {
    page: 'camp',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-ui',
  name: 'Better UI',
  type: 'better',
  default: true,
  description: 'Updates the MH interface with a variety of UI and style changes.',
  order: -1,
  load: init,
};
