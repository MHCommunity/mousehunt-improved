import {
  addIconToMenu,
  addStyles,
  clearCaches,
  createPopup,
  dataSet,
  dbDeleteAll,
  getCurrentLocation,
  getCurrentPage,
  getCurrentTab,
  getSetting,
  getSettings,
  makeElement,
  onEvent,
  parseEncodedValue,
  saveSetting,
  setPage,
  showErrorMessage,
  showSuccessMessage
} from '@utils';

import settingsSettings from './settings';

import icons from './icons.css';
import styles from './styles.css';

/**
 * Add the export settings button.
 *
 * @param {HTMLElement} append The element to append to.
 *
 * @return {HTMLElement} The export settings button.
 */
const addExportSettings = (append) => {
  const existing = document.querySelector('.mousehunt-improved-export-settings');
  if (existing) {
    existing.remove();
  }

  const exportSettings = makeElement('div', ['mousehunt-improved-export-settings', 'mousehuntActionButton', 'tiny']);
  makeElement('span', '', 'Import / Export Settings', exportSettings);

  exportSettings.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const settingValues = JSON.parse(localStorage.getItem('mousehunt-improved-settings'));

    // Since 0.72.0, we've been storing the override-styles as a base64 encoded string.
    if (
      settingValues &&
      settingValues['override-styles'] &&
      'string' === typeof settingValues['override-styles'] &&
      ! settingValues['override-styles'].startsWith('data:')
    ) {
      settingValues['override-styles'] = `data:text/css;base64,${btoa(settingValues['override-styles'])}`;
    }

    const settings = JSON.stringify(settingValues, null, 2);
    const content = `<div class="mousehunt-improved-settings-export-popup-content">
    <div class="mousehunt-improved-settings-export-popup-tip">
      To import settings, drag and drop the file into the box below, or paste the text in the box.
    </div>
    <textarea id="mousehunt-improved-settings-text" spellcheck="false">${settings}</textarea>
    <div class="mousehunt-improved-settings-export-popup-buttons">
      <div class="mousehunt-improved-settings-export-details">
        <a href="#" class="export-copy">Copy to clipboard</a>
        <a href="#" class="export-download">Download file</a>
        <hr>
        <a href="#" class="export-upload">Upload file</a>
        <a href="#" class="export-format">Format</a>
        <a href="#" class="export-reset">Reset to default</a>
      </div>
      <div class="mousehunt-improved-settings-export-popup-buttons-buttons">
        <div class="mousehuntActionButton save">
          <span>Save</span>
        </div>
        <div class="mousehuntActionButton cancel">
          <span>Cancel</span>
        </div>
      </div>
    </div>`;

    /* eslint-disable @wordpress/no-unused-vars-before-return */
    const popup = createPopup({
      title: `MouseHunt Improved Settings <code>v${mhImprovedVersion}</code>`,
      content,
      className: 'mousehunt-improved-settings-export-popup',
      show: true,
    });
    /* eslint-enable @wordpress/no-unused-vars-before-return */

    // Save the current settings to the backup.
    if (! window.location.search.includes('safe-mode')) {
      localStorage.setItem('mousehunt-improved-settings-backup', JSON.stringify(getSettings()));
    }

    const popupElement = document.querySelector('.mousehunt-improved-settings-export-popup');
    if (! popupElement) {
      return;
    }

    const textarea = popupElement.querySelector('textarea');

    textarea.addEventListener('dragover', (dragevent) => {
      dragevent.preventDefault();
      textarea.classList.add('dragover');
    });

    // Add the drop event listener
    textarea.addEventListener('drop', (dropevent) => {
      dropevent.preventDefault();

      textarea.classList.remove('dragover');

      // Get the file
      if (! dropevent.dataTransfer?.files?.length) {
        return;
      }

      const file = dropevent.dataTransfer.files[0];
      const reader = new FileReader();

      /**
       * When the file is loaded, set the textarea value to the file contents.
       *
       * @param {Event} loadEvent The load event.
       */
      reader.onload = (loadEvent) => {
        textarea.value = loadEvent.target.result;
      };

      reader.readAsText(file);
    });

    const uploadButton = document.querySelector('.export-upload');
    uploadButton.addEventListener('click', (evt) => {
      evt.preventDefault();

      // prompt the user to select a file
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (changeEvent) => {
        if (! changeEvent?.target?.files?.length) {
          return;
        }

        const file = changeEvent.target.files[0];
        const reader = new FileReader();

        /**
         * When the file is loaded, set the textarea value to the file contents.
         *
         * @param {Event} loadEvent The load event.
         */
        reader.onload = (loadEvent) => {
          textarea.value = loadEvent.target.result;
        };

        reader.readAsText(file);
      });

      input.click();
    });

    const resetButton = document.querySelector('.export-reset');
    resetButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      textarea.value = JSON.stringify({
        'mh-improved-platform': mhImprovedPlatform,
        'mh-improved-version': mhImprovedVersion,
      }, null, 2);
    });

    const formatButton = document.querySelector('.export-format');
    formatButton.addEventListener('click', (evt) => {
      evt.preventDefault();

      const currentSettings = JSON.parse(textarea.value);

      // sort the keys alphabetically, with the mh-improved keys at the top
      const sorted = Object.keys(currentSettings).sort((a, b) => {
        if (a.startsWith('mh-improved') && ! b.startsWith('mh-improved')) {
          return -1;
        }

        if (b.startsWith('mh-improved') && ! a.startsWith('mh-improved')) {
          return 1;
        }

        return a.localeCompare(b);
      });

      const newSettings = {};
      sorted.forEach((key) => {
        newSettings[key] = currentSettings[key];
      });

      textarea.value = JSON.stringify(newSettings, null, 2);
    });

    const saveButton = popupElement.querySelector('.mousehuntActionButton.save');
    saveButton.addEventListener('click', () => {
      const newSettings = textarea.value;

      // Verify that the settings are valid JSON
      try {
        // Since 0.72.0, we've been storing the override-styles as a base64 encoded string.
        if (newSettings && newSettings['override-styles'] && newSettings['override-styles'].startsWith('data:')) {
          newSettings['override-styles'] = parseEncodedValue(newSettings['override-styles']);
        }

        JSON.parse(newSettings);
      } catch (error) {
        showErrorMessage({
          message: 'Invalid JSON. Settings not saved.',
          append: saveButton,
          after: true,
          classname: 'settings-export-save-error',
        });

        console.error(error); // eslint-disable-line no-console

        return;
      }

      localStorage.setItem('mousehunt-improved-settings-backup', localStorage.getItem('mousehunt-improved-settings'));
      localStorage.setItem('mousehunt-improved-settings', newSettings);

      showSuccessMessage({
        message: 'Settings saved. Refreshing…',
        append: saveButton,
        after: true,
        classname: 'settings-export-save-success',
      });

      setTimeout(() => {
        window.location.reload();
      });
    });

    const copyButton = popupElement.querySelector('.export-copy');
    copyButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      navigator.clipboard.writeText(textarea.value);
      showSuccessMessage({
        message: 'Settings copied to clipboard.',
        append: copyButton,
        after: true,
        classname: 'settings-export-copy-success',
      });
    });

    const downloadButton = popupElement.querySelector('.export-download');
    downloadButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      const link = document.createElement('a');
      link.download = 'mousehunt-improved-settings.json';
      link.href = `data:application/json;base64,${btoa(settings)}`;
      link.click();
    });

    const cancelButton = popupElement.querySelector('.mousehuntActionButton.cancel');
    cancelButton.addEventListener('click', () => {
      popup.hide();
    });
  });

  append.append(exportSettings);

  return exportSettings;
};

