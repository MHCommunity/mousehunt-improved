import {
  addStyles,
  debuglog,
  doRequest,
  getCurrentLocation,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
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

  debuglog('journal-changer', 'Themes', req.journal_themes);

  if (! req.journal_themes) {
    return [];
  }

  themes = req.journal_themes.theme_list.filter((theme) => theme.can_equip === true);

  debuglog('journal-changer', 'Filtered themes', themes);
  return themes;
};

const updateJournalTheme = async (theme) => {
  const current = getCurrentJournalTheme();

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

const changeForLocation = async () => {
  if (themes.length === 0) {
    debuglog('journal-changer', 'Fetching journal themes');
    themes = await getJournalThemes();
  }

  const newTheme = getJournalThemeForLocation();
  debuglog('journal-changer', 'New theme', newTheme);
  if (! newTheme) {
    debuglog('journal-changer', 'No theme found for current location');
    return;
  }

  const currentTheme = getCurrentJournalTheme();
  if (! currentTheme) {
    debuglog('journal-changer', 'No current theme found');
    return;
  }

  // check if we even have the theme
  if (! themes.some((t) => t.type === newTheme)) {
    debuglog('journal-changer', 'Theme not available', newTheme);
    return;
  }

  if (currentTheme === newTheme) {
    debuglog('journal-changer', 'Current theme is already set');
    return;
  }

  // Set the new theme.
  debuglog('journal-changer', 'Setting new theme', newTheme);
  updateJournalTheme(newTheme);

  const journal = document.querySelector('#journalContainer');
  if (journal) {
    journal.classList.remove(currentTheme);
    journal.classList.add(newTheme);
  }
};

const randomizeTheme = async () => {
  if (themes.length === 0) {
    debuglog('journal-changer', 'Fetching journal themes');
    themes = await getJournalThemes();
  }

  const theme = themes[Math.floor(Math.random() * themes.length)];
  debuglog('journal-changer', 'Setting random theme', theme.type);
  updateJournalTheme(theme.type);
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
const changeJournalDaily = () => {
  const lastChangeValue = getSetting('journal-changer-last-change', '0');
  const lastChange = new Date(Number.parseInt(lastChangeValue, 10));
  const now = new Date();

  // Check if the current time is past midnight and the journal has not been changed today
  debuglog('journal-changer', 'Checking if journal should be changed', lastChange.getDate(), now.getDate());
  if (
    ! lastChange ||
    lastChange.getDate() !== now.getDate() ||
    lastChange.getMonth() !== now.getMonth() ||
    lastChange.getFullYear() !== now.getFullYear()
  ) {
    debuglog('journal-changer', 'Changing journal');
    randomizeTheme();
    saveSetting('journal-changer-last-change', now.getTime());
  } else {
    debuglog('journal-changer', 'Journal has already been changed today');
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'journal-changer');

  if (getSetting('journal-changer-change-daily', false)) {
    changeJournalDaily();
  }

  if (getSetting('journal-changer-change-location', true)) {
    changeForLocation();
    onEvent('travel_complete', changeForLocation);
  }

  onNavigation(addRandomButton, {
    page: 'camp'
  });
};

export default {
  id: 'journal-changer',
  name: 'Journal Changer',
  type: 'feature',
  default: false,
  description: '',
  load: init,
  settings,
};
