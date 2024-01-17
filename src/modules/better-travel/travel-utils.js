import { getSetting, saveSetting } from '@utils';

const getTravelSettings = () => {
  return getSetting('better-travel', {});
};

const getTravelSetting = (settingName, defaultValue) => {
  const settings = getTravelSettings();
  return settings[settingName] || defaultValue;
};

const saveTravelSetting = (settingName, value) => {
  const settings = getTravelSettings();
  settings[settingName] = value;
  saveSetting('better-travel', settings);
};

export {
  getTravelSettings,
  getTravelSetting,
  saveTravelSetting
};
