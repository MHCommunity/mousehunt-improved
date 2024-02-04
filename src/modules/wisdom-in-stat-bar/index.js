import {
  debuglog,
  getSetting,
  getSettingDirect,
  getUserItems,
  makeElement,
  onActivation,
  onDeactivation,
  onTurn,
  saveSettingDirect
} from '@utils';

import settings from './settings';

const getWisdomSetting = (key) => {
  const setting = getSettingDirect('wisdom-stat', {});
  return setting[key];
};

const saveWisdomSetting = (key, value) => {
  const setting = getSettingDirect('wisdom-stat', {});
  setting[key] = value;
  saveSettingDirect('wisdom-stat', setting);
};

const getWisdom = async () => {
  let wisdom = 0;

  if (useCachedWisdom) {
    const cachedWisdom = getWisdomSetting('value');
    if (cachedWisdom) {
      return cachedWisdom;
    }
  }

  wisdom = await getUserItems(['wisdom_stat_item'], true);
  wisdom = wisdom[0]?.quantity || 0;

  saveWisdomSetting('value', wisdom);
  saveWisdomSetting('last-updated', Date.now());

  return wisdom;
};

const getWisdomFormatted = async () => {
  const wisdom = await getWisdom();
  return wisdom.toLocaleString();
};

const addWisdomToStatBar = (wisdom) => {
  const existingWisdom = document.querySelector('.mousehuntHud-userStat-row.wisdom .value.hud_wisdom');
  if (existingWisdom) {
    existingWisdom.textContent = wisdom;
    blinkText(existingWisdom, '#59f659', '#fff', 0.7);
    return;
  }

  const pointsRow = document.querySelector('.mousehuntHud-userStat-row.points');
  if (! pointsRow) {
    return;
  }

  const wisdomRow = makeElement('div', ['mousehuntHud-userStat-row', 'wisdom']);
  makeElement('span', 'label', 'Wisdom', wisdomRow);
  makeElement('span', 'value hud_wisdom', wisdom, wisdomRow);
  wisdomRow.setAttribute('title', 'Click to refresh wisdom');
  pointsRow.after(wisdomRow);
};

const updateWisdom = async () => {
  const wisdom = await getWisdomFormatted();
  addWisdomToStatBar(wisdom);
};

const addRefreshListener = () => {
  const wisdomRow = document.querySelector('.mousehuntHud-userStat-row.wisdom');
  if (! wisdomRow) {
    return;
  }

  wisdomRow.addEventListener('click', () => {
    // Save whether we should use cached wisdom.
    const cachedWidsomSetting = useCachedWisdom;

    // Force update the wisdom.
    useCachedWisdom = false;
    updateWisdom();
    useCachedWisdom = cachedWidsomSetting;
  });
};

const main = async () => {
  if (! getSetting('wisdom-in-stat-bar-auto-refresh', true)) {
    useCachedWisdom = true;
    onTurn(updateWisdom);
  }

  await updateWisdom();
  addRefreshListener();
};

let useCachedWisdom = false;
/**
 * Initialize the module.
 */
const init = async () => {
  main();

  onDeactivation(() => {
    const wisdomRow = document.querySelector('.mousehuntHud-userStat-row.wisdom');
    if (wisdomRow) {
      wisdomRow.remove();
    }
  });
};

export default {
  id: 'wisdom-in-stat-bar',
  name: 'Wisdom in Stat Bar',
  type: 'feature',
  default: true,
  description: 'Show wisdom in the stat bar.',
  load: init,
  settings,
};
