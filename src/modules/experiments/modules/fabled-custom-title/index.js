import {
  doEvent,
  getFlag,
  getSetting,
  isUserTitleAtLeast,
  makeElement,
  makeMhButton,
  onEvent,
  onNavigation,
  saveSetting
} from '@utils';

const customTitleSettingKey = 'experiments.fabled-custom-title-text';
const customTitleRowId = 'mousehunt-improved-settings-beta-experiments-fabled-custom-title';
const customTitleInputRowId = 'mousehunt-improved-settings-beta-experiments-fabled-custom-title-text';

/**
 * Update the max title text and progress bar.
 *
 * @param {string} customTitle The custom title to show.
 */
const updateTitleText = (customTitle = getSetting(customTitleSettingKey, '')) => {
  const title = document.querySelector('.mousehuntHud-userStat-maxTitle');
  if (! title) {
    return;
  }

  const cleanedTitle = String(customTitle).trim();
  if (! cleanedTitle) {
    return;
  }

  title.innerText = cleanedTitle;
};

/**
 * Add the custom title text input to the settings row.
 */
const addCustomTitleSettingInput = () => {
  const parentRow = document.querySelector(`#${customTitleRowId}`);
  if (! parentRow || document.querySelector(`#${customTitleInputRowId}`)) {
    return;
  }

  const settings = makeElement('div', ['PagePreferences__settingsList', 'PagePreferences__subSetting', 'PagePreferences__settingsList-input']);
  settings.id = customTitleInputRowId;

  const settingRow = makeElement('div', 'PagePreferences__setting');
  const settingRowLabel = makeElement('div', 'PagePreferences__settingLabel');
  const settingName = makeElement('div', 'PagePreferences__settingName');
  makeElement('div', 'PagePreferences__settingNameText', 'Custom title text', settingName);
  makeElement('div', 'PagePreferences__settingDescription', 'Enter the max title text to show in the HUD.', settingRowLabel);

  const settingRowAction = makeElement('div', 'PagePreferences__settingAction');
  const settingRowInput = makeElement('div', ['settingRow-action-inputContainer', 'inputText']);
  const input = makeElement('input', 'inputBox');
  input.value = getSetting(customTitleSettingKey, '');

  const saveButton = makeMhButton({
    text: 'Save',
    className: 'inputSaveButton',
  });

  let timeout = null;
  saveButton.addEventListener('click', () => {
    settings.classList.add('inputDropdownWrapper', 'inputTextWrapper', 'busy');
    settings.classList.remove('completed');

    saveSetting(customTitleSettingKey, input.value);
    updateTitleText(input.value);

    doEvent('mh-improved-settings-changed', {
      key: customTitleSettingKey,
      value: input.value,
      tab: 'mousehunt-improved-settings',
      type: 'input',
    });

    settings.classList.remove('busy');
    settings.classList.add('completed');

    clearTimeout(timeout);
    timeout = setTimeout(() => settings.classList.remove('completed'), 1000);
  });

  settingRowInput.append(input);
  settingRowInput.append(saveButton);
  settingRowAction.append(settingRowInput);

  settingRowLabel.prepend(settingName);
  settingRow.append(settingRowLabel);
  settingRow.append(settingRowAction);
  settings.append(settingRow);
  parentRow.append(settings);
};

/**
 * Initialize the module.
 */
const init = async () => {
  updateTitleText();
  addCustomTitleSettingInput();

  onNavigation(() => {
    updateTitleText();
    addCustomTitleSettingInput();
  });

  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if ('experiments.fabled-custom-title' === key && value) {
      setTimeout(addCustomTitleSettingInput, 0);
    }

    if (customTitleSettingKey === key) {
      updateTitleText(value);
    }
  });
};

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
const settings = async () => {
  return [{
    id: customTitleSettingKey,
    title: 'Text to show for max title in the HUD',
    default: 'MAX TITLE',
    settings: {
      type: 'input',
    },
  }];
};

export default {
  id: 'experiments.fabled-custom-title',
  name: 'HUD: Show custom max title text',
  description: 'Show a custom max title text.',
  showIf: () => isUserTitleAtLeast('fabled') || getFlag('fake-fabled'),
  load: init,
  settings,
};
