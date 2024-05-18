import { addStyles, getSetting, onEvent } from '@utils';

import settings from './settings';

/**
 * Load the custom CSS.
 */
const init = async () => {
  onEvent('mh-improved-loaded', () => {
    const customStyles = getSetting('override-styles');
    if (customStyles) {
      addStyles(customStyles, 'mousehunt-improved-override-styles');
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'custom-css',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings,
};
