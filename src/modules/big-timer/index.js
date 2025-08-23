import { addStyles, isLegacyHUD } from '@utils';

import legacyStyles from './legacy-styles.css';
import styles from './styles.css';

/**
 * Toggle the big timer when clicked.
 */
const toggleBigTimer = () => {
  const timer = document.querySelector('.huntersHornView__timer');
  if (! timer) {
    return;
  }

  let isBigTimer = timer.classList.contains('big-timer');
  timer.addEventListener('click', () => {
    isBigTimer = ! isBigTimer;
    timer.classList.toggle('big-timer', isBigTimer);
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles([
    styles,
    isLegacyHUD() ? legacyStyles : '',
  ], 'experiment-big-timer');

  toggleBigTimer();
  setTimeout(toggleBigTimer, 1000);
};

export default {
  id: 'big-timer',
  name: 'Big Timer',
  type: 'feature',
  default: false,
  description: 'Click the timer to toggle between sizes.',
  load: init,
};
