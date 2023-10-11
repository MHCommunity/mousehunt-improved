import { addUIStyles } from '../../utils';
import styles from '../styles/settings.css';

const addExportSettings = () => {
  const wrapper = document.querySelector('#mousehunt-improved-settings-mousehunt-improved-settings-overrides .PagePreferences__titleText');
  if (! wrapper) {
    return;
  }

  const exportSettings = makeElement('div', ['mousehunt-improved-export-settings', 'mousehuntActionButton', 'tiny']);
  makeElement('span', '', 'Import / Export Settings', exportSettings);

  const settings = JSON.stringify(JSON.parse(localStorage.getItem('mousehunt-improved-settings')), null, 2);
  const content = `<div class="mousehunt-improved-settings-export-popup-content">
  <textarea>${settings}</textarea>
  <div class="mousehunt-improved-settings-export-popup-buttons">
  <div class="mousehuntActionButton save"><span>Save</span></div>
  <div class="mousehuntActionButton lightBlue download"><span>Download</span></div>
  <div class="mousehuntActionButton cancel"><span>Cancel</span></div>`;

  exportSettings.addEventListener('click', () => {
    /* eslint-disable @wordpress/no-unused-vars-before-return */
    const popup = createPopup({
      title: 'MouseHunt Improved Settings',
      content,
      className: 'mousehunt-improved-settings-export-popup',
      show: true
    });
    /* eslint-enable @wordpress/no-unused-vars-before-return */

    const popupEl = document.querySelector('.mousehunt-improved-settings-export-popup');
    if (! popupEl) {
      return;
    }

    const saveButton = popupEl.querySelector('.mousehuntActionButton.save');
    saveButton.addEventListener('click', () => {
      const textarea = popupEl.querySelector('textarea');
      const newSettings = textarea.value;
      localStorage.setItem('mousehunt-improved-settings', newSettings);
      window.location.reload();
    });

    const downloadButton = popupEl.querySelector('.mousehuntActionButton.download');
    downloadButton.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'mousehunt-improved-settings.json';
      link.href = `data:application/json;base64,${btoa(settings)}`;
      link.click();
    });

    const cancelButton = popupEl.querySelector('.mousehuntActionButton.cancel');
    cancelButton.addEventListener('click', () => {
      popup.hide();
    });
  });

  wrapper.appendChild(exportSettings);
};

const modifySettingsPage = () => {
  const settingsPage = document.querySelectorAll('.PagePreferences .mousehuntHud-page-tabContent.game_settings.mousehunt-improved-settings .PagePreferences__title');
  if (! settingsPage) {
    return;
  }

  settingsPage.forEach((setting) => {
    // Append an svg to toggle the class
    const toggle = makeElement('div', 'toggle');
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>`;

    const titleText = setting.querySelector('.PagePreferences__titleText');
    titleText.appendChild(toggle);

    // add the event listener to toggle the class
    toggle.addEventListener('click', () => {
      const toggled = setting.classList.contains('toggled');
      if (toggled) {
        setting.classList.remove('toggled');
        toggle.classList.remove('toggled');
      } else {
        setting.classList.add('toggled');
        toggle.classList.add('toggled');
      }
    });
  });

  setTimeout(addExportSettings, 1000);
};

export default () => {
  addUIStyles(styles);

  onNavigation(modifySettingsPage,
    {
      page: 'preferences',
      tab: 'mousehunt-improved-settings',
      onLoad: true,
    }
  );
};
