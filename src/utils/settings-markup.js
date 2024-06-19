import { doEvent, onEvent } from './event-registry';
import { getCurrentPage, getCurrentTab } from './page';
import { getSetting, getSettingDirect, saveSettingDirect } from './settings';
import { makeElement } from './elements';
import { onNavigation } from './events';
import { showSuccessMessage } from './messages';

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
  addSettingsTabOnce(identifier, name);
  onNavigation(() => addSettingsTabOnce(identifier, name), {
    page: 'preferences',
  });

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
 * @see addSettingOnce
 *
 * @param {Object}  options             The options for the setting.
 * @param {string}  options.name        The name of the setting.
 * @param {string}  options.id          The setting id.
 * @param {boolean} options.default     The default value.
 * @param {string}  options.description The description of the setting.
 * @param {Object}  options.module      The module the setting is for.
 * @param {Object}  options.subSettings The sub-settings for the setting.
 * @param {string}  options.group       The group the setting is in.
 * @param {string}  options.tab         The tab to add the settings to.
 * @param {Object}  options.settings    The settings for the setting.
 *
 * @return {Object} The setting.
 */
const addSetting = (options) => {
  onNavigation(() => addSettingOnce(options), {
    page: 'preferences',
  });
  return addSettingOnce(options);
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
 * Helper function to make a toggle on the settings page.
 *
 * @param {Object} options              The options for the toggle.
 * @param {string} options.key          The setting key.
 * @param {string} options.tab          The tab to add the settings to.
 * @param {string} options.defaultValue The default value.
 * @param {Object} options.settings     The settings for the settings.
 *
 * @return {Object} The toggle.
 */
const makeSettingToggle = ({ key, defaultValue, tab, settings }) => {
  const settingRowInput = makeElement('div', 'settingRow-action-inputContainer');

  const settingRowInputCheckbox = makeToggle(key, defaultValue, tab, settings);

  settingRowInput.append(settingRowInputCheckbox);

  return settingRowInput;
};

/**
 * Helper function to make a select on the settings page.
 *
 * @param {Object} options                 The options for the select.
 * @param {string} options.key             The setting key.
 * @param {string} options.tab             The tab to add the settings to.
 * @param {string} options.defaultValue    The default value.
 * @param {Object} options.settingSettings The settings for the settings.
 *
 * @return {Object} The select.
 */
const makeSettingRowSelect = ({ key, tab, defaultValue, settingSettings }) => {
  const settingRowInputWrapper = makeElement('div', 'settingRow-action-inputContainer');

  const settingRowInput = makeElement('div', 'settingRow-action-inputContainer');

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
    if (option.seperator) {
      return {
        settingRowInputDropdownSelectOption: makeElement('hr'),
        foundSelected,
      };
    }

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

    const currentSetting = getSetting(`${key}-${i}`, null, tab);
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

    let timeout = null;

    /**
     * Event listener for when the setting is clicked.
     *
     * @param {Event} event The event.
     */
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

    settingRowInputWrapper.append(settingRowInput);
  }

  return settingRowInputWrapper;
};

/**
 * Helper function to make an input on the settings page.
 *
 * @param {Object} options              The options for the input.
 * @param {string} options.key          The setting key.
 * @param {string} options.tab          The tab to add the settings to.
 * @param {string} options.defaultValue The default value.
 *
 * @return {Object} The input.
 */
const makeSettingInput = ({ key, tab, defaultValue }) => {
  const settingRowInput = makeElement('div', ['settingRow-action-inputContainer', 'inputText']);

  const settingRowInputText = makeElement('input', 'inputBox');
  settingRowInputText.value = getSettingDirect(key, defaultValue, tab);

  const inputSaveButton = makeElement('button', ['mousehuntActionButton', 'tiny', 'inputSaveButton']);
  makeElement('span', '', 'Save', inputSaveButton);

  let timeout = null;
  inputSaveButton.addEventListener('click', (event) => {
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
  });

  settingRowInput.classList.add('inputText');

  settingRowInput.append(settingRowInputText);
  settingRowInput.append(inputSaveButton);

  return settingRowInput;
};

/**
 * Helper function to make a textarea on the settings page.
 *
 * @param {Object} options              The options for the textarea.
 * @param {string} options.key          The setting key.
 * @param {string} options.tab          The tab to add the settings to.
 * @param {string} options.defaultValue The default value.
 *
 * @return {Object} The textarea.
 */
