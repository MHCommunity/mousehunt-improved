import { makeElement, makeMhButton } from './elements';
import { doEvent, onEvent } from './event-registry';
import { getMultiSelectCount, getSetting, getSettingDirect, saveSettingDirect } from './settings';
import { getCurrentPage } from './page-current';
import { getCurrentTab } from './page';
import { getFlag } from './flags';
import { isLiveSetting, markSettingLive } from './live-toggle';
import { makeItemPicker } from './settings-item-picker';
import { onNavigation } from './events';

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
  setTimeout(() => node.parentNode.parentNode.classList.remove('completed'), 1000);
};

/**
 * Make the settings tab.
 *
 * @param {string} identifier The identifier for the settings.
 * @param {string} name       The name of the settings tab.
 *
 * @return {string} The identifier.
 */
const addSettingsTab = (identifier = 'mousehunt-improved-settings', name = 'MH Improved') => {
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
const addSettingsTabOnce = (identifier = 'mousehunt-improved-settings', name = 'MH Improved') => {
  if ('preferences' !== getCurrentPage()) {
    return;
  }

  const existingSettings = document.querySelector(`#${identifier}`);
  if (existingSettings) {
    return;
  }

  const tabsContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
  if (!tabsContainer) {
    return;
  }

  const tabsContentContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
  if (!tabsContentContainer) {
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

    saveSettingDirectAndToggleClass(event.target, toggleKey, !isSettingActive, toggleTab);
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

  const isExpandable = settingSettings.type === 'multi-select' && settingSettings.expandable;

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
  // eslint-disable-next-line unicorn/consistent-function-scoping
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
    } else if (!foundSelected && dValue && dValue[i] && dValue[i].value === option.value) {
      settingRowInputDropdownSelectOption.selected = true;
      foundSelected = true;
    }

    return {
      settingRowInputDropdownSelectOption,
      foundSelected,
    };
  };

  const timeouts = {};

  /**
   * Flash the saved state on the setting row.
   *
   * @param {number} i The index of the dropdown.
   */
  const flashSaved = (i) => {
    settingRowInputWrapper.classList.add('inputDropdownWrapper', 'completed');

    clearTimeout(timeouts[i]);
    timeouts[i] = setTimeout(() => settingRowInputWrapper.classList.remove('completed'), 1000);
  };

  /**
   * Save the value for one of the dropdowns and flash the saved state.
   *
   * @param {HTMLElement} input The control that changed.
   * @param {number}      i     The index of the dropdown.
   * @param {string}      value The new value.
   */
  const saveSelectValue = (input, i, value) => {
    saveSettingDirect(`${key}-${i}`, value, tab);

    doEvent('mh-improved-settings-changed', {
      key: `${key}-${i}`,
      value,
      tab,
      type: 'multi-select',
    });

    flashSaved(i);
  };

  /**
   * Make the dropdown for one slot.
   *
   * @param {number}   i          The index of the dropdown.
   * @param {Object}   [slot]     Overrides for an expandable slot.
   * @param {string}   slot.value The value to show.
   * @param {Function} slot.save  Called with the new value instead of saving it by index.
   *
   * @return {HTMLElement} The dropdown.
   */
  const makeSlot = (i, slot = null) => {
    const currentSetting = slot ? slot.value : getSetting(`${key}-${i}`, null, tab);
    const save = slot ? (input, value) => slot.save(value) : (input, value) => saveSelectValue(input, i, value);

    if (settingSettings.searchable) {
      const picker = makeItemPicker({
        options: settingSettings.options,
        value: currentSetting ?? defaultValue?.[i]?.value ?? 'none',
        onChange: (value) => save(picker, value),
        placeholder: settingSettings.placeholder,
        preview: settingSettings.preview,
      });

      return picker;
    }

    const settingRowInputDropdownSelect = document.createElement('select');
    settingRowInputDropdownSelect.classList.add('inputBox');

    if (settingSettings.type === 'multi-select') {
      settingRowInputDropdownSelect.classList.add('multiSelect');
    }

    let foundSelected = false;

    /**
     * Add options to the dropdown. Groups become optgroups, and since those can't be nested, a
     * nested group gets its own optgroup labeled with the groups it's in.
     *
     * @param {Array} options The options.
     * @param {Array} labels  The names of the groups the options are in.
     */
    const appendOptions = (options, labels = []) => {
      let optgroup = null;

      options.forEach((option) => {
        if (option.value === 'group') {
          optgroup = null;
          appendOptions(option.options || [], [...labels, option.name]);
          return;
        }

        const result = makeOption(option, foundSelected, currentSetting, defaultValue, i);
        foundSelected = result.foundSelected;

        if (!labels.length) {
          settingRowInputDropdownSelect.append(result.settingRowInputDropdownSelectOption);
          return;
        }

        if (!optgroup) {
          optgroup = document.createElement('optgroup');
          optgroup.label = labels.join(' › ');
          settingRowInputDropdownSelect.append(optgroup);
        }

        optgroup.append(result.settingRowInputDropdownSelectOption);
      });
    };

    appendOptions(settingSettings.options);

    /**
     * Event listener for when the setting is changed.
     *
     * @param {Event} event The event.
     */
    settingRowInputDropdownSelect.onchange = (event) => {
      save(settingRowInputDropdownSelect, event.target.value);
    };

    return settingRowInputDropdownSelect;
  };

  /**
   * Add the dropdowns for an expandable multi-select, with a button to add more.
   *
   * The list is saved without empty slots, and only one empty dropdown is kept on the page, so
   * setting a second one to None removes it.
   */
  const addExpandableSlots = () => {
    const defaults = (defaultValue || []).map((option) => option.value);
    const slots = [];
    let savedLength = getMultiSelectCount(key, defaults, tab);

    settingRowInputDropdown.classList.add('mhui-multi-select-expandable');

    const addButton = makeElement('button', 'mhui-multi-select-add');
    addButton.type = 'button';
    addButton.title = 'Add another';
    makeElement('span', 'mhui-multi-select-add-icon', '', addButton);
    makeElement('span', 'mhui-multi-select-add-label', 'Add', addButton);

    const updateAddButton = () => {
      addButton.disabled = slots.some((slot) => 'none' === slot.value);
    };

    const saveSlots = () => {
      const values = slots.map((slot) => slot.value).filter((value) => 'none' !== value);

      // Clear out any slots past the end so they don't fall back to their defaults.
      for (let i = 0; i < Math.max(savedLength, values.length); i++) {
        saveSettingDirect(`${key}-${i}`, values[i] ?? 'none', tab);
      }

      savedLength = values.length;
      saveSettingDirect(`${key}-count`, values.length, tab);

      doEvent('mh-improved-settings-changed', {
        key: `${key}-count`,
        value: values,
        tab,
        type: 'multi-select',
      });

      flashSaved('count');
    };

    const addSlot = (value) => {
      const slot = { value };

      slot.save = (newValue) => {
        slot.value = newValue;

        if ('none' === newValue && slots.some((other) => other !== slot && 'none' === other.value)) {
          slots.splice(slots.indexOf(slot), 1);
          slot.element.remove();
        }

        updateAddButton();
        saveSlots();
      };

      slot.element = makeSlot(slots.length, slot);
      slots.push(slot);
      addButton.before(slot.element);
      updateAddButton();
    };

    addButton.addEventListener('click', () => addSlot('none'));
    settingRowInputDropdown.append(addButton);

    const values = Array.from({ length: savedLength }, (_, i) => getSetting(`${key}-${i}`, defaults[i] ?? 'none', tab)).filter((value) => value && 'none' !== value);

    (values.length ? values : ['none']).forEach((value) => addSlot(value));
  };

  if (isExpandable) {
    addExpandableSlots();
  } else {
    // make a multi-select dropdown.
    for (let i = 0; i < amount; i++) {
      settingRowInputDropdown.append(makeSlot(i));
    }
  }

  settingRowInput.append(settingRowInputDropdown);
  settingRowInputWrapper.append(settingRowInput);

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
  settingRowInputText.type = 'text';
  settingRowInputText.id = `setting-${key}`;
  settingRowInputText.value = getSettingDirect(key, defaultValue, tab);

  const inputSaveButton = makeMhButton({
    text: 'Save',
    className: 'inputSaveButton',
  });

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
    timeout = setTimeout(() => parent.classList.remove('completed'), 1000);
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

  const inputSaveButton = makeMhButton({
    text: 'Save',
    className: 'inputSaveButton',
  });

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
    timeout = setTimeout(() => parent.classList.remove('completed'), 1000);
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
 * @param {Object} options           The options for the blank setting.
 * @param {string} options.settingId The id of the setting row.
 *
 * @return {Object} The blank setting.
 */
const makeSettingBlank = ({ settingId }) => {
  const action = makeElement('div', ['blank', 'blankSetting'], '');
  action.id = `${settingId}-blank`;

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
 * @param {boolean} options.live        Whether changing the setting takes effect without a refresh.
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

  // Settings that apply on their own don't need the refresh banner. Multi-selects save each
  // dropdown under a numbered key, so those are marked too.
  if (options.live) {
    markSettingLive(key);
    // Expandable multi-selects save the whole list at once and announce it on the count key.
    markSettingLive(`${key}-count`);
    for (let i = 0; i < (settingSettings?.number || 1); i++) {
      markSettingLive(`${key}-${i}`);
    }

    // Multi-toggles save each toggle under its option's key.
    for (const option of 'multi-toggle' === settingSettings?.type ? settingSettings.options : []) {
      markSettingLive(`${key}-${option.id}`);
    }
  }

  // Make sure we have the container for our settings.
  const container = document.querySelector(`.mousehuntHud-page-tabContent.${tab}`);
  if (!container) {
    return false;
  }

  const section = {
    id: options.module.id,
    name: options.module.name || '',
    description: options.module.description || '',
    subSetting: options.module.subSetting || false,
  };

  section.id = `${tab}-${section.id.replaceAll(/[^\w-]/gi, '')}`;

  // If we don't have our custom settings section, then create it.
  let sectionExists = document.querySelector(`#${section.id}-wrapper`);
  if (!sectionExists) {
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

  // Setting rows are identified by their key alone, not by the section they happen to be rendered
  // in, so that recategorizing a module doesn't change its id, anchor link, or styles.
  const settingId = `${tab}-${keySafe}`;

  // If we already have a setting visible for our key, bail.
  const settingExists = document.querySelector(`#${settingId}`);
  if (settingExists) {
    return settingExists;
  }

  // Create the markup for the setting row.
  const settings = makeElement('div', ['PagePreferences__settingsList']);
  settings.id = settingId;

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

  const settingNameText = makeElement('span', 'PagePreferences__settingNameText', name);
  settingNameText.setAttribute('data-setting', key);
  settingNameText.setAttribute('data-tab', tab);
  settingNameText.setAttribute('data-default', JSON.stringify(defaultValue));
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

  // Titles can embed a links wrapper, which the browser parses into the title. Move it into the
  // action column so it sits below the control.
  const titleLinks = settingNameText.querySelector('.mhui-setting-title-links');
  if (titleLinks) {
    titleLinks.remove();
  }

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
      settingRowAction.append(makeSettingBlank({ settingId }));
    } else {
      settingRowAction.append(makeSettingToggle({ key, defaultValue, tab, settings }));
    }
  } else {
    settingRowAction.append(makeSettingToggle({ key, defaultValue, tab, settings }));
  }

  if (titleLinks) {
    settingRowAction.classList.add('PagePreferences__settingAction-hasLinks');
    settingRowAction.append(titleLinks);
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

// Settings changed since the page loaded that need a refresh, keyed to the value they started at.
// A toggle's starting value is known, so flipping it back clears it; other inputs stay pending.
const pendingRefresh = new Map();
const unknownStartValue = Symbol('unknown');

/**
 * Show or hide the refresh banner, depending on whether any changes still need a refresh.
 */
const updateRefreshBanner = () => {
  let banner = document.querySelector('#mh-utils-settings-refresh-message');

  if (pendingRefresh.size === 0) {
    banner?.remove();
    document.body.classList.remove('mh-improved-has-refresh-message');
    return;
  }

  if (banner) {
    return;
  }

  banner = makeElement('div', ['mh-utils-settings-refresh-message', 'mh-ui-fade']);
  banner.id = 'mh-utils-settings-refresh-message';
  makeElement('span', 'mh-utils-settings-refresh-message-text', 'Settings saved. Refresh the page to apply them.', banner);
  makeMhButton({
    text: 'Refresh',
    className: 'mh-utils-settings-refresh-message-button',
    size: 'small',
    callback: () => window.location.reload(),
    appendTo: banner,
  });

  document.body.append(banner);
  document.body.classList.add('mh-improved-has-refresh-message');
  setTimeout(() => banner.classList.add('mh-ui-fade-in'), 50);
};

/**
 * Track a changed setting and show the refresh banner if it needs a refresh to take effect.
 *
 * @param {Object} options       The changed setting.
 * @param {string} options.key   The setting key.
 * @param {*}      options.value The new value.
 * @param {string} options.type  The input type.
 */
const addSettingRefreshReminder = ({ key, value, type }) => {
  if (!key || isLiveSetting(key)) {
    return;
  }

  if (!pendingRefresh.has(key)) {
    pendingRefresh.set(key, 'toggle' === type ? !value : unknownStartValue);
  } else if (pendingRefresh.get(key) === value) {
    pendingRefresh.delete(key);
  }

  updateRefreshBanner();
};

onEvent('mh-improved-settings-changed', addSettingRefreshReminder);

/**
 * Add a heading for a group of sub-settings, unless the module row already has it.
 *
 * @param {HTMLElement} moduleSettingRow The module's setting row.
 * @param {string}      group            The group name.
 */
const addSubSettingGroupHeading = (moduleSettingRow, group) => {
  const headingId = `${moduleSettingRow.id}-group-${group.toLowerCase().replaceAll(/[^\da-z]+/g, '-')}`;
  if (document.querySelector(`#${headingId}`)) {
    return;
  }

  const heading = makeElement('div', 'PagePreferences__subSettingGroup', group);
  heading.id = headingId;
  moduleSettingRow.append(heading);
};

/**
 * Add the settings for a module.
 *
 * @param {Object} module The module to add settings for.
 */
const addSettingForModule = async (module) => {
  if (!module || !Array.isArray(module.modules)) {
    return;
  }

  for (const submodule of module.modules) {
    let moduleSettingRow = null;
    if (!submodule.alwaysLoad && !submodule.beta && !(submodule.hiddenUnlessEnabled && !getSetting(submodule.id, false) && !getFlag('show-deprecated-modules'))) {
      moduleSettingRow = await addSetting({
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
      if (!subSettingsGroup) {
        continue;
      }

      for (const subSettings of subSettingsGroup) {
        if (moduleSettingRow && subSettings.group) {
          addSubSettingGroupHeading(moduleSettingRow, subSettings.group);
        }

        const subSettingRow = await addSetting({
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
          live: subSettings.live,
        });

        if (moduleSettingRow && subSettingRow) {
          moduleSettingRow.append(subSettingRow);
        }
      }
    }

    doEvent('mh-improved-settings-added', { module });
  }
};

/**
 * Flatten a multi-select setting's options, pulling the options out of any groups, however nested.
 *
 * @param {Array} options The options for the setting.
 * @param {Array} exclude The option values to leave out.
 *
 * @return {Array} The flattened options.
 */
const flattenSettingOptions = (options, exclude = ['default']) => {
  return options
    .flatMap((option) => {
      if (Array.isArray(option.options)) {
        return flattenSettingOptions(option.options, []);
      }

      return option.value && option.name ? [option] : [];
    })
    .filter((option) => !exclude.includes(option.value));
};

export { addSettingForModule, addSetting, addSettingsTab, flattenSettingOptions };
