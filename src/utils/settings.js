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

  // If the key contains a period, then it's a group and key, otherwise it's just a key.
  if (! key.includes('.')) {
    if (settings[key] === undefined) {
      return defaultValue;
    }

    return settings[key];
  }

  const groupAndKey = getGroupAndKey(key);

  if (! groupAndKey.group) {
    if (settings[groupAndKey.key] === undefined) {
      return defaultValue;
    }

    return settings[groupAndKey.key];
  }

  const groupSettings = settings[groupAndKey.group] || {};

  if (groupSettings[groupAndKey.key] === undefined) {
    return defaultValue;
  }

  return groupSettings[groupAndKey.key];
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

/**
 * Get the group and key from a composite key.
 *
 * @param {string} key The composite key.
 *
 * @return {Object} The group and key.
 */
const getGroupAndKey = (key) => {
  const split = key.split('.');

  // If there's only one part, then return it as the key.
  if (split.length === 1) {
    return {
      group: null,
      key: split[0],
    };
  }

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

  const groupAndKey = getGroupAndKey(key);
  if (groupAndKey.group) {
    if (settings[groupAndKey.group]) {
      delete settings[groupAndKey.group][groupAndKey.key];
    } else {
      delete settings[groupAndKey.key];
    }
  } else {
    delete settings[key];
  }

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
