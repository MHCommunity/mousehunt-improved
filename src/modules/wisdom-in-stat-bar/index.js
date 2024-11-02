import {
  dataGet,
  dataSet,
  getSetting,
  getUserItems,
  isLegacyHUD,
  makeElement,
  onDeactivation,
  onTurn
} from '@utils';

import settings from './settings';

/**
 * Get the wisdom setting.
 *
 * @param {string} key Key to get.
 *
 * @return {any} The setting.
 */
const getWisdomSetting = async (key) => {
  return await dataGet(`wisdom-stat-${key}`);
};

/**
 * Save the wisdom setting.
 *
 * @param {string} key   Key to save.
 * @param {any}    value Value to save.
 */
const saveWisdomSetting = (key, value) => {
  dataSet(`wisdom-stat-${key}`, value);
};

/**
 * Get the wisdom.
 *
 * @return {number} The wisdom.
 */
const getWisdom = async () => {
  let wisdom = 0;

  if (useCachedWisdom) {
    const cachedWisdom = await getWisdomSetting('value');
    const lastUpdated = await getWisdomSetting('last-updated');

    // Make sure our cached data isn't more than 2 days old.
    if (cachedWisdom && lastUpdated && Date.now() - lastUpdated < 2 * 24 * 60 * 60 * 1000) {
      return cachedWisdom;
    }
  }

  wisdom = await getUserItems(['wisdom_stat_item'], true);
  wisdom = wisdom[0]?.quantity || 0;

  saveWisdomSetting('value', wisdom);
  saveWisdomSetting('last-updated', Date.now());

  return wisdom;
};

/**
 * Get the wisdom formatted.
 *
 * @return {string} The formatted wisdom.
 */
const getWisdomFormatted = async () => {
  const wisdom = await getWisdom();
  return wisdom.toLocaleString();
};

/**
 * Add wisdom to the stat bar.
 *
 * @param {string} wisdom The wisdom to add.
 */
const addWisdomToStatBar = (wisdom) => {
  const existingWisdom = document.querySelector('.mousehuntHud-userStat-row.wisdom .hud_wisdom');

  if (existingWisdom) {
    existingWisdom.textContent = wisdom;
    if ('undefined' !== typeof blinkText) {
      blinkText(existingWisdom, '#59f659', '#fff', 0.7);
    }

    return;
  }

  const pointsRow = document.querySelector(legacyHudMenu ? '.headsup > div:nth-child(5) ul li:nth-child(2)' : '.mousehuntHud-userStat-row.points');
  if (! pointsRow) {
    return;
  }

  const wisdomRow = makeElement(legacyHudMenu ? 'li' : 'div', ['mousehuntHud-userStat-row', 'wisdom']);
  makeElement('span', legacyHudMenu ? 'hudstatlabel' : 'label', 'Wisdom', wisdomRow);
  makeElement('span', legacyHudMenu ? 'hudstatvalue hud_wisdom' : 'value hud_wisdom', wisdom, wisdomRow);
  wisdomRow.setAttribute('title', 'Click to refresh wisdom');
  pointsRow.after(wisdomRow);
};

/**
 * Update the wisdom.
 */
const updateWisdom = async () => {
  const wisdom = await getWisdomFormatted();
  addWisdomToStatBar(wisdom);
};

/**
 * Add the click listener to refresh the wisdom.
 */
const addRefreshListener = () => {
  const wisdomRow = document.querySelector('.mousehuntHud-userStat-row.wisdom');
  if (! wisdomRow) {
    return;
  }

  wisdomRow.addEventListener('click', () => {
    // Save whether we should use cached wisdom.
    const cachedWisdomSetting = useCachedWisdom;

    // Force update the wisdom.
    useCachedWisdom = false;
    updateWisdom();
    useCachedWisdom = cachedWisdomSetting;
  });
};

let useCachedWisdom = true;
let legacyHudMenu = false;
/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('wisdom-in-stat-bar.auto-refresh', true)) {
    onTurn(updateWisdom);
  }

  const legacyMenu = getSetting('legacy-hud.menu', false);
  const legacyHud = getSetting('legacy-hud.stats', false);
  legacyHudMenu = (getSetting('legacy-hud', false) && (legacyHud || legacyMenu === legacyHud)) || isLegacyHUD();

  await updateWisdom();
  addRefreshListener();

  onDeactivation(() => {
    const wisdomRow = document.querySelector('.mousehuntHud-userStat-row.wisdom');
    if (wisdomRow) {
      wisdomRow.remove();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'wisdom-in-stat-bar',
  name: 'Wisdom in Stat Bar',
  type: 'feature',
  default: false,
  description: 'Show wisdom in the stat bar.',
  load: init,
  settings,
};
