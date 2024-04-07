import { addStyles, isLegacyHUD } from '@utils';

import legacyStyles from './legacy-styles.css';
import styles from './styles.css';

const toggleBigTimer = () => {
  const timer = document.querySelector('.huntersHornView__timer');
  if (! timer) {
    return;
  }

  timer.addEventListener('click', () => {
    timer.classList.toggle('big-timer');
  });
};

export default async () => {
  addStyles([
    styles,
    isLegacyHUD() ? legacyStyles : '',
  ], 'experiment-big-timer');

  toggleBigTimer();
  setTimeout(toggleBigTimer, 1000);
};
