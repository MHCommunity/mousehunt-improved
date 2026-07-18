import { addExternalStyles, addStyles, onJournalEntry, onNavigation } from '@utils';

import styles from './styles.css';

let hasAddedIconStyles = false;

/**
 * Add the journal icon styles, but only once a journal is actually on the page.
 *
 * The stylesheet carries a rule for every item in the game, making it the largest one
 * shipped. Loading it only where there's a journal to decorate saves every other page
 * from parsing it.
 */
const addIconStyles = () => {
  if (hasAddedIconStyles || !document.querySelector('#journalContainer, .journal .entry, .journalEntries .entry, .jsingle .entry')) {
    return;
  }

  hasAddedIconStyles = true;
  addExternalStyles('journal-icons.css');
};

/**
 * Initialize the module.
 */
export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  addStyles(styles, 'better-journal-icons');

  addIconStyles();
  onNavigation(addIconStyles);

  // Journal entries can appear outside `#journalContainer` — e.g. the Hunter's
  // Journal overlay on the mouse stats pages — where navigation never fires.
  onJournalEntry(addIconStyles, { id: 'better-journal-icons-styles' });
};
