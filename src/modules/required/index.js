import {
  addStyles,
  debug,
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

const checkForAutohorn = () => {
  // If these elements exist, they're autohorning.
  const time = document.querySelector('#nextHornTimeElement');
  const msg = document.querySelector('#nobSpecialMessage');

  if (! time || ! msg) {
    return false;
  }

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
};

const sendModulesStats = () => {
  const statData = {
    platform: mhImprovedPlatform,
    version: mhImprovedVersion,
    modules: getGlobal('modules'),
    settings: getSettings(),
    user: user.unique_hash,
  };

  // TODO: Send the stats to the server.
  debug('Sending stats to the server', statData);
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

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([settingStyles, settingsIconStyles], 'required');

  loadStyleOverrides();

  loadAdvancedSettings();

  onEvent('mh-improved-advanced-settings-added', () => {
    modifySettingsPage();
    doEvent('mh-improved-settings-loaded');
  });

  // If you want to disable the reporting, you can but you have to admit you're a cheater.
  if (! getFlag('i-am-a-cheater-and-i-know-it')) {
    checkForAutohorn();
    onTurn(checkForAutohorn);
  }

  if (getSetting('error-reporting', true)) {
    sendModulesStats();
    onTurn(sendModulesStats);
  }

  addIconToMenu();
};

export default {
  id: 'required',
  type: 'required',
  load: init,
};
