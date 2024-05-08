import {
  addStyles,
  doRequest,
  getCurrentLocation,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  onRequest,
  saveSetting
} from '@utils';

import journals from './journals.json';

import settings from './settings';
import styles from './styles.css';

let themes = [];

const getJournalThemes = async () => {
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'get_themes',
  });

  if (! req || ! req.journal_themes) {
    return [];
  }

  return req.journal_themes.theme_list.filter((theme) => theme.can_equip === true);
};

const updateJournalTheme = async (theme) => {
  const current = getCurrentJournalTheme();

  if (! theme || current == theme) { // eslint-disable-line eqeqeq
    return false;
  }

  shouldListen = false;
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'set_theme',
    theme,
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

const getCurrentJournalTheme = () => {
  const journal = document.querySelector('#journalContainer');
  if (! journal) {
    return false;
  }

  return [...journal.classList].find((cls) => cls.startsWith('theme_'));
};

const getJournalThemeForLocation = () => {
  const location = getCurrentLocation();
  const journalTheme = journals.find((j) => j.environments.includes(location));
  if (! journalTheme) {
    return false;
  }

  // check if the theme is available
  if (themes.some((t) => t.type === journalTheme.type)) {
    return journalTheme.type;
  }

  return journalTheme.type;
};

const revertToSavedTheme = () => {
  const chosenTheme = getSetting('journal-changer.chosen-theme', false);
  if (getCurrentJournalTheme() !== chosenTheme) {
    updateJournalTheme(chosenTheme);
  }
};

const changeForLocation = async () => {
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

  return theme.type;
};

const addRandomButton = () => {
  const journal = document.querySelector('#journalContainer .top');
  if (! journal) {
    return;
  }

  const button = makeElement('a', ['journalContainer-selectTheme', 'mh-improved-random-journal'], 'Randomize');
  button.addEventListener('click', randomizeTheme);

  journal.append(button);
};

const changeJournalDaily = async () => {
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
const onThemeSelectorChange = () => {
  if (_themeSelector) {
    return;
  }

  _themeSelector = hg.views.JournalThemeSelectorView.show;
  hg.views.JournalThemeSelectorView.show = async () => {
    _themeSelector();

    onRequest('users/journal_theme.php', (request, data) => {
      if ('set_theme' === data.action && shouldListen) {
        saveSetting('journal-changer.last-theme', data.theme);
        saveSetting('journal-changer.chosen-theme', data.theme);
      }
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

export default {
  id: 'journal-changer',
  name: 'Journal Theme Changer',
  type: 'feature',
  default: false,
  description: 'Randomize your journal theme, randomize it daily, or change it based on your location.',
  load: init,
  settings,
};
