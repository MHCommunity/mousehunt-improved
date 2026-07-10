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
  getSettings,
  makeElement,
  markCachesAsExpired,
  onEvent,
  parseEncodedValue,
  setPage,
  showErrorMessage,
  showSuccessMessage,
  updateCaches
} from '@utils';

import styles from './styles.css';

/**
 * Prepare settings for exporting.
 *
 * @param {Object} settingValues The settings to prepare.
 *
 * @return {Object} The prepared settings.
 */
const normalizeSettingsForExport = (settingValues = {}) => {
  const exportableSettings = { ...settingValues };

  if (
    exportableSettings['override-styles'] &&
    'string' === typeof exportableSettings['override-styles'] &&
    ! exportableSettings['override-styles'].startsWith('data:')
  ) {
    exportableSettings['override-styles'] = `data:text/css;base64,${btoa(exportableSettings['override-styles'])}`;
  }

  return exportableSettings;
};

/**
 * Parse settings text and normalize imported values.
 *
 * @param {string} settingText JSON settings text.
 *
 * @return {Object} The parsed settings object.
 */
const parseSettingsText = (settingText) => {
  const parsedSettings = JSON.parse(settingText);

  if (
    parsedSettings &&
    parsedSettings['override-styles'] &&
    'string' === typeof parsedSettings['override-styles'] &&
    parsedSettings['override-styles'].startsWith('data:')
  ) {
    parsedSettings['override-styles'] = parseEncodedValue(parsedSettings['override-styles']);
  }

  return parsedSettings;
};

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

  const exportSettings = makeElement('div', ['mousehunt-improved-export-settings', 'mousehuntActionButton', 'small']);
  makeElement('span', '', 'Import / Export Settings', exportSettings);

  exportSettings.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const settings = JSON.stringify(normalizeSettingsForExport(getSettings()), null, 2);
    const content = `<div class="mousehunt-improved-settings-export-popup-content">
    <div class="mousehunt-improved-settings-export-popup-tip">
      Import settings by dragging a file here or pasting text into the box.
    </div>
    <textarea id="mousehunt-improved-settings-text" spellcheck="false">${settings}</textarea>
    <div class="mousehunt-improved-settings-export-popup-buttons">
      <div class="mousehunt-improved-settings-export-details">
        <a href="#" class="export-copy">Copy to clipboard</a>
        <a href="#" class="export-download">Download JSON file</a>
        <hr>
        <a href="#" class="export-upload">Import from file</a>
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

    const uploadButton = popupElement.querySelector('.export-upload');
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

    const resetButton = popupElement.querySelector('.export-reset');
    resetButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      textarea.value = JSON.stringify({
        'mh-improved-platform': mhImprovedPlatform,
        'mh-improved-version': mhImprovedVersion,
      }, null, 2);
    });

    const formatButton = popupElement.querySelector('.export-format');
    formatButton.addEventListener('click', (evt) => {
      evt.preventDefault();

      let currentSettings = {};
      try {
        currentSettings = parseSettingsText(textarea.value);
      } catch {
        showErrorMessage({
          message: 'Invalid JSON. Unable to format settings.',
          append: formatButton,
          after: true,
          classname: 'settings-export-format-error',
        });

        return;
      }

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
      let newSettings = {};

      // Verify that the settings are valid JSON
      try {
        newSettings = parseSettingsText(textarea.value);
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
      localStorage.setItem('mousehunt-improved-settings', JSON.stringify(newSettings));

      showSuccessMessage({
        message: 'Settings saved. Refreshing…',
        append: saveButton,
        after: true,
        classname: 'settings-export-save-success',
      });

      setTimeout(() => window.location.reload(), 0);
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
      link.href = `data:application/json;base64,${btoa(textarea.value)}`;
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
  const settingWrapper = document.querySelector('#mousehunt-improved-settings-advanced-wrapper');
  if (! settingWrapper) {
    return;
  }

  const existing = document.querySelector('.mousehunt-improved-advanced-buttons');
  if (existing) {
    existing.remove();
  }

  const buttonsWrapper = makeElement('div', 'mousehunt-improved-advanced-buttons');

  addExportSettings(buttonsWrapper);

  const linkWrapper = makeElement('div', 'mousehunt-improved-advanced-links');
  const updateGameDataLink = makeElement('a', 'update-data-link', 'Update Data');
  updateGameDataLink.href = '#';
  updateGameDataLink.addEventListener('click', async (e) => {
    e.preventDefault();

    if (updateGameDataLink.classList.contains('updating')) {
      return;
    }

    updateGameDataLink.classList.add('updating');
    updateGameDataLink.textContent = 'Updating Data…';

    await markCachesAsExpired();
    await updateCaches();

    window.location.reload();
  });
  linkWrapper.append(updateGameDataLink);

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
  linkWrapper.append(clearCachedDataLink);

  const resetJournalLink = makeElement('a', 'reset-link', 'Reset Journal History');
  resetJournalLink.href = '#';
  resetJournalLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to reset your journal history?')) { // eslint-disable-line no-alert
      await dbDeleteAll('journal');
      window.location.reload();
    }
  });
  linkWrapper.append(resetJournalLink);

  const resetDashboardLink = makeElement('a', 'reset-link', 'Reset Location Dashboard');
  resetDashboardLink.href = '#';
  resetDashboardLink.addEventListener('click', async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to reset your dashboard data?')) { // eslint-disable-line no-alert
      await dataSet('quests', {});
      window.location.reload();
    }
  });
  linkWrapper.append(resetDashboardLink);
  buttonsWrapper.append(linkWrapper);

  settingWrapper.append(buttonsWrapper);
};

/**
 * Highlight the current location in the location hud settings.
 */
const highlightLocationHud = () => {
  const locationHudSettings = document.querySelector(`#mousehunt-improved-settings-location-huds-enabled-${getCurrentLocation()}`);
  if (locationHudSettings) {
    locationHudSettings.classList.add('highlight');
  }
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
 * Get the title text for a settings section.
 *
 * @param {HTMLElement} section The section element.
 *
 * @return {string} The title text.
 */
