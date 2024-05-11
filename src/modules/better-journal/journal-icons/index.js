import { addExternalStyles, addStyles } from '@utils';

import minimalStyles from '../journal-icons-minimal/styles.css';
import styles from './styles.css';

export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  addExternalStyles('https://static.mouse.rip/journal-icons.css');

  addStyles([styles, minimalStyles], 'better-journal-icons');
};
