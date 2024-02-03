import {
  debuglog,
  getSetting,
  getSettingDirect,
  getUserItems,
  makeElement,
  onTurn,
  saveSettingDirect
} from '@utils';

import settings from './settings';

const getWisdomSetting = (key) => {
  const setting = getSettingDirect('wisdom-stat', {});
  debuglog('wisdom', `Getting setting: ${key}`, setting[key]);
  return setting[key];
};

const saveWisdomSetting = (key, value) => {
  const setting = getSettingDirect('wisdom-stat', {});
  setting[key] = value;
  saveSettingDirect('wisdom-stat', setting);
};

const getWisdom = async () => {
  debuglog('wisdom', `Getting wisdom. using cached: ${useCachedWisdom}`);
  let wisdom = 0;

  if (useCachedWisdom) {
    const cachedWisdom = getWisdomSetting('value');
    debuglog('wisdom', `Got cached wisdom: ${cachedWisdom}`);
    if (cachedWisdom) {
      return cachedWisdom;
    }
  }

  wisdom = await getUserItems(['wisdom_stat_item'], true);
  wisdom = wisdom[0]?.quantity || 0;

  debuglog('wisdom', `Got wisdom: ${wisdom}`);

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

let useCachedWisdom = false;
/**
 * Initialize the module.
 */
const init = async () => {
  if (! getSetting('wisdom-refresh', true)) {
    useCachedWisdom = true;
    onTurn(updateWisdom);
  }

  await updateWisdom();
  addRefreshListener();
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
