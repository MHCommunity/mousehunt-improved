import { addStyles, getSetting, onEvent } from '@utils';

import settings from './settings';

const loadStyleOverrides = () => {
  const customStyles = getSetting('override-styles');
  if (customStyles) {
    addStyles(customStyles, 'mousehunt-improved-override-styles');
  }
};

/**
 * Load the custom CSS.
 */
const init = async () => {
  onEvent('mh-improved-loaded', loadStyleOverrides);
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
