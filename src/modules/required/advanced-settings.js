import { clearCaches, createPopup, makeElement, onEvent } from '@utils';

const addExportSettings = () => {
  const wrapper = document.querySelector('#mousehunt-improved-settings-mousehunt-improved-settings-overrides .PagePreferences__titleText');
  if (! wrapper) {
    return;
  }

  const existing = document.querySelector('.mousehunt-improved-export-settings');
  if (existing) {
    existing.remove();
  }

  const exportSettings = makeElement('div', ['mousehunt-improved-export-settings', 'mousehuntActionButton', 'tiny']);
  makeElement('span', '', 'Import / Export Settings', exportSettings);

  const settings = JSON.stringify(JSON.parse(localStorage.getItem('mousehunt-improved-settings')), null, 2);
  const content = `<div class="mousehunt-improved-settings-export-popup-content">
  <textarea>${settings}</textarea>
  <div class="mousehunt-improved-settings-export-popup-buttons">
  <pre>${mhImprovedPlatform} v${mhImprovedVersion}</pre>
  <div class="mousehuntActionButton save"><span>Save</span></div>
  <div class="mousehuntActionButton lightBlue download"><span>Download</span></div>
  <div class="mousehuntActionButton cancel"><span>Cancel</span></div>`;

  exportSettings.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    /* eslint-disable @wordpress/no-unused-vars-before-return */
    const popup = createPopup({
      title: 'MouseHunt Improved Settings',
      content,
      className: 'mousehunt-improved-settings-export-popup',
      show: true,
    });
    /* eslint-enable @wordpress/no-unused-vars-before-return */

    const popupElement = document.querySelector('.mousehunt-improved-settings-export-popup');
    if (! popupElement) {
      return;
    }

    const saveButton = popupElement.querySelector('.mousehuntActionButton.save');
    saveButton.addEventListener('click', () => {
      const textarea = popupElement.querySelector('textarea');
      const newSettings = textarea.value;
      localStorage.setItem('mousehunt-improved-settings', newSettings);
      window.location.reload();
    });

    const downloadButton = popupElement.querySelector('.mousehuntActionButton.download');
    downloadButton.addEventListener('click', () => {
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

  wrapper.append(exportSettings);
};

const addClearCache = () => {
  const wrapper = document.querySelector('#mousehunt-improved-settings-mousehunt-improved-settings-overrides .PagePreferences__titleText');
  if (! wrapper) {
    return;
  }

  const existing = document.querySelector('.mousehunt-improved-clear-cache');
  if (existing) {
    existing.remove();
  }

  const clearCache = makeElement('div', ['mousehunt-improved-clear-cache', 'mousehuntActionButton', 'tiny']);
  makeElement('span', '', 'Clear Cached Data', clearCache);

  clearCache.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear the data-caches.
    // Confirm the clear
    const confirm = window.confirm('Are you sure you want to clear the cached data?'); // eslint-disable-line no-alert
    if (! confirm) {
      return;
    }

    clearCaches();

    // Delete all the mh-improved keys that are in session storage.
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('mh-improved')) {
        sessionStorage.removeItem(key);
      }
    }

    // Clear the ar
    localStorage.removeItem(`mh-improved-cached-ar-v${mhImprovedVersion}`);
    window.location.reload();
  });

  wrapper.append(clearCache);
};

export default () => {
  onEvent('mh-improved-settings-loaded', () => {
    addExportSettings();
    addClearCache();
  });
};
