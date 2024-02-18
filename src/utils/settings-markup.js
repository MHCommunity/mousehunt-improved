import { getCurrentPage, getCurrentTab } from './page';
import { getSetting, getSettingDirect, saveSettingDirect } from './settings';
import { addStylesDirect } from './styles';
import { doEvent } from './event-registry';
import { makeElement } from './elements';
import { onPageChange } from './events';

import settingsStyles from './styles/settings.css';

let hasAddedSettingsStyles = false;
/**
 * Add the settings styles.
 */
const addSettingStyles = () => {
  if (hasAddedSettingsStyles) {
    return;
  }

  hasAddedSettingsStyles = true;
  addStylesDirect(settingsStyles, 'mh-improved-styles-settings');
};

/**
 * Save a setting and toggle the class in the settings UI.
 *
 * @param {Node}    node       The setting node to animate.
 * @param {string}  key        The setting key.
 * @param {boolean} value      The setting value.
 * @param {string}  identifier The identifier for the settings.
 */
const saveSettingDirectAndToggleClass = (node, key, value, identifier = 'mh-utils-settings') => {
  node.parentNode.parentNode.classList.add('busy');

  // Save the setting.
  saveSettingDirect(key, value, identifier);

  doEvent('mh-improved-settings-changed', {
    key,
    value,
    tab: identifier,
    type: 'toggle',
  });

  doEvent(`mh-improved-settings-changed-${key}`, value);

  // Add the completed class & remove it in a second.
  node.parentNode.parentNode.classList.remove('busy');
  node.parentNode.parentNode.classList.add('completed');
  setTimeout(() => {
    node.parentNode.parentNode.classList.remove('completed');
  }, 1000);

  // TODO: remove this or hook it to the event.
  addSettingRefreshReminder();
};

/**
 * Make the settings tab.
 *
 * @param {string} identifier The identifier for the settings.
 * @param {string} name       The name of the settings tab.
 *
 * @return {string} The identifier.
 */
const addSettingsTab = (identifier = 'userscript-settings', name = 'Userscript Settings') => {
  addSettingStyles();
  addSettingsTabOnce(identifier, name);
  onPageChange({ preferences: { show: () => addSettingsTabOnce(identifier, name) } });

  return identifier;
};

/**
 * Make the settings tab once.
 *
 * @ignore
 *
 * @param {string} identifier The identifier for the settings.
 * @param {string} name       The name of the settings tab.
 */
const addSettingsTabOnce = (identifier = 'userscript-settings', name = 'Userscript Settings') => {
  if ('preferences' !== getCurrentPage()) {
    return;
  }

  const existingSettings = document.querySelector(`#${identifier}`);
  if (existingSettings) {
    return;
  }

  const tabsContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
  if (! tabsContainer) {
    return;
  }

  const tabsContentContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
  if (! tabsContentContainer) {
    return;
  }

  // make sure the identifier is unique and safe to use as a class.
  identifier = identifier.replaceAll(/[^\w-]/gi, '');

  const settingsTab = document.createElement('a');
  settingsTab.id = identifier;
  settingsTab.href = '#';
  settingsTab.classList.add('mousehuntHud-page-tabHeader', identifier);
  settingsTab.setAttribute('data-tab', identifier);
  settingsTab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

  const settingsTabText = document.createElement('span');
  settingsTabText.innerText = name;

  settingsTab.append(settingsTabText);
  tabsContainer.append(settingsTab);

  const settingsTabContent = document.createElement('div');
  settingsTabContent.classList.add('mousehuntHud-page-tabContent', 'game_settings', identifier);
  settingsTabContent.setAttribute('data-tab', identifier);

  tabsContentContainer.append(settingsTabContent);

  if (identifier === getCurrentTab()) {
    const tab = document.querySelector(`#${identifier}`);
    if (tab) {
      tab.click();
    }
  }
};

/**
 * Add a setting to the preferences page, both on page load and when the page changes.
 *
 * @param {string}  name         The setting name.
 * @param {string}  key          The setting key.
 * @param {boolean} defaultValue The default value.
 * @param {string}  description  The setting description.
 * @param {Object}  section      The section settings.
 * @param {string}  tab          The tab to add the settings to.
 * @param {Object}  settings     The settings for the settings.
 *
 * @return {Object} The setting.
 */
