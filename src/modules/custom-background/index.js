import { addStyles, getSetting, onNavigation } from '@utils';

import settings from './settings';
import styles from './styles.css';

let addedClass = '';
const addBodyClass = () => {
  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  const background = getSetting('custom-background-0', 'default');

  // remove the old class
  if (addedClass) {
    body.classList.remove(addedClass);
  }

  if ('default' === background) {
    return;
  }

  body.classList.add(background);
  addedClass = background;
};

const persistBackground = () => {
  addBodyClass();
  onNavigation(() => {
    addBodyClass();
    setTimeout(addBodyClass, 250);
    setTimeout(addBodyClass, 500);
  });

  onNavigation(() => {
    const input = document.querySelector('#mousehunt-improved-settings-feature-custom-background select');
    if (! input) {
      return;
    }

    input.addEventListener('change', () => {
      addBodyClass();
    });
  }, {
    page: 'preferences',
    onLoad: true,
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  persistBackground();
};

export default {
  id: 'custom-background',
  name: 'Custom Background',
  type: 'feature',
  default: false,
  description: 'Change the background to an event background or a color.',
  load: init,
  alwaysLoad: true,
  settings,
};
