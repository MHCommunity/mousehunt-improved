import { addBodyClass, addExternalStyles, addStyles } from '@utils';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const init = async () => {
  addStyles(styles, 'native-dark-mode');
  addExternalStyles('https://api.mouse.rip/dark-mode-mice-images.css');

  addBodyClass('mh-dark');
};

export default {
  id: 'native-dark-mode',
  name: 'Native Dark Mode',
  description: 'Please disable the Dark Mode extension/MHCT setting to prevent conflicts.',
  type: 'beta',
  default: false,
  load: init,
};