const addSetting = (name, key, defaultValue = true, description = '', section = {}, tab = 'userscript-settings', settings = null) => {
  onPageChange({ preferences: { show: () => addSettingOnce(name, key, defaultValue, description, section, tab, settings) } });
  return addSettingOnce(name, key, defaultValue, description, section, tab, settings);
};

/**
 * Make a toggle for the setting.
 *
 * @param {string}  toggleKey          The toggle key.
 * @param {boolean} toggleDefaultValue The toggle default value.
 * @param {string}  toggleTab          The toggle tab.
 * @param {boolean} settingRow         Whether or not the setting is a row.
 *
 * @return {Object} The toggle.
 */
const makeToggle = (toggleKey, toggleDefaultValue, toggleTab, settingRow = false) => {
  const settingRowInputCheckbox = makeElement('div', 'mousehuntSettingSlider');

  // Depending on the current state of the setting, add the active class.
  const currentSetting = getSettingDirect(toggleKey, null, toggleTab);
  if (currentSetting) {
    settingRowInputCheckbox.classList.add('active');

    if (settingRow) {
      settingRow.classList.add('active');
    }
  } else if (null === currentSetting && toggleDefaultValue) {
    settingRowInputCheckbox.classList.add('active');

    if (settingRow) {
      settingRow.classList.add('active');
    }
  }

  /**
   * Event listener for when the setting is clicked.
   *
   * @param {Event} event The event.
   */
  settingRowInputCheckbox.onclick = (event) => {
    const isSettingActive = event.target.classList.contains('active');
    event.target.classList.toggle('active');

    if (settingRow) {
      settingRow.classList.toggle('active');
    }

    saveSettingDirectAndToggleClass(event.target, toggleKey, ! isSettingActive, toggleTab);
  };

  // Add the input to the settings row.
  return settingRowInputCheckbox;
};

/**
 * Add a setting to the preferences page.
 *
 * @ignore
 *
 * @param {string}  name            The setting name.
 * @param {string}  key             The setting key.
 * @param {boolean} defaultValue    The default value.
 * @param {string}  description     The setting description.
 * @param {Object}  section         The section settings.
 * @param {string}  tab             The tab to add the settings to.
 * @param {Object}  settingSettings The settings for the settings.
 *
 * @return {Object} The setting.
 */
