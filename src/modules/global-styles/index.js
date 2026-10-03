import { addStyles } from '@utils';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(styles, 'global-styles');

  // The support menu item is no longer the last item in the dropdown.
  document.querySelector('.mousehuntHeaderView-dropdownContainer .menuItem.support.last')?.classList.remove('last');
};

/**
 * Initialize the module.
 */
export default {
  id: 'global-styles',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