const makeSettingTextArea = ({ key, tab, defaultValue }) => {
  const settingRowInput = makeElement('div', ['settingRow-action-inputContainer', 'textarea']);

  const settingRowInputText = makeElement('textarea', 'inputBox');
  settingRowInputText.value = getSetting(key, defaultValue);

  const inputSaveButton = makeElement('button', ['mousehuntActionButton', 'tiny', 'inputSaveButton']);
  makeElement('span', '', 'Save', inputSaveButton);

  // Event listener for when the setting is clicked.
  let timeout = null;
  inputSaveButton.addEventListener('click', (event) => {
    const parent = event.target.parentNode.parentNode.parentNode;
    parent.classList.add('inputDropdownWrapper');
    parent.classList.add('inputTextWrapper');
    parent.classList.remove('completed');
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

    addSettingRefreshReminder(key);
  });

  settingRowInput.append(settingRowInputText);
  settingRowInput.append(inputSaveButton);

  return settingRowInput;
};

/**
 * Helper function to make a multi-toggle on the settings page.
 *
 * @param {Object} options                 The options for the multi-toggle.
 * @param {string} options.key             The setting key.
 * @param {string} options.tab             The tab to add the settings to.
 * @param {Object} options.settingSettings The setting's settings.
 *
 * @return {Object} The multi-toggle.
 */
const makeSettingMultiToggle = ({ key, tab, settingSettings }) => {
  const multiToggleWrapper = makeElement('div', 'multi-toggle');

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

  multiToggleWrapper.append(multiToggleRow);

  return multiToggleWrapper;
};

/**
 * Helper function to make a blank setting on the settings page.
 *
 * @param {Object} options         The options for the blank setting.
 * @param {Object} options.section The section settings.
 * @param {string} options.key     The setting key.
 *
 * @return {Object} The blank setting.
 */
const makeSettingBlank = ({ section, key }) => {
  const action = makeElement('div', ['blank', 'blankSetting'], '');
  action.id = `${section.id}-${key}-blank`;

  return action;
};

/**
 * Add a setting to the preferences page.
 *
 * @ignore
 *
 * @param {Object}  options             The options for the setting.
 * @param {string}  options.name        The name of the setting.
 * @param {string}  options.id          The setting id.
 * @param {boolean} options.default     The default value.
 * @param {string}  options.description The description of the setting.
 * @param {Object}  options.module      The module the setting is for.
 * @param {Object}  options.subSettings The sub-settings for the setting.
 * @param {string}  options.group       The group the setting is in.
 * @param {string}  options.tab         The tab to add the settings to.
 * @param {Object}  options.settings    The settings for the setting.
 *
 * @return {Object} The setting.
 */
