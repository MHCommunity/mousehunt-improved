import { addStyles, dataGet, dataSet, getSetting, getUserItems, isLegacyHUD, isModuleEnabled, makeElement, onModuleToggle, onTurn } from '@utils';

import settings from './settings';
import styles from './styles.css';

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
 * @param {boolean} force Whether to skip the cached value.
 *
 * @return {number} The wisdom.
 */
const getWisdom = async (force = false) => {
  let wisdom = 0;

  if (!force) {
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
 * @param {boolean} force Whether to skip the cached value.
 *
 * @return {string} The formatted wisdom.
 */
const getWisdomFormatted = async (force = false) => {
  const wisdom = await getWisdom(force);

  // Always use commas: the game's walkValue only strips commas, so locale separators (1.234.567, 1 234 567) break it.
  return Number(wisdom || 0).toLocaleString('en-US');
};

/**
 * Add wisdom to the stat bar.
 *
 * @param {string} wisdom The wisdom to add.
 */
const addWisdomToStatBar = (wisdom) => {
  // A fetch that was already running when the module was turned off shouldn't put the row back.
  if (!isModuleEnabled('wisdom-in-stat-bar')) {
    return;
  }

  const existingWisdom = document.querySelector('.mousehuntHud-userStat-row.wisdom .hud_wisdom');

  if (existingWisdom) {
    if ('undefined' === typeof walkValue) {
      existingWisdom.textContent = wisdom;
    } else {
      walkValue(existingWisdom, existingWisdom.textContent, wisdom, 1, '#59f659', '#fff');
    }

    return;
  }

  const pointsRow = document.querySelector(legacyHudMenu ? '.headsup > div:nth-child(5) ul li:nth-child(2)' : '.mousehuntHud-userStat-row.points');
  if (!pointsRow) {
    return;
  }

  const wisdomRow = makeElement(legacyHudMenu ? 'li' : 'div', ['mousehuntHud-userStat-row', 'wisdom']);
  makeElement('span', legacyHudMenu ? 'hudstatlabel' : 'label', 'Wisdom', wisdomRow);
  makeElement('span', legacyHudMenu ? 'hudstatvalue hud_wisdom' : 'value hud_wisdom', wisdom, wisdomRow);
  wisdomRow.setAttribute('title', 'Click to refresh wisdom');
  wisdomRow.addEventListener('click', () => updateWisdom(true));
  pointsRow.after(wisdomRow);
};

/**
 * Update the wisdom.
 *
 * @param {boolean} force Whether to skip the cached value.
 */
const updateWisdom = async (force = false) => {
  const wisdom = await getWisdomFormatted(force);
  addWisdomToStatBar(wisdom);
};

let legacyHudMenu = false;
/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'wisdom-in-stat-bar');

  onTurn(() => {
    if (getSetting('wisdom-in-stat-bar.auto-refresh', true)) {
      updateWisdom(true);
    }
  });

  const legacyMenu = getSetting('legacy-hud.menu', false);
  const legacyHud = getSetting('legacy-hud.stats', false);
  legacyHudMenu = (getSetting('legacy-hud', false) && (legacyHud || legacyMenu === legacyHud)) || isLegacyHUD();

  onModuleToggle('wisdom-in-stat-bar', {
    enable: updateWisdom,
    disable: () => document.querySelector('.mousehuntHud-userStat-row.wisdom')?.remove(),
  });

  await updateWisdom();
};

/**
 * Initialize the module.
 */
export default {
  id: 'wisdom-in-stat-bar',
  name: 'Wisdom in Stat Bar',
  type: 'hunting-setup',
  default: false,
  liveToggle: true,
  load: init,
  settings,
};