const addSettingOnce = (name, key, defaultValue = true, description = '', section = {}, tab = 'userscript-settings', settingSettings = null) => {
  addSettingStyles();

  // Make sure we have the container for our settings.
  const container = document.querySelector(`.mousehuntHud-page-tabContent.${tab}`);
  if (! container) {
    return false;
  }

  section = {
    id: section.id || 'settings',
    name: section.name || 'Userscript Settings',
    description: section.description || '',
    subSetting: section.subSetting || false,
  };

  let tabId = 'mh-utils-settings';
  if (tab !== 'userscript-settings') {
    tabId = tab;
  }

  section.id = `${tabId}-${section.id.replaceAll(/[^\w-]/gi, '')}`;

  // If we don't have our custom settings section, then create it.
  let sectionExists = document.querySelector(`#${section.id}`);
  if (! sectionExists) {
    const title = makeElement('div', 'PagePreferences__title');
    title.id = section.id;

    makeElement('h3', 'PagePreferences__titleText', section.name, title);
    makeElement('div', 'PagePreferences__separator', '', title);

    // Append it.
    container.append(title);

    sectionExists = document.querySelector(`#${section.id}`);

    if (section.description) {
      const settingSubHeader = makeElement('h4', ['settings-subheader', 'mh-utils-settings-subheader'], section.description);
      seperator.before(settingSubHeader);
    }
  }

  // If we already have a setting visible for our key, bail.
  const settingExists = document.querySelector(`#${section.id}-${key}`);
  if (settingExists) {
    return settingExists;
  }

  // Create the markup for the setting row.
  const settings = makeElement('div', ['PagePreferences__settingsList', `PagePreferences__settingsList-${key}`, `PagePreferences__settingsList-${section.id}`]);
  settings.id = `${section.id}-${key}`;
  if (section.subSetting) {
    settings.classList.add('PagePreferences__subSetting');
  }

  if (settingSettings && settingSettings.type) {
    settings.classList.add(`PagePreferences__settingsList-${settingSettings.type}`);
  }

  const settingRow = makeElement('div', 'PagePreferences__setting');

  const settingRowLabel = makeElement('div', 'PagePreferences__settingLabel');
  const settingName = makeElement('div', 'PagePreferences__settingName');

  const settingNameText = makeElement('a', 'PagePreferences__settingNameText', name);
  settingNameText.href = `#${section.id}-${key}`;
  settingNameText.setAttribute('data-setting', key);
  settingNameText.setAttribute('data-tab', tab);
  settingNameText.setAttribute('data-default', defaultValue);
  settingName.append(settingNameText);

  const defaultSettingText = makeElement('div', 'PagePreferences__settingDefault');

  if (settingSettings && (settingSettings.type === 'select' || settingSettings.type === 'multi-select')) {
    defaultSettingText.textContent = defaultValue.map((item) => item.name).join(', ');
  } else {
    defaultSettingText.textContent = defaultValue ? 'Enabled' : 'Disabled';
  }

  defaultSettingText.textContent = `Default setting: ${defaultSettingText.textContent}`;

  const settingDescription = makeElement('div', 'PagePreferences__settingDescription');
  settingDescription.innerHTML = description;
  if (description.trim() === '') {
    settingDescription.classList.add('empty-description');
  }

  settingRowLabel.append(settingName);
  settingRowLabel.append(defaultSettingText);
  settingRowLabel.append(settingDescription);

  const settingRowAction = makeElement('div', 'PagePreferences__settingAction');
  const settingRowInput = makeElement('div', 'settingRow-action-inputContainer');

  if (settingSettings && (settingSettings.type === 'select' || settingSettings.type === 'multi-select')) {
    // Create the dropdown.
    const settingRowInputDropdown = document.createElement('div');
    settingRowInputDropdown.classList.add('inputBoxContainer');

    if (settingSettings.type === 'multi-select') {
      settingRowInputDropdown.classList.add('multiSelect');
      settingRowInput.classList.add('multiSelect', 'select');
    }

    let amount = 1;
    if (settingSettings.type === 'multi-select' && settingSettings.number) {
      amount = settingSettings.number;
    }

    /**
     * Make an option for the dropdown.
     *
     * @param {Object}  option         The option to make.
     * @param {boolean} foundSelected  Whether or not the option is selected.
     * @param {string}  currentSetting The current setting.
     * @param {Object}  dValue         The default value.
     * @param {number}  i              The index of the option.
     *
     * @return {Object} The option and whether or not it's selected.
     */
    const makeOption = (option, foundSelected, currentSetting, dValue, i) => {
      const settingRowInputDropdownSelectOption = document.createElement('option');
      settingRowInputDropdownSelectOption.value = option.value;
      settingRowInputDropdownSelectOption.textContent = option.name;
      settingRowInputDropdownSelectOption.disabled = option.disabled || false;

      if (currentSetting && currentSetting === option.value) {
        settingRowInputDropdownSelectOption.selected = true;
        foundSelected = true;
      } else if (! foundSelected && dValue && dValue[i] && dValue[i].value === option.value) {
        settingRowInputDropdownSelectOption.selected = true;
        foundSelected = true;
      }

      return {
        settingRowInputDropdownSelectOption,
        foundSelected
      };
    };

    // make a multi-select dropdown.
    for (let i = 0; i < amount; i++) {
      const settingRowInputDropdownSelect = document.createElement('select');
      settingRowInputDropdownSelect.classList.add('inputBox');

      if (settingSettings.type === 'multi-select') {
        settingRowInputDropdownSelect.classList.add('multiSelect');
      }

      const currentSetting = getSettingDirect(`${key}-${i}`, null, tab);
      let foundSelected = false;

      settingSettings.options.forEach((option) => {
        // If the value is 'optgroup', then we want to make an optgroup and use the options inside of it.
        if (option.value === 'group') {
          const settingRowInputDropdownSelectOptgroup = document.createElement('optgroup');
          settingRowInputDropdownSelectOptgroup.label = option.name;

          option.options.forEach((optgroupOption) => {
            const result = makeOption(optgroupOption, foundSelected, currentSetting, defaultValue, i);
            foundSelected = result.foundSelected;
            settingRowInputDropdownSelectOptgroup.append(result.settingRowInputDropdownSelectOption);
          });

          settingRowInputDropdownSelect.append(settingRowInputDropdownSelectOptgroup);
        } else {
          const result = makeOption(option, foundSelected, currentSetting, defaultValue, i);
          foundSelected = result.foundSelected;
          settingRowInputDropdownSelect.append(result.settingRowInputDropdownSelectOption);
        }
      });

      settingRowInputDropdown.append(settingRowInputDropdownSelect);

      /**
       * Event listener for when the setting is clicked.
       *
       * @param {Event} event The event.
       */
      let timeout = null;
      settingRowInputDropdownSelect.onchange = (event) => {
        const parent = settingRowInputDropdownSelect.parentNode.parentNode.parentNode;
        parent.classList.add('inputDropdownWrapper');
        parent.classList.add('busy');

        // save the setting.
        saveSettingDirect(`${key}-${i}`, event.target.value, tab);

        doEvent('mh-improved-settings-changed', {
          key: `${key}-${i}`,
          value: event.target.value,
          tab,
          type: 'multi-select',
        });

        parent.classList.remove('busy');
        parent.classList.add('completed');

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          parent.classList.remove('completed');
        }, 1000);
      };

      settingRowInput.append(settingRowInputDropdown);
      settingRowAction.append(settingRowInput);
    }
  } else if (settingSettings && settingSettings.type === 'input') {
    settingRow.classList.add('inputText');
    const settingRowInputText = makeElement('input', 'inputBox');
    settingRowInputText.value = getSettingDirect(key, defaultValue, tab);

    const inputSaveButton = makeElement('button', ['mousehuntActionButton', 'tiny', 'inputSaveButton']);
    makeElement('span', '', 'Save', inputSaveButton);

    let timeout = null;
    const save = (event) => {
      const parent = event.target.parentNode.parentNode.parentNode;
      parent.classList.add('inputDropdownWrapper');
      parent.classList.add('inputTextWrapper');
      parent.classList.add('busy');

      parent.classList.remove('completed');

      // save the setting.
      saveSettingDirect(key, settingRowInputText.value, tab);

      doEvent('mh-improved-settings-changed', {
        key,
        value: settingRowInputText.value,
        tab,
        type: 'input',
      });

      parent.classList.remove('busy');
      parent.classList.add('completed');

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        parent.classList.remove('completed');
      }, 1000);

      addSettingRefreshReminder();
    };

    // Event listener for when the setting is clicked.
    inputSaveButton.addEventListener('click', save);
    settingRowInputText.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        save(event);
      }
    });

    settingRowInput.classList.add('inputText');

    settingRowInput.append(settingRowInputText);
    settingRowInput.append(inputSaveButton);
    settingRowAction.append(settingRowInput);
  } else if (settingSettings && settingSettings.type === 'textarea') {
    settingRow.classList.add('textarea');

    const settingRowInputText = makeElement('textarea', 'inputBox');
    settingRowInputText.value = getSettingDirect(key, defaultValue, tab);

    const inputSaveButton = makeElement('button', ['mousehuntActionButton', 'tiny', 'inputSaveButton']);
    makeElement('span', '', 'Save', inputSaveButton);

    // Event listener for when the setting is clicked.
    let timeout = null;
    const save = (event) => {
      const parent = event.target.parentNode.parentNode.parentNode;
      parent.classList.add('inputDropdownWrapper');
      parent.classList.add('textareaWrapper');

      parent.classList.add('busy');

      // save the setting.
      saveSettingDirect(key, settingRowInputText.value, tab);

      doEvent('mh-improved-settings-changed', {
        key,
        value: settingRowInputText.value,
        tab,
        type: 'textarea',
      });

      parent.classList.remove('busy');
      parent.classList.add('completed');

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        parent.classList.remove('completed');
      }, 1000);

      addSettingRefreshReminder();
    };

    inputSaveButton.addEventListener('click', save);
    settingRowInputText.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        save(event);
      }
    });

    settingRowInput.classList.add('textarea');

    settingRowInput.append(settingRowInputText);
    settingRowInput.append(inputSaveButton);
    settingRowAction.append(settingRowInput);
  } else if (settingSettings && settingSettings.type === 'multi-toggle') {
    settingRowAction.classList.add('multi-toggle');

    const multiToggleRow = makeElement('div', ['PagePreferences__settingsList', 'multi-toggle-row']);

    settingSettings.options.forEach((option) => {
      const optionSettingRow = makeElement('div', 'PagePreferences__settingsList');

      // Label.
      const optionSettingRowLabel = makeElement('div', 'PagePreferences__settingLabel');
      makeElement('div', 'PagePreferences__settingName', option.name, optionSettingRowLabel);
      optionSettingRow.append(optionSettingRowLabel);

      // Action.
      const optionSettingRowAction = makeElement('div', 'PagePreferences__settingAction');
      const optionSettingRowInput = makeElement('div', 'settingRow-action-inputContainer');

      const settingRowInputCheckbox = makeToggle(`${key}-${option.id}`, option.value, tab);
      optionSettingRowInput.append(settingRowInputCheckbox);
      optionSettingRowAction.append(optionSettingRowInput);

      optionSettingRow.append(optionSettingRowAction);

      multiToggleRow.append(optionSettingRow);
    });

    settingRowAction.append(multiToggleRow);
  } else if (settingSettings && settingSettings.type === 'blank') {
    const action = makeElement('div', ['blank', 'blankSetting'], '');
    action.id = `${section.id}-${key}-blank`;
    settingRowAction.append(action);
  } else {
    const settingRowInputCheckbox = makeToggle(key, defaultValue, tab, settings);
    settingRowInput.append(settingRowInputCheckbox);
    settingRowAction.append(settingRowInput);
  }

  // Add the label and action to the settings row.
  settingRow.append(settingRowLabel);
  settingRow.append(settingRowAction);

  // Add the settings row to the settings container.
  settings.append(settingRow);
  sectionExists.append(settings);

  doEvent('mh-improved-setting-added-to-page', {
    name,
    key,
    defaultValue,
    description,
    section,
    tab,
    settings,
  });

  return settings;
};

