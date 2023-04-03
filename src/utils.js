export function addUIStyles(styles) {
  const identifier = 'mh-ui-styles';

  const existingStyles = document.getElementById(identifier);
  if (existingStyles) {
  existingStyles.innerHTML += styles;
  return;
  }

  const style = document.createElement('style');
  style.id = identifier;
  style.innerHTML = styles;
  document.head.appendChild(style);
};

/**
 * Get the current page tab, defaulting to the current page if no tab is found.
 *
 * @return {string} The page tab.
 */
const getCurrentTab = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (! tab) {
    return getCurrentPage();
  }

  return tab.toLowerCase();
};

/**
 * Get the current page sub tab, defaulting to the current tab if no sub tab is found.
 *
 * @return {string} The page tab.
 */
const getCurrentSubTab = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('sub_tab');
  if (! tab) {
    return getCurrentPage();
  }

  return tab.toLowerCase();
};

/**
 * Add a setting to the preferences page, both on page load and when the page changes.
 *
 * @param {string}  name         The setting name.
 * @param {string}  key          The setting key.
 * @param {boolean} defaultValue The default value.
 * @param {string}  description  The setting description.
 * @param {Object}  section      The section settings.
 */
export function addSetting(name, key, defaultValue = true, description = '', section = {}, tab = 'game_settings') {
  onPageChange({ change: () => addSettingOnce(name, key, defaultValue, description, section, tab) });
  addSettingOnce(name, key, defaultValue, description, section, tab);
};

/**
 * Add a setting to the preferences page.
 *
 * @param {string}  name         The setting name.
 * @param {string}  key          The setting key.
 * @param {boolean} defaultValue The default value.
 * @param {string}  description  The setting description.
 * @param {Object}  section      The section settings.
 */
const addSettingOnce = (name, key, defaultValue = true, description = '', section = {}, tab = 'game_settings') => {
  // If we're not currently on the preferences page, bail.
  if ('preferences' !== getCurrentPage()) {
    return;
  }

  // Make sure we have the container for our settings.
  const container = document.querySelector(`.mousehuntHud-page-tabContent.${tab}`);
  if (! container) {
    return;
  }

  // Set the default section settings.
  section = Object.assign({
    name: 'Userscript Settings',
    id: 'mh-mouseplace-settings',
  }, section);

  // If we don't have our custom settings section, then create it.
  let sectionExists = document.querySelector(`#${section.id}`);
  if (! sectionExists) {
    // Make the element, add the ID and class.
    const title = document.createElement('div');
    title.id = section.id;
    title.classList.add('gameSettingTitle');

    // Set the title of our section.
    title.textContent = section.name;

    // Add a separator.
    const seperator = document.createElement('div');
    seperator.classList.add('separator');

    // Append the separator.
    title.appendChild(seperator);

    // Append it.
    container.appendChild(title);

    sectionExists = document.querySelector(`#${section.id}`);
  }

  // If we already have a setting visible for our key, bail.
  const settingExists = document.getElementById(`mh-mouseplace-setting-${key}`);
  if (settingExists) {
    return;
  }

  // Create the markup for the setting row.
  const settings = document.createElement('div');
  settings.classList.add('settingRowTable');
  settings.id = `mh-mouseplace-setting-${key}`;

  const settingRow = document.createElement('div');
  settingRow.classList.add('settingRow');

  const settingRowLabel = document.createElement('div');
  settingRowLabel.classList.add('settingRow-label');

  const settingName = document.createElement('div');
  settingName.classList.add('name');
  settingName.innerHTML = name;

  const defaultSettingText = document.createElement('div');
  defaultSettingText.classList.add('defaultSettingText');
  defaultSettingText.textContent = defaultValue ? 'Enabled' : 'Disabled';

  const settingDescription = document.createElement('div');
  settingDescription.classList.add('description');
  settingDescription.innerHTML = description;

  settingRowLabel.appendChild(settingName);
  settingRowLabel.appendChild(defaultSettingText);
  settingRowLabel.appendChild(settingDescription);

  const settingRowAction = document.createElement('div');
  settingRowAction.classList.add('settingRow-action');

  const settingRowInput = document.createElement('div');
  settingRowInput.classList.add('settingRow-action-inputContainer');

  const settingRowInputCheckbox = document.createElement('div');
  settingRowInputCheckbox.classList.add('mousehuntSettingSlider');

  // Depending on the current state of the setting, add the active class.
  const currentSetting = getSetting(key);
  let isActive = false;
  if (currentSetting) {
    settingRowInputCheckbox.classList.add('active');
    isActive = true;
  } else if (null === currentSetting && defaultValue) {
    settingRowInputCheckbox.classList.add('active');
    isActive = true;
  }

  // Event listener for when the setting is clicked.
  settingRowInputCheckbox.onclick = (event) => {
    saveSettingAndToggleClass(event.target, key, ! isActive);
  };

  // Add the input to the settings row.
  settingRowInput.appendChild(settingRowInputCheckbox);
  settingRowAction.appendChild(settingRowInput);

  // Add the label and action to the settings row.
  settingRow.appendChild(settingRowLabel);
  settingRow.appendChild(settingRowAction);

  // Add the settings row to the settings container.
  settings.appendChild(settingRow);
  sectionExists.appendChild(settings);
};

export function makeSettingsTab(identifier = 'mh-userscript-settings', name = 'Userscript Settings') {
  onPageChange({ change: () => makeSettingsTabOnce(identifier, name) });
  makeSettingsTabOnce(identifier, name);
};

const makeSettingsTabOnce = (identifier = 'mh-userscript-settings', name = 'Userscript Settings') => {
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

  const settingsTab = document.createElement('a');
  settingsTab.id = identifier;
  settingsTab.href = '#';
  settingsTab.classList.add('mousehuntHud-page-tabHeader', identifier);
  settingsTab.setAttribute('data-tab', identifier);
  settingsTab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

  const settingsTabText = document.createElement('span');
  settingsTabText.innerText = name;

  settingsTab.appendChild(settingsTabText);
  tabsContainer.appendChild(settingsTab);

  const settingsTabContent = document.createElement('div');
  settingsTabContent.classList.add('mousehuntHud-page-tabContent', 'game_settings', identifier );
  settingsTabContent.setAttribute('data-tab', identifier);

  tabsContentContainer.appendChild(settingsTabContent);

  if (identifier === getCurrentTab()) {
    const tab = document.getElementById(identifier);
    if (tab) {
      tab.click();
    }
  }
}