const addSettingOnce = (options) => {
  const name = options.name;
  const key = options.id;
  const defaultValue = options.default || null;
  const description = options.description || '';
  const tab = 'mousehunt-improved-settings';
  const settingSettings = options.subSettings || null;
  const moduleType = options.moduleType || null;

  // Make sure we have the container for our settings.
  let container = document.querySelector(`.mousehuntHud-page-tabContent.${tab}`);
  const originalContainer = container;
  if (! container) {
    return false;
  }

  const section = {
    id: options.module.id,
    name: options.module.name || '',
    description: options.module.description || '',
    subSetting: options.module.subSetting || false,
  };

  let leftSide = container.querySelector('.PagePreferences__settingsLeft');
  if (! leftSide) {
    leftSide = makeElement('div', 'PagePreferences__settingsLeft');
    container.append(leftSide);
    container.classList.add('two-column');
  }

  let rightSide = container.querySelector('.PagePreferences__settingsRight');
  if (! rightSide) {
    rightSide = makeElement('div', 'PagePreferences__settingsRight');
    container.append(rightSide);
    container.classList.add('two-column');
  }

  if (moduleType && getSetting('experiments.new-settings-styles-columns', false)) {
    switch (moduleType) {
    case 'better':
    case 'design':
    case 'element-hiding':
    case 'advanced':
      container = leftSide;
      break;
    case 'feature':
    case 'location-hud':
    case 'beta':
      container = rightSide;
      break;
    default:
      container = originalContainer;
      break;
    }
  }

  section.id = `${tab}-${section.id.replaceAll(/[^\w-]/gi, '')}`;

  // If we don't have our custom settings section, then create it.
  let sectionExists = document.querySelector(`#${section.id}-wrapper`);
  if (! sectionExists) {
    const title = makeElement('div', 'PagePreferences__section');
    title.id = section.id;

    const titleSection = makeElement('div', 'PagePreferences__title');
    makeElement('h3', 'PagePreferences__titleText', section.name, titleSection);
    // makeElement('div', 'PagePreferences__separator', '', titleSection);

    // Append it.
    title.append(titleSection);
    container.append(title);

    if (section.description) {
      const settingSubHeader = makeElement('h4', ['settings-subheader', 'mh-utils-settings-subheader'], section.description);
      title.after(settingSubHeader);
    }

    // append a wrapper for the settings.
    const sectionWrapper = makeElement('div', 'PagePreferences__sectionWrapper');
    sectionWrapper.id = `${section.id}-wrapper`;
    container.append(sectionWrapper);

    title.append(sectionWrapper);

    sectionExists = document.querySelector(`#${section.id}-wrapper`);
  }

  const keySafe = key.replaceAll('.', '-');

  // If we already have a setting visible for our key, bail.
  const settingExists = document.querySelector(`#${section.id}-${keySafe}`);
  if (settingExists) {
    return settingExists;
  }

  // Create the markup for the setting row.
  const settings = makeElement('div', ['PagePreferences__settingsList']);
  settings.id = `${section.id}-${keySafe}`;

  if (section.subSetting) {
    settings.classList.add('PagePreferences__subSetting');
  } else {
    settings.classList.add(`PagePreferences__settingsList-${keySafe}`, `PagePreferences__settingsList-${section.id}`);
  }

  if (settingSettings && settingSettings.type) {
    settings.classList.add(`PagePreferences__settingsList-${settingSettings.type}`);
  }

  const settingRow = makeElement('div', 'PagePreferences__setting');

  const settingRowLabel = makeElement('div', 'PagePreferences__settingLabel');
  const settingName = makeElement('div', 'PagePreferences__settingName');

  const settingNameText = makeElement('a', 'PagePreferences__settingNameText', name);
  settingNameText.href = `#${section.id}-${keySafe}`;
  settingNameText.setAttribute('data-setting', key);
  settingNameText.setAttribute('data-tab', tab);
  settingNameText.setAttribute('data-default', JSON.stringify(defaultValue));
  settingName.append(settingNameText);

  if (! section.subSetting) {
    settingNameText.addEventListener('click', (event) => {
      event.preventDefault();
      navigator.clipboard.writeText(`${window.location.href}#${section.id}-${keySafe}`);

      showSuccessMessage({
        message: 'Copied link to clipboard',
        append: settingNameText,
        after: true,
        classname: 'setting-link-copied',
      });
    });
  }

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

  if (settingSettings) {
    if (settingSettings.type === 'select' || settingSettings.type === 'multi-select') {
      settingRowAction.append(makeSettingRowSelect({ key, tab, defaultValue, settingSettings }));
    } else if (settingSettings.type === 'input') {
      settingRowAction.append(makeSettingInput({ key, tab, defaultValue }));
    } else if (settingSettings.type === 'textarea') {
      settingRowAction.append(makeSettingTextArea({ key, tab, defaultValue }));
    } else if (settingSettings.type === 'multi-toggle') {
      settingRowAction.append(makeSettingMultiToggle({ key, tab, settingSettings }));
    } else if (settingSettings.type === 'blank') {
      settingRowAction.append(makeSettingBlank({ section, key }));
    } else {
      settingRowAction.append(makeSettingToggle({ key, defaultValue, tab, settings }));
    }
  } else {
    settingRowAction.append(makeSettingToggle({ key, defaultValue, tab, settings }));
  }

  settingRow.append(settingRowLabel);
  settingRow.append(settingRowAction);

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
  let refreshMessage = document.querySelector('#mh-utils-settings-refresh-message');
  if (! refreshMessage) {
    const newMessageEl = makeElement('div', ['mh-utils-settings-refresh-message', 'mh-ui-fade'], 'Refresh the page to apply your changes.');
    newMessageEl.id = 'mh-utils-settings-refresh-message';

    newMessageEl.addEventListener('click', () => {
      window.location.reload();
    });

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

onEvent('mh-improved-settings-changed', addSettingRefreshReminder);

/**
 * Add the settings for a module.
 *
 * @param {Object} module The module to add settings for.
 */
const addSettingForModule = async (module) => {
  for (const submodule of module.modules) {
    let moduleSettingRow = null;
    if (! submodule.alwaysLoad && ! submodule.beta) {
      moduleSettingRow = await addSetting({
        moduleType: module.id,
        name: submodule.name,
        id: submodule.id,
        group: submodule.group,
        default: submodule.default,
        description: submodule.description,
        module,
      });
    }

    if (submodule.settings) {
      const subSettingsGroup = await submodule.settings(module);
      if (! subSettingsGroup) {
        continue;
      }

      for (const subSettings of subSettingsGroup) {
        const subSettingRow = await addSetting({
          moduleType: module.id,
          name: subSettings.title,
          id: subSettings.id,
          group: submodule.group || false,
          default: subSettings.default,
          description: subSettings.description,
          module: {
            ...module,
            subSetting: true,
          },
          subSettings: subSettings.settings,
        });

        if (moduleSettingRow && subSettingRow) {
          moduleSettingRow.append(subSettingRow);
        }
      }
    }

    doEvent('mh-improved-settings-added', { module });
  }
};

export {
  addSettingForModule,
  addSetting,
  addSettingsTab
};
