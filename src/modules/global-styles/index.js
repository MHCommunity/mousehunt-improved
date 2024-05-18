import { addStyles } from '@utils';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'global-styles');
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
