import { addStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  // While the shift key is pressed, add 'no-delayed-tooltips' to the body, which will have the effect of disabling the delayed tooltips.
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey) {
      document.body.classList.add('no-delayed-tooltips');
    }
  });

  // When the shift key is released, remove 'no-delayed-tooltips' from the body, which will have the effect of re-enabling the delayed tooltips.
  document.addEventListener('keyup', (e) => {
    if (! e.shiftKey) {
      document.body.classList.remove('no-delayed-tooltips');
    }
  });
};

export default {
  id: 'delayed-tooltips',
  name: 'Delayed Tooltips',
  type: 'feature',
  default: true,
  description: 'Delays the display of tooltips so that they don\'t appear immediately when you mouse over something.',
  load: init
};