/**
 * Add the advanced settings buttons.
 */
const addAdvancedSettingsButtons = () => {
  const settingInput = document.querySelector('#mousehunt-improved-settings-advanced-mh-improved-advanced-settings .PagePreferences__setting');
  if (settingInput) {
    addExportSettings(settingInput);
  }

  const settingWrapper = document.querySelector('#mousehunt-improved-settings-advanced-wrapper');
  if (! settingWrapper) {
    return;
  }

  const existing = document.querySelector('.mousehunt-improved-advanced-buttons');
  if (existing) {
    existing.remove();
  }

  const buttonsWrapper = makeElement('div', 'mousehunt-improved-advanced-buttons');

  const clearCachedDataLink = makeElement('a', 'clear-cache-link', 'Clear Cached Data');
  clearCachedDataLink.href = '#';
  clearCachedDataLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to clear the cached data?')) { // eslint-disable-line no-alert
      await clearCaches();

      // Delete all the mh-improved keys that are in session storage.
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('mh-improved')) {
          sessionStorage.removeItem(key);
        }
      }

      // Clear the ar
      localStorage.removeItem(`mh-improved-cached-ar-v${mhImprovedVersion}`);

      window.location.reload();
    }
  });
  buttonsWrapper.append(clearCachedDataLink);

  const resetJournalLink = makeElement('a', 'reset-link', 'Reset Journal History');
  resetJournalLink.href = '#';
  resetJournalLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to reset your journal history?')) { // eslint-disable-line no-alert
      await dbDeleteAll('journal');
      window.location.reload();
    }
  });
  buttonsWrapper.append(resetJournalLink);

  const resetDashboardLink = makeElement('a', 'reset-link', 'Reset Location Dashboard');
  resetDashboardLink.href = '#';
  resetDashboardLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to reset your dashboard data?')) { // eslint-disable-line no-alert
      await dataSet('quests', {});
      window.location.reload();
    }
  });
  buttonsWrapper.append(resetDashboardLink);

  settingWrapper.append(buttonsWrapper);
};

