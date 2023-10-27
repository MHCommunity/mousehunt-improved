import { addUIStyles, getMhuiSetting } from '../utils';
import globalStyles from './styles/global-styles.css';

import fixes from './modules/fixes';
import highlightUsers from './modules/highlight-users';
import settings from './modules/settings';

const loadStyleOverrides = () => {
  const customStyles = getMhuiSetting('override-styles');
  if (customStyles) {
    addStyles(customStyles, 'mousehunt-improved-override-styles');
  }
};

export default () => {
  addUIStyles(globalStyles);

  fixes();
  highlightUsers();
  settings();

  loadStyleOverrides();
};
