import {
  addBodyClass,
  addExternalStyles,
  addStyles,
  createPopup,
  getSetting,
  isDarkMode,
  isMHCT,
  onNavigation,
  saveSetting
} from '@utils';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const maybeShowDarkModeConflictWarning = () => {
  if (! isDarkMode()) {
    return;
  }

  const hasConfirmed = getSetting('native-dark-mode.confirmed', false);
  if (hasConfirmed) {
    return;
  }

  const popup = createPopup({
    title: 'Dark Mode Conflict Warning',
    content: `<p>${isMHCT()
      ? 'You have enabled both the MouseHunt Improved Dark Mode and the MHCT dark mode. This will cause conflicts and result in a broken experience. Please disable the MHCT setting.'
      : 'You have enabled both the MouseHunt Improved Dark Mode and the dark mode extension. This will cause conflicts and result in a broken experience. Please disable the dark mode extension.'}
      ${getSetting('native-dark-mode.has-seen-warning', false) ? '<button class="mh-improved-darkmode-conflict-popup-confirm mousehuntActionButton small gray"><span>I understand, don\'t show this again</span></button>' : ''}
    </p>`,
    className: 'mh-improved-darkmode-conflict-popup',
  });

  saveSetting('native-dark-mode.has-seen-warning', true);

  const confirmButton = document.querySelector('.mh-improved-darkmode-conflict-popup-confirm');
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      saveSetting('native-dark-mode.confirmed', true);
      popup.hide();
    });
  }
};

/**
 * Add the dark mode styles.
 */
const init = async () => {
  addStyles(styles, 'native-dark-mode');
  addExternalStyles('dark-mode-mice-images.css');

  addBodyClass('mh-dark');

  onNavigation(() => {
    addBodyClass('mh-dark');
  });

  setTimeout(maybeShowDarkModeConflictWarning, 2000);
};

/**
 * Initialize the module.
 */
export default {
  id: 'native-dark-mode',
  name: 'Dark Mode',
  description: 'Enable the dark mode.',
  type: 'feature',
  default: false,
  load: init,
};
