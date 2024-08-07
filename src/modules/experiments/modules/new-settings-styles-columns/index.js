import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'new-settings-styles-columns');

  onNavigation(async () => {
    const settings = document.querySelectorAll('.PagePreferences__settingsWrapper > .PagePreferences__settingsList');
    settings.forEach((setting) => {
      setting.addEventListener('click', () => {
        setting.classList.toggle('hover');
      });
    });
  }, {
    page: 'preferences',
  });
};

export default {
  id: 'experiments.new-settings-styles-columns',
  name: 'Settings: Columns',
  load: init,
};
