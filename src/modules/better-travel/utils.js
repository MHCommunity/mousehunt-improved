import { getSetting, saveSetting } from '@utils';

/**
 * Get a travel setting.
 *
 * @param {string} settingName  The name of the setting to get.
 * @param {*}      defaultValue The default value to return if the setting is not found.
 *
 * @return {*} The value of the setting.
 */
const getTravelSetting = (settingName, defaultValue) => {
  return getSetting(`better-travel.${settingName}`, defaultValue);
};

/**
 * Save a travel setting.
 *
 * @param {string} settingName The name of the setting to save.
 * @param {*}      value       The value to save.
 */
const saveTravelSetting = (settingName, value) => {
  saveSetting(`better-travel.${settingName}`, value);
};

export {
  getTravelSetting,
  saveTravelSetting
};
