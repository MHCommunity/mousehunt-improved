import { addStyles, getGlobal, getSetting, onEvent } from '@utils';

import settings from './settings';

/**
 * Load the custom CSS.
 */
const init = async () => {
  onEvent('mh-improved-loaded', () => {
    const queryParams = getGlobal('query-params');
    if (queryParams && queryParams.includes('no-custom-styles')) {
      return;
    }

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
