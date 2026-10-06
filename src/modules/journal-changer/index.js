import {
  addStyles,
  cacheGet,
  cacheSet,
  doRequest,
  getCurrentLocation,
  getCurrentPage,
  getData,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onRequest,
  saveSetting,
} from '@utils';

import settings from './settings';
import styles from './styles.css';

let journals = {};
let themes = [];

/**
 * Get the journal themes.
 *
 * @return {Promise<Array>} The journal themes.
 */
const getJournalThemes = async () => {
  const cachedThemes = await cacheGet('journal-themes', []);
  if (cachedThemes?.length > 0) {
    return cachedThemes;
  }

  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'get_themes',
  });

  if (!req || !req.journal_themes) {
    return [];
  }

  const gotThemes = req.journal_themes.theme_list.filter((theme) => theme.can_equip === true);

  cacheSet('journal-themes', gotThemes);

  return gotThemes;
};

/**
 * Set the journal theme.
 *
 * @param {string} theme The theme to set.
 *
 * @return {Promise<boolean>} The result of the request.
 */
const updateJournalTheme = async (theme) => {
  const current = getCurrentJournalTheme();

  // eslint-disable-next-line eqeqeq
  if (!theme || current == theme) {
    return false;
  }

  const req = await doRequest(
    'managers/ajax/users/journal_theme.php',
    {
      action: 'set_theme',
      theme,
    },
    false,
    {
      skipLastReadJournalEntryId: true,
    }
  );

  if (req && req.success) {
    // remove the old theme and add the new one
    const journal = document.querySelector('#journalContainer');
    if (journal) {
      journal.classList.remove(current);
      journal.classList.add(theme);
    }
  }

  return req;
};

/**
 * Get the current journal theme.
 *
 * @return {string|boolean} The current journal theme or false.
 */
const getCurrentJournalTheme = () => {
  const journal = document.querySelector('#journalContainer');
  if (!journal) {
    return false;
  }

  const classlist = [...journal.classList];
  if (classlist.length === 0) {
    return false;
  }

  return classlist.find((cls) => cls.startsWith('theme_'));
};

/**
 * Get the journal theme for the current location.
 *
 * @return {string|boolean} The journal theme or false.
 */
const getJournalThemeForLocation = () => {
  const location = getCurrentLocation();
  if (!journals[location]) {
    return false;
  }

  // check if the theme is available
  if (themes.some((t) => t.type === journals[location])) {
    return journals[location];
  }

  return false;
};

/**
 * Revert to the saved theme if it's not the current theme.
 */
const revertToSavedTheme = () => {
  const chosenTheme = getSetting('journal-changer.chosen-theme', false);
  const lastTheme = getSetting('journal-changer.last-theme', false);
  const currentTheme = getCurrentJournalTheme();
  if (currentTheme !== chosenTheme && currentTheme !== lastTheme) {
    updateJournalTheme(chosenTheme);
  }
};

/**
 * Update the journal theme based on the current location.
 */
const changeForLocation = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  // Load the themes first, since they're needed to check that we have the theme for this location.
  if (themes.length === 0) {
    themes = await getJournalThemes();
  }

  const newTheme = getJournalThemeForLocation();
  if (!newTheme) {
    revertToSavedTheme();
    return;
  }

  const currentTheme = getCurrentJournalTheme();
  if (!currentTheme || currentTheme === newTheme) {
    return;
  }

  updateJournalTheme(newTheme);
};

/**
 * Randomize the journal theme.
 *
 * @param {string} skip The theme to skip.
 *
 * @return {Promise<string|boolean>} The new theme or false.
 */
const randomizeTheme = async (skip = false) => {
  if (themes.length === 0) {
    themes = await getJournalThemes();
  }

  // Pick from everything but the skipped and current themes, without changing the shared list.
  const current = getCurrentJournalTheme();
  const pool = themes.filter((t) => t.type !== skip && t.type !== current);

  const theme = pool[Math.floor(Math.random() * pool.length)];
  if (!theme || !theme.type) {
    return false;
  }

  updateJournalTheme(theme.type);
  saveSetting('journal-changer.last-theme', theme.type);

  return theme.type;
};

/**
 * Add the randomize button to the journal.
 */
const addRandomButton = () => {
  const journal = document.querySelector('#journalContainer .top');
  if (!journal || journal.querySelector('.mh-improved-random-journal')) {
    return;
  }

  const button = makeElement('a', ['journalContainer-selectTheme', 'mh-improved-random-journal'], 'Randomize');
  button.addEventListener('click', () => randomizeTheme());

  journal.append(button);
};

/**
 * Change the journal theme daily.
 */
const changeJournalDaily = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const lastChangeValue = getSetting('journal-changer.last-change', 0);
  const lastChange = new Date(Number.parseInt(lastChangeValue, 10));
  const now = new Date();

  // Check if the current time is past midnight and the journal has not been changed today
  if (!lastChange || lastChange.getDate() !== now.getDate() || lastChange.getMonth() !== now.getMonth() || lastChange.getFullYear() !== now.getFullYear()) {
    const lastTheme = getSetting('journal-changer.last-theme', false);
    const theme = await randomizeTheme(lastTheme);

    saveSetting('journal-changer.last-change', now.getTime());
    saveSetting('journal-changer.last-theme', theme);
  }
};

/**
 * Remember the theme the user picks in the game's theme selector, and keep the theme list fresh.
 *
 * Our own theme changes use fetch, so they don't show up here.
 */
const onThemeSelectorChange = () => {
  onRequest('users/journal_theme.php', (request, data) => {
    if ('set_theme' === data?.action) {
      saveSetting('journal-changer.last-theme', data.theme);
      saveSetting('journal-changer.chosen-theme', data.theme);
    }

    const themeList = request?.journal_themes?.theme_list;
    if (themeList) {
      themes = themeList.filter((theme) => theme?.can_equip === true);
      cacheSet(
        'journal-themes',
        themes,
        30 * 24 * 60 * 60 * 1000 // Cache for 30 days.
      );
    }
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'journal-changer');

  journals = await getData('journals-environment-mapping');

  if (getSetting('journal-changer.change-daily', false)) {
    changeJournalDaily();
  }

  if (getSetting('journal-changer.change-location', false)) {
    changeForLocation();
    onEvent('travel_complete', changeForLocation);
  }

  onNavigation(addRandomButton, {
    page: 'camp',
  });

  onThemeSelectorChange();
};

/**
 * Initialize the module.
 */
export default {
  id: 'journal-changer',
  name: 'Journal Theme Changer',
  type: 'interface',
  default: false,
  description: 'Pick a random journal theme, get a new one each day, or match it to your location.',
  load: init,
  settings,
};