/**
 * Highlight the current location in the location hud settings.
 */
const highlightLocationHud = () => {
  const locationHudSettings = document.querySelector(`#mousehunt-improved-settings-location-hud-location-huds-enabled-${getCurrentLocation()}`);
  if (locationHudSettings) {
    locationHudSettings.classList.add('highlight');
  }
};

/**
 * Add toggles to the settings page headers.
 */
const addTogglesToSettings = () => {
  const settingsPage = document.querySelectorAll('.PagePreferences .mousehuntHud-page-tabContent.game_settings.mousehunt-improved-settings .PagePreferences__section');
  if (! settingsPage) {
    return;
  }

  const toggles = document.querySelectorAll('.mhui-setting-toggle');
  toggles.forEach((toggle) => {
    toggle.remove();
  });

  // Beta section is default hidden.
  let toggledSections = getSetting('settings.toggled-sections', ['mousehunt-improved-settings-beta', 'mousehunt-improved-settings-advanced']);

  settingsPage.forEach((setting) => {
    // Append an svg to toggle the class
    const toggle = makeElement('div', 'mhui-setting-toggle');
    const titleText = setting.querySelector('.PagePreferences__titleText');
    if (titleText.childNodes.length > 1) {
      titleText.insertBefore(toggle, titleText.childNodes[1]);
    } else {
      titleText.append(toggle);
    }

    // add the event listener to toggle the class
    titleText.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        return;
      }

      event.preventDefault();

      toggledSections = getSetting('settings.toggled-sections', ['mousehunt-improved-settings-beta', 'mousehunt-improved-settings-advanced']);

      const toggled = setting.classList.contains('toggled');
      if (toggled) {
        setting.classList.remove('toggled');
        toggle.classList.remove('toggled');

        // save to session storage
        toggledSections = toggledSections.filter((section) => section !== setting.id);
      } else {
        setting.classList.add('toggled');
        toggle.classList.add('toggled');

        // save to session storage
        toggledSections.push(setting.id);
      }

      saveSetting('settings.toggled-sections', toggledSections);
    });

    if (toggledSections.includes(setting.id)) {
      setting.classList.add('toggled');
      toggle.classList.add('toggled');
    } else {
      setting.classList.remove('toggled');
      toggle.classList.remove('toggled');
    }
  });
};

/**
 * Move the tab to the end.
 */
const moveTabToEnd = () => {
  const mhImprovedTab = document.querySelector('#mousehunt-improved-settings');
  if (! mhImprovedTab) {
    return;
  }

  const userscriptTab = document.querySelector('#userscript-settings');
  if (! userscriptTab) {
    return;
  }

  userscriptTab.after(mhImprovedTab);
};

/**
 * Add the icon to the menu.
 */
const addMhImprovedIconToMenu = () => {
  addIconToMenu({
    id: 'mousehunt-improved-icon-menu',
    href: 'https://www.mousehuntgame.com/preferences.php?tab=mousehunt-improved-settings',
    title: 'MouseHunt Improved Settings',
    position: 'append',

    /**
     * The action to perform when the icon is clicked.
     *
     * @param {Event} e The event.
     */
    action: (e) => {
      if ('preferences' === getCurrentPage() && 'mousehunt-improved-settings' === getCurrentTab()) {
        e.preventDefault();
        setPage('Camp');
      }
    },
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    styles,
    icons,
  ], 'mousehunt-improved-settings');

  addMhImprovedIconToMenu();
  onEvent('mh-improved-setting-added-to-page', (module) => {
    if (module?.key === 'error-reporting') {
      moveTabToEnd();
      highlightLocationHud();
      addAdvancedSettingsButtons();

      if (! getSetting('experiments.new-settings-styles-columns', false)) {
        addTogglesToSettings();
      }
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: '_settings',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings: settingsSettings,
};