let fadeInTimeout = null;
let fadeOutTimeout = null;
let removeTimeout = null;

/**
 * Add a refresh reminder to the settings page.
 */
const addSettingRefreshReminder = () => {
  addSettingStyles();

  let refreshMessage = document.querySelector('#mh-utils-settings-refresh-message');
  if (! refreshMessage) {
    const newMessageEl = makeElement('div', ['mh-utils-settings-refresh-message', 'mh-ui-fade'], 'You may need to refresh the page for some settings to take effect.');
    newMessageEl.id = 'mh-utils-settings-refresh-message';

    const body = document.querySelector('body');
    body.append(newMessageEl);

    refreshMessage = document.querySelector('#mh-utils-settings-refresh-message');
  }

  clearTimeout(fadeInTimeout);
  clearTimeout(fadeOutTimeout);
  clearTimeout(removeTimeout);

  fadeInTimeout = setTimeout(() => {
    refreshMessage.classList.add('mh-ui-fade-in');
  }, 250);

  fadeOutTimeout = setTimeout(() => {
    refreshMessage.classList.remove('mh-ui-fade-in');
    refreshMessage.classList.add('mh-ui-fade-out');
  }, 3000);

  removeTimeout = setTimeout(() => {
    refreshMessage.remove();
  }, 5000);
};

