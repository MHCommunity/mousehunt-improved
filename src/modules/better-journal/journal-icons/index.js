import { addStyles } from '@utils';

import minimalStyles from '../journal-icons-minimal/styles.css';
import styles from './styles.css';

export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  const style = document.createElement('link');
  style.id = 'better-journal-icons';
  style.rel = 'stylesheet';
  style.href = `https://api.mouse.rip/journal-icons.css?v=${mhImprovedVersion}`;

  document.head.append(style);

  addStyles([styles, minimalStyles], 'better-journal-icons');
};
