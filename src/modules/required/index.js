import {
  addStyles,
  debuglog,
  doEvent,
  getCurrentLocation,
  getCurrentPage,
  getCurrentTab,
  getFlag,
  getGlobal,
  getHeaders,
  getSetting,
  getSettings,
  makeElement,
  onEvent,
  onTurn
} from '@utils';

import loadAdvancedSettings from './advanced-settings';

import settingStyles from './settings-styles.css';
import settingsIconStyles from './settings-icons.css';

const modifySettingsPage = () => {
  const settingsPage = document.querySelectorAll('.PagePreferences .mousehuntHud-page-tabContent.game_settings.mousehunt-improved-settings .PagePreferences__title');
  if (! settingsPage) {
    return;
  }

  const toggles = document.querySelectorAll('.mhui-setting-toggle');
  toggles.forEach((toggle) => {
    toggle.remove();
  });

  settingsPage.forEach((setting) => {
    // Append an svg to toggle the class
    const toggle = makeElement('div', 'mhui-setting-toggle');
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>`;

    const titleText = setting.querySelector('.PagePreferences__titleText');
    if (titleText.childNodes.length > 1) {
      titleText.insertBefore(toggle, titleText.childNodes[1]);
    } else {
      titleText.append(toggle);
    }

    // add the event listener to toggle the class
    titleText.addEventListener('click', () => {
      const toggled = setting.classList.contains('toggled');
      if (toggled) {
        setting.classList.remove('toggled');
        toggle.classList.remove('toggled');
      } else {
        setting.classList.add('toggled');
        toggle.classList.add('toggled');
      }
    });

    const defaultToggled = [
      'mousehunt-improved-settings-mousehunt-improved-settings-overrides',
    ];

    if (defaultToggled.includes(setting.id)) {
      setting.classList.add('toggled');
      toggle.classList.add('toggled');
    }
  });

  // highlight the current location in the location hud settings
  const locationHudSettings = document.querySelector(`#mousehunt-improved-settings-location-hud-${getCurrentLocation()}`);
  if (locationHudSettings) {
    locationHudSettings.classList.add('highlight');
  }
};

const loadStyleOverrides = () => {
  const customStyles = getSetting('override-styles');
  if (customStyles) {
    addStyles(customStyles, 'mousehunt-improved-override-styles');
  }
};

const doSettingsPage = () => {
  loadAdvancedSettings();

  onEvent('mh-improved-advanced-settings-added', () => {
    modifySettingsPage();
    doEvent('mh-improved-settings-loaded');
  });
};

const checkForAutohorn = () => {
  // If these elements exist, they're autohorning.
  const time = document.querySelector('#nextHornTimeElement');
  const msg = document.querySelector('#nobSpecialMessage');

  if (! time || ! msg) {
    return false;
  }

  isAutohorning = true;

  try {
    // Send a post request to the autohorn tracker.
    fetch('https://autohorn.mouse.rip/submit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: user.user_id,
        snid: user.sn_user_id,
        username: user.username,
      }),
    });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
};

let lastSubmit = 0;
const sendModulesStats = async (force = false) => {
  // Don't send the stats more than once every 5 minutes, unless it's the settings page.
  if (Date.now() - lastSubmit < 300000 && ! force) {
    return;
  }

  lastSubmit = Date.now();

  // Only used to generate a unique hash for the user that doesn't change but is unique and anonymous. props MHCT.
  const msgUint8 = new TextEncoder().encode(user.user_id.toString().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = [...new Uint8Array(hashBuffer)];
  userHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const settings = getSettings();

  delete settings['keyboard-shortcuts'];
  delete settings['favorite-setups'];
  delete settings['wisdom-stat'];

  if (settings['inventory-lock-and-hide']) {
    settings['inventory-lock-and-hide'] = {
      locked: settings['inventory-lock-and-hide']?.locked?.length || 0,
      hidden: settings['inventory-lock-and-hide']?.hidden?.length || 0,
    };
  }

  if (settings['override-styles']) {
    settings['override-styles'] = settings['override-styles'].length;
  }

  if (settings['better-travel'] && settings['better-travel']['travel-window-hidden-locations']) {
    settings['better-travel']['travel-window-hidden-locations'] = settings['better-travel']['travel-window-hidden-locations'].length;
  }

  const statData = {
    modules: getGlobal('modules'),
    settings,
    user: userHash,
    isAutohorning,
    hasSeenUserscriptMigration: localStorage.getItem('mh-improved-ignore-migrated-userscript-warning'),
  };

  debuglog('usage-stats', 'Updating usage stats', statData);

  fetch('https://mhi-stats.mouse.rip/submit', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(statData),
  });
};

const addIconToMenu = () => {
  const menu = document.querySelector('.mousehuntHeaderView-gameTabs .mousehuntHeaderView-dropdownContainer');
  if (! menu) {
    return;
  }

  const icon = makeElement('a', ['menuItem', 'mousehunt-improved-icon-menu']);
  icon.href = 'https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings';
  icon.title = 'MouseHunt Improved Settings';

  icon.addEventListener('click', (e) => {
    if ('preferences' === getCurrentPage() && 'mousehunt-improved-settings' === getCurrentTab()) {
      e.preventDefault();
      hg.utils.PageUtil.setPage('Camp');
    }
  });

  menu.append(icon);
};

const sendUsageStats = () => {
  // If you want to disable the reporting, you can but you have to admit you're a cheater.
  if (! getFlag('i-am-a-cheater-and-i-know-it')) {
    checkForAutohorn();
    onTurn(setTimeout(checkForAutohorn, 2000));
  }

  if (getSetting('error-reporting', true)) {
    // No personal data is sent, just the settings and modules that are enabled.
    // Delay the first call so we don't send it while things are still loading.
    setTimeout(sendModulesStats, 3000);

    // Send the stats every horn, but delay it so we dont fire off at the same time as MHCT.
    onTurn(sendModulesStats, 2000);

    // Send the stats when the settings are changed.
    let timeout;
    onEvent('mh-improved-settings-changed', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => sendModulesStats(true), 1000); // Debounce the event.
    });
  }
};

const addEvents = () => {
  const hunterHornTimer = document.querySelector('.huntersHornView__timerState');
  if (hunterHornTimer) {
    // Add a mutation observer to check when the innertext changes and when it does, start an interval where we fire an event every second.
    const observer = new MutationObserver(() => {
      // After the mutation, start the interval and then stop watching for mutations.
      setInterval(() => {
        doEvent('horn-countdown-tick', hunterHornTimer.innerText);
      }, 1000);

      setInterval(() => {
        doEvent('horn-countdown-tick-minute', hunterHornTimer.innerText);
      }, 60 * 1000);

      observer.disconnect();
    });

    observer.observe(hunterHornTimer, { childList: true });
  }
};

// huntersHornView__timerState

let isAutohorning = false;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([settingStyles, settingsIconStyles], 'required');
  addIconToMenu();
  doSettingsPage();
  sendUsageStats();
  addEvents();

  onEvent('mh-improved-loaded', loadStyleOverrides);

  onEvent('horn-countdown-tick', (time) => {
    //
  });
};

export default {
  id: 'required',
  type: 'required',
  load: init,
};
