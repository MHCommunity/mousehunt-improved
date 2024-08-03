import { addExternalStyles, addStyles } from '@utils';

import minimalStyles from '../journal-icons-minimal/styles.css';
import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  addStyles([styles, minimalStyles], 'better-journal-icons');
  addExternalStyles('journal-icons.css');
};
