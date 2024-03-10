/**
 * Get the saved settings.
 *
 * @param {string}  key          The key to get.
 * @param {boolean} defaultValue The default value.
 * @param {string}  identifier   The identifier for the settings.
 *
 * @return {Object} The saved settings.
 */
const getSettingDirect = (key = null, defaultValue = null, identifier = 'mousehunt-improved-settings') => {
  // Grab the local storage data.
  const settings = JSON.parse(localStorage.getItem(identifier)) || {};

  // If we didn't get a key passed in, we want all the settings.
  if (! key) {
    return settings;
  }

  const groupAndKey = getGroupAndKey(key);

  if (groupAndKey.group) {
    const group = settings[groupAndKey.group] || {};
    return group[groupAndKey.key] || defaultValue;
  }

  return settings[key] || defaultValue;
};

/**
 * Save a setting.
 *
 * @param {string}  key        The setting key.
 * @param {boolean} value      The setting value.
 * @param {string}  identifier The identifier for the settings.
 */
const saveSettingDirect = (key, value, identifier = 'mousehunt-improved-settings') => {
  // Grab all the settings, set the new one, and save them.
  const settings = getSettingDirect(null, {}, identifier);

  const groupAndKey = getGroupAndKey(key);

  if (groupAndKey.group) {
    if (! settings[groupAndKey.group]) {
      settings[groupAndKey.group] = {};
    }

    settings[groupAndKey.group][groupAndKey.key] = value;
  } else {
    settings[key] = value;
  }

  localStorage.setItem(identifier, JSON.stringify(settings));
};

const getGroupAndKey = (key) => {
  // if the string is not in the format of group.key, then we assume it's a global setting
  if (! key.includes('.')) {
    return { key };
  }

  const split = key.split('.');

  if (split[0] === 'location-huds-enabled') {
    return {
      group: 'location-huds-enabled',
      key: split[1],
    };
  }

  return {
    group: `${split[0]}-settings`,
    key: split[1],
  };
};

/**
 * Wrapper for getting a setting.
 *
 * @param {string}  key          Key of the setting.
 * @param {boolean} defaultValue Default value of the setting.
 *
 * @return {boolean} Value of the setting.
 */
const getSetting = (key, defaultValue = false) => {
  return getSettingDirect(key, defaultValue, 'mousehunt-improved-settings');
};

/**
 * Delete a setting.
 *
 * @param {string} key The setting key.
 */
const deleteSetting = (key) => {
  const settings = getSettings();
  delete settings[key];
  localStorage.setItem('mousehunt-improved-settings', JSON.stringify(settings));
};

/**
 * Get the saved settings.
 *
 * @return {Object} The saved settings.
 */
const getSettings = () => {
  const settings = localStorage.getItem('mousehunt-improved-settings');
  if (! settings) {
    return {};
  }

  return JSON.parse(settings);
};

/**
 * Wrapper for saving a setting.
 *
 * @param {string}  key   Key of the setting.
 * @param {boolean} value Value of the setting.
 *
 * @return {boolean} Value of the setting.
 */
const saveSetting = (key, value) => {
  saveSettingDirect(key, value, 'mousehunt-improved-settings');

  return value;
};

export {
  getSettingDirect,
  saveSettingDirect,
  getSetting,
  saveSetting,
  getSettings,
  deleteSetting
};
