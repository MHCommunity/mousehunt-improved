import { addUIStyles, getMhuiSetting, getFlag } from '../utils';
import globalStyles from './styles/global-styles.css';

import fixes from './modules/fixes';
import highlightUsers from './modules/highlight-users';
import links from './modules/links';
import settings from './modules/settings';
import updateNotifications from './modules/update-notifications';

const loadStyleOverrides = () => {
  const customStyles = getMhuiSetting('override-styles');
  if (customStyles) {
    addStyles(customStyles, 'mousehunt-improved-override-styles');
  }
};

export default () => {
  addUIStyles(globalStyles);

  if (! getFlag('no-fixes')) {
    fixes();
  }

  if (! getFlag('no-highlight-users')) {
    highlightUsers();
  }

  if (! getFlag('no-links')) {
    links();
  }

  if (! getFlag('no-update-notifications')) {
    updateNotifications();
  }

  settings();
  loadStyleOverrides();
};