const getSectionTitleText = (section) => {
  const sectionTitle = section.querySelector('.PagePreferences__titleText');

  return sectionTitle ? sectionTitle.textContent.trim() : '';
};

/**
 * Get the description text for a settings section.
 *
 * @param {HTMLElement} section The section element.
 *
 * @return {string} The description text.
 */
const getSectionDescription = (section) => {
  const nextElement = section.nextElementSibling;
  if (nextElement?.classList?.contains('settings-subheader')) {
    return nextElement.textContent.trim();
  }

  return '';
};

/**
 * Get the top-level settings in a section.
 *
 * @param {HTMLElement} section The section element.
 *
 * @return {Array} The setting elements.
 */
const getSectionSettings = (section) => {
  return [...section.querySelectorAll('.PagePreferences__sectionWrapper > .PagePreferences__settingsList')];
};

/**
 * Get the searchable text for a setting, ignoring input values.
 *
 * @param {HTMLElement} setting The setting element.
 *
 * @return {string} The searchable text, lowercased.
 */
const getSettingSearchText = (setting) => {
  const clonedSetting = setting.cloneNode(true);
  clonedSetting.querySelectorAll('select, input, textarea, .multiSelect').forEach((element) => element.remove());

  return clonedSetting.textContent.toLowerCase();
};

/**
 * Show a section and mark its sidebar item as active.
 *
 * @param {HTMLElement} settingsPage The settings page element.
 * @param {string}      sectionId    The ID of the section to show.
 */
const setActiveSettingsSection = (settingsPage, sectionId) => {
  const sections = settingsPage.querySelectorAll('.mhui-settings-main > .PagePreferences__section');
  const navItems = settingsPage.querySelectorAll('.mhui-settings-nav-item');

  settingsPage.dataset.activeSection = sectionId;

  sections.forEach((section) => {
    section.classList.toggle('mhui-settings-section-active', section.id === sectionId);
  });

  navItems.forEach((navItem) => {
    navItem.classList.toggle('active', navItem.dataset.sectionId === sectionId);
  });
};

