import {
  addStyles,
  debuglog,
  doRequest,
  getCurrentLocation,
  onEvent
} from '@utils';

import journals from './journals.json';

import settings from './settings';
import styles from './styles.css';

const getJournalThemes = async () => {
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'get_themes',
  });

  if (! req.journal_themes) {
    return [];
  }

  return req.journal_themes.theme_list.filter((theme) => theme.can_equip);
};

const updateJournalTheme = async (theme) => {
  const req = await doRequest('managers/ajax/users/journal_theme.php', {
    action: 'set_theme',
    theme,
  });

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

  return journalTheme.type;
};

const main = async () => {
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

let themes = [];

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  main();

  onEvent('travel_complete', main);
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
