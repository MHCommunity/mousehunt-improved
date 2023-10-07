import { addUIStyles } from '../../utils';

import globalStyles from './global-styles.css';
import fixes from './fixes.css';
import darkMode from './dark-mode.css';
import settings from './settings.css';

export default () => {
  addUIStyles([
    globalStyles,
    fixes,
    darkMode,
    settings
  ].join('\n'));
};