/**
 * Add (or return the existing) empty state element for search results.
 *
 * @param {HTMLElement} settingsPage The settings page element.
 *
 * @return {HTMLElement} The empty state element.
 */
const addSearchEmptyState = (settingsPage) => {
  let emptyState = settingsPage.querySelector('.mhui-settings-search-empty');
  if (emptyState) {
    return emptyState;
  }

  emptyState = makeElement('div', 'mhui-settings-search-empty');
  makeElement('div', 'mhui-settings-search-empty-title', 'No matching settings', emptyState);
  makeElement('div', 'mhui-settings-search-empty-copy', 'Try a module name, setting name, or a word from the description.', emptyState);

  const main = settingsPage.querySelector('.mhui-settings-main');
  if (main) {
    main.prepend(emptyState);
  }

  return emptyState;
};

/**
 * Filter the visible settings to those matching the search term.
 *
 * @param {HTMLElement} settingsPage The settings page element.
 * @param {string}      searchTerm   The search term.
 */
const applySettingsSearch = (settingsPage, searchTerm) => {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const sections = settingsPage.querySelectorAll('.mhui-settings-main > .PagePreferences__section');
  const emptyState = addSearchEmptyState(settingsPage);
  let matchingSections = 0;

  settingsPage.classList.toggle('mhui-settings-search-active', Boolean(normalizedSearchTerm));

  if (! normalizedSearchTerm) {
    sections.forEach((section) => {
      getSectionSettings(section).forEach((setting) => {
        setting.style.display = '';
      });
    });
    emptyState.classList.remove('active');
    setActiveSettingsSection(settingsPage, settingsPage.dataset.activeSection || sections[0]?.id);
    return;
  }

  sections.forEach((section) => {
    const sectionTitleMatches = getSectionTitleText(section).toLowerCase().includes(normalizedSearchTerm);
    const sectionDescriptionMatches = getSectionDescription(section).toLowerCase().includes(normalizedSearchTerm);
    let sectionMatches = sectionTitleMatches || sectionDescriptionMatches;

    getSectionSettings(section).forEach((setting) => {
      const settingMatches = sectionMatches || getSettingSearchText(setting).includes(normalizedSearchTerm);
      setting.style.display = settingMatches ? '' : 'none';
      sectionMatches = sectionMatches || settingMatches;
    });

    section.classList.toggle('mhui-settings-section-active', sectionMatches);
    if (sectionMatches) {
      matchingSections++;
    }
  });

  emptyState.classList.toggle('active', matchingSections === 0);
};

/**
 * Reveal the section and setting referenced by the URL hash, if any.
 *
 * @param {HTMLElement} settingsPage The settings page element.
 */
const showSettingFromHash = (settingsPage) => {
  const hash = window.location.hash.slice(1);
  if (! hash) {
    return;
  }

  const target = settingsPage.querySelector(`#${CSS.escape(hash)}`);
  if (! target) {
    return;
  }

  const section = target.closest('.mhui-settings-main > .PagePreferences__section');
  if (! section) {
    return;
  }

  setActiveSettingsSection(settingsPage, section.id);

  if (target !== section) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('mhui-settings-hash-target');
    setTimeout(() => target.classList.remove('mhui-settings-hash-target'), 2000);
  }
};

/**
 * Wrap the settings sections in a sidebar-navigation browser layout.
 */
