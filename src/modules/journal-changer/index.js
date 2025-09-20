import {
  addStyles,
  cacheGet,
  cacheSet,
  doRequest,
  getCurrentLocation,
  getCurrentPage,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onRequest,
  saveSetting
} from '@utils';

import journals from '@data/journals-environment-mapping.json';

import settings from './settings';
import styles from './styles.css';

let themes = [];

/**
 * Get the journal themes.
 *
 * @return {Promise<Array>} The journal themes.
 */
const getJournalThemes = async () => {
  const cachedThemes = await cacheGet('journal-themes', []);
  if (cachedThemes.length > 0) {
    return cachedThemes;
  }

  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'get_themes',
  });

  if (! req || ! req.journal_themes) {
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

  if (! theme || current == theme) { // eslint-disable-line eqeqeq
    return false;
  }

  shouldListen = false;
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'set_theme',
    theme,
  }, false, {
    skipLastReadJournalEntryId: true,
  });

  if (req.success) {
    // remove the old theme and add the new one
    const journal = document.querySelector('#journalContainer');
    if (journal) {
      journal.classList.remove(current);
      journal.classList.add(theme);
    }
  }

  shouldListen = true;

  return req;
};

/**
 * Get the current journal theme.
 *
 * @return {string|boolean} The current journal theme or false.
 */
const getCurrentJournalTheme = () => {
  const journal = document.querySelector('#journalContainer');
  if (! journal) {
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
  if (! journals[location]) {
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

  const newTheme = getJournalThemeForLocation();
  if (! newTheme) {
    revertToSavedTheme();
    return;
  }

  if (themes.length === 0) {
    themes = await getJournalThemes();
  }

  const currentTheme = getCurrentJournalTheme();
  if (! currentTheme) {
    return;
  }

  if (currentTheme === newTheme) {
    return;
  }

  // check if we even have the theme
  if (! themes.some((t) => t.type === newTheme)) {
    revertToSavedTheme();
    return;
  }

  // Set the new theme.
  updateJournalTheme(newTheme);

  const journal = document.querySelector('#journalContainer');
  if (journal) {
    journal.classList.remove(currentTheme);
    journal.classList.add(newTheme);
  }
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

  if (skip) {
    // remove that theme from the list
    themes = themes.filter((t) => t.type !== skip);
  }

  // remove the current theme
  const current = getCurrentJournalTheme();
  if (current) {
    themes = themes.filter((t) => t.type !== current);
  }

  const theme = themes[Math.floor(Math.random() * themes.length)];
  if (! theme || ! theme.type) {
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
  if (! journal) {
    return;
  }

  const button = makeElement('a', ['journalContainer-selectTheme', 'mh-improved-random-journal'], 'Randomize');
  button.addEventListener('click', randomizeTheme);

  journal.append(button);
};

/**
 * Change the journal theme daily.
 */
const changeJournalDaily = async () => {
  if ('camp' !== getCurrentLocation()) {
    return;
  }

  const lastChangeValue = getSetting('journal-changer.last-change', 0);
  const lastChange = new Date(Number.parseInt(lastChangeValue, 10));
  const now = new Date();

  // Check if the current time is past midnight and the journal has not been changed today
  if (
    ! lastChange ||
    lastChange.getDate() !== now.getDate() ||
    lastChange.getMonth() !== now.getMonth() ||
    lastChange.getFullYear() !== now.getFullYear()
  ) {
    const lastTheme = getSetting('journal-changer.last-theme', false);
    const theme = await randomizeTheme(lastTheme);

    saveSetting('journal-changer.last-change', now.getTime());
    saveSetting('journal-changer.last-theme', theme);
  }
};

let _themeSelector;
let shouldListen = true;

/**
 * Listen for the theme selector change.
 */
const onThemeSelectorChange = () => {
  if (_themeSelector) {
    return;
  }

  _themeSelector = hg.views.JournalThemeSelectorView.show;

  /**
   * Override the theme selector view.
   */
  hg.views.JournalThemeSelectorView.show = async () => {
    _themeSelector();

    onRequest('users/journal_theme.php', (request, data) => {
      if ('set_theme' === data.action && shouldListen) {
        saveSetting('journal-changer.last-theme', data.theme);
        saveSetting('journal-changer.chosen-theme', data.theme);
      }

      cacheSet(
        'journal-themes',
        req.journal_themes.theme_list.filter((theme) => theme.can_equip === true),
        30 * 24 * 60 * 60 * 1000 // Cache for 30 days.
      );
    });
  };
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'journal-changer');

  if (getSetting('journal-changer.change-daily', false)) {
    changeJournalDaily();
  }

  if (getSetting('journal-changer.change-location', true)) {
    changeForLocation();
    onEvent('travel_complete', changeForLocation);
  }

  onNavigation(addRandomButton, {
    page: 'camp'
  });

  onThemeSelectorChange();
};

/**
 * Initialize the module.
 */
export default {
  id: 'journal-changer',
  name: 'Journal Theme Changer',
  type: 'feature',
  default: false,
  description: 'Randomize your journal theme, randomize it daily, or change it based on your location.',
  load: init,
  settings,
};
