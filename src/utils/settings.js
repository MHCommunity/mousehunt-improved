/**
 * Get the saved settings.
 *
 * @param {string}  key          The key to get.
 * @param {boolean} defaultValue The default value.
 * @param {string}  identifier   The identifier for the settings.
 *
 * @return {Object} The saved settings.
 */
const getSettingDirect = (key = null, defaultValue = null, identifier = 'mh-utils-settings') => {
  // Grab the local storage data.
  const settings = JSON.parse(localStorage.getItem(identifier)) || {};

  // If we didn't get a key passed in, we want all the settings.
  if (! key) {
    return settings;
  }

  // If the setting doesn't exist, return the default value.
  if (Object.prototype.hasOwnProperty.call(settings, key)) {
    return settings[key];
  }

  return defaultValue;
};

/**
 * Save a setting.
 *
 * @param {string}  key        The setting key.
 * @param {boolean} value      The setting value.
 * @param {string}  identifier The identifier for the settings.
 */
const saveSettingDirect = (key, value, identifier = 'mh-utils-settings') => {
  // Grab all the settings, set the new one, and save them.
  const settings = getSettingDirect(null, {}, identifier);
  settings[key] = value;

  localStorage.setItem(identifier, JSON.stringify(settings));
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
  saveSetting
};
