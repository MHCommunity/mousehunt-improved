import { addExternalStyles, addStyles, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Add the journal icon styles, but only once a journal is actually on the page.
 *
 * The stylesheet carries a rule for every item in the game, making it the largest one
 * shipped. Loading it only where there's a journal to decorate saves every other page
 * from parsing it.
 */
const addIconStyles = () => {
  if (! document.querySelector('#journalContainer')) {
    return;
  }

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
};
