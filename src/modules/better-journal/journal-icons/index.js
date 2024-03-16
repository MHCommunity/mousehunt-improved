import { addStyles } from '@utils';

import minimalStyles from '../journal-icons-minimal/styles.css';

export default async () => {
  const existing = document.querySelector('#better-journal-icons');
  if (existing) {
    return;
  }

  const style = document.createElement('link');
  style.id = 'better-journal-icons';
  style.rel = 'stylesheet';
  style.href = 'https://i.mouse.rip/css/journal-icons.css?v=1.0.1';

  document.head.append(style);

  addStyles(minimalStyles, 'better-journal-icons');
};
