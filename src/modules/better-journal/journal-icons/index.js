import { addStyles } from '@utils';

import minimalStyles from '../journal-icons-minimal/styles.css';
import styles from './styles.css';
import journalIcons from './journal-icons.css';

/**
 * Initialize the module.
 */
export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  addStyles([journalIcons, styles, minimalStyles], 'better-journal-icons');
};