const createSettingsBrowser = () => {
  const settingsPage = document.querySelector('.mousehuntHud-page-tabContent.game_settings.mousehunt-improved-settings.active');
  if (! settingsPage || settingsPage.querySelector('.mhui-settings-browser')) {
    return;
  }

  const sections = [...settingsPage.querySelectorAll('.PagePreferences__section')];
  if (! sections.length) {
    return;
  }

  const browser = makeElement('div', 'mhui-settings-browser');
  const sidebar = makeElement('nav', 'mhui-settings-sidebar');
  const sidebarTitle = makeElement('div', 'mhui-settings-sidebar-title', 'Categories');
  const navList = makeElement('div', 'mhui-settings-nav-list');
  const main = makeElement('div', 'mhui-settings-main');

  sidebar.append(sidebarTitle);
  sidebar.append(navList);
  browser.append(sidebar);
  browser.append(main);

  sections.forEach((section, index) => {
    const sectionDescription = getSectionDescription(section);
    const nextElement = section.nextElementSibling;
    if (nextElement?.classList?.contains('settings-subheader')) {
      nextElement.remove();
    }

    const sectionTitle = getSectionTitleText(section);

    section.classList.add('mhui-settings-browser-section');

    const sectionIntro = section.querySelector('.mhui-settings-section-intro');
    if (! sectionIntro) {
      const newIntro = makeElement('div', 'mhui-settings-section-intro');
      if (sectionDescription) {
        makeElement('div', 'mhui-settings-section-description', sectionDescription, newIntro);
      }

      const wrapper = section.querySelector('.PagePreferences__sectionWrapper');
      if (wrapper) {
        wrapper.before(newIntro);
      }
    }

    const navItem = makeElement('button', 'mhui-settings-nav-item');
    navItem.type = 'button';
    navItem.dataset.sectionId = section.id;
    makeElement('span', 'mhui-settings-nav-label', sectionTitle, navItem);
    navItem.addEventListener('click', () => {
      const searchField = settingsPage.querySelector('.mhui-settings-header-search');
      if (searchField) {
        searchField.value = '';
      }

      applySettingsSearch(settingsPage, '');
      setActiveSettingsSection(settingsPage, section.id);
    });
    navList.append(navItem);

    main.append(section);

    if (index === 0) {
      settingsPage.dataset.activeSection = section.id;
    }
  });

  const header = settingsPage.querySelector('.mhui-settings-header');
  if (header) {
    header.after(browser);
  } else {
    settingsPage.prepend(browser);
  }

  setActiveSettingsSection(settingsPage, settingsPage.dataset.activeSection);
  showSettingFromHash(settingsPage);
};

/**
 * Reveal the settings once the layout has been built, so the sections don't flash unstyled.
 */
const markSettingsReady = () => {
  const settingsPages = document.querySelectorAll('.mousehuntHud-page-tabContent.mousehunt-improved-settings');
  settingsPages.forEach((settingsPage) => settingsPage.classList.add('mhui-settings-ready'));
};

/**
 * Add the header with the title, version, and search field.
 */
const addHeaderToSettings = () => {
  const settingsPage = document.querySelector('.mousehuntHud-page-tabContent.game_settings.mousehunt-improved-settings.active');
  if (! settingsPage) {
    return;
  }

  const existingHeader = document.querySelector('.mhui-settings-header');
  if (existingHeader) {
    return;
  }

  const header = makeElement('div', 'mhui-settings-header');
  const title = makeElement('div', 'mhui-settings-header-title', `MouseHunt Improved <a title="View release notes" href="https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${mhImprovedVersion}" target="_blank" rel="noopener noreferrer">v${mhImprovedVersion}</a>`);
  header.append(title);

  const searchWrapper = makeElement('div', 'mhui-settings-header-wrapper');

  const searchField = makeElement('input', 'mhui-settings-header-search');
  searchField.type = 'text';
  searchField.placeholder = 'Search settings, modules, descriptions…';
  searchField.autocomplete = 'off';
  searchField.autofocus = true;
  searchField.addEventListener('input', (e) => {
    applySettingsSearch(settingsPage, e.target.value);
  });
  searchWrapper.append(searchField);

  header.append(searchWrapper);

  settingsPage.prepend(header);
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
  addStyles(styles, 'mousehunt-improved-settings');

  addMhImprovedIconToMenu();

  moveTabToEnd();
  addHeaderToSettings();

  onEvent('mh-improved-setting-added-to-page', (module) => {
    // this is the last setting added, so we can run our final setup.
    if (module?.key === 'error-reporting') {
      createSettingsBrowser();
      highlightLocationHud();
      addAdvancedSettingsButtons();
      markSettingsReady();
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
};