/**
 * Add the settings for a module.
 *
 * @param {Object} module The module to add settings for.
 */
const addSettingForModule = async (module) => {
  for (const submodule of module.modules) {
    let moduleSettingRow = null;
    if (! submodule.alwaysLoad && ! submodule.beta) {
      moduleSettingRow = await addSetting(
        submodule.name,
        submodule.id,
        submodule.default,
        submodule.description,
        {
          id: module.id,
          name: module.name,
          description: module.description,
        },
        'mousehunt-improved-settings'
      );
    }

    if (
      ! submodule.beta &&
      submodule.settings && (
        submodule.alwaysLoad ||
        getSetting(submodule.id, submodule.default)
      )
    ) {
      const subSettingsGroup = await submodule.settings(module);
      if (! subSettingsGroup) {
        continue;
      }

      for (const subSettings of subSettingsGroup) {
        const subSettingRow = await addSetting(
          subSettings.title,
          subSettings.id,
          subSettings.default,
          subSettings.description,
          {
            ...module,
            subSetting: true,
          },
          'mousehunt-improved-settings',
          subSettings.settings
        );

        if (moduleSettingRow && subSettingRow) {
          moduleSettingRow.append(subSettingRow);
        }
      }
    }
  }
};

export {
  addSettingForModule,
  addSetting,
  addSettingsTab
};
