import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

export default async () => {
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
