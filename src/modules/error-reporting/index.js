import {
  debuglog,
  getFlag,
  getGlobal,
  getHeaders,
  getSetting,
  getSettings,
  getUserHash,
  onEvent,
  onTurn
} from '@utils';

let isAutohorning = false;
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
    user: await getUserHash(),
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

const init = async () => {
  sendUsageStats();
};

export default {
  id: 'error-reporting',
  name: 'Error Reporting',
  type: 'advanced',
  description: 'Send anonymous error reports to the developers.',
  default: true,
  load: init,
};
