import { addStyles, getSetting } from '@utils';

import addCopyId from './copy-id';
import listenForIDPaste from './paste-hunter-id';
import settings from './settings';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = () => {
  let copyMode = getSetting('hunter-id-shortcuts.copy-mode-0', 'button');
  if (!['button', 'profile-picture', 'off'].includes(copyMode)) {
    copyMode = 'button';
  }

  if ('off' !== copyMode) {
    addStyles(styles, 'hunter-id-shortcuts');
    addCopyId(copyMode);
  }

  if (getSetting('hunter-id-shortcuts.paste', true)) {
    listenForIDPaste();
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'hunter-id-shortcuts',
  name: 'Hunter ID Shortcuts',
  type: 'friends-gifts',
  default: true,
  description: 'Copy your Hunter ID from your profile picture, and paste a Hunter ID anywhere to open that hunter’s profile.',
  load: init,
  settings,
};
