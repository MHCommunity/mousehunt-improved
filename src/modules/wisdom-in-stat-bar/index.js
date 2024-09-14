import {
  cacheGet,
  cacheSet,
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
  return await cacheGet(`wisdom-stat-${key}`);
};

/**
 * Save the wisdom setting.
 *
 * @param {string} key   Key to save.
 * @param {any}    value Value to save.
 */
const saveWisdomSetting = (key, value) => {
  cacheSet(`wisdom-stat-${key}`, value);
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

  let pointsRow;
  if (legacyHudMenu) {
    pointsRow = document.querySelector('.headsup > div:nth-child(5) ul li:nth-child(2)');
  } else {
    pointsRow = document.querySelector('.mousehuntHud-userStat-row.points');
  }

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
  let wisdomRow = document.querySelector('.mousehuntHud-userStat-row.wisdom');
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

let useCachedWisdom = false;
let legacyHudMenu = false;
/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('wisdom-in-stat-bar.auto-refresh', true)) {
    useCachedWisdom = false;
    onTurn(updateWisdom);
  }

  const legacyMenu = getSetting('legacy-hud.menu', false);
  const legacyHud = getSetting('legacy-hud.stats', false);
  legacyHudMenu = legacyHud || (getSetting('legacy-hud', false) && legacyMenu === legacyHud);

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
