import { getSetting, saveSetting } from '@utils';

const getTravelSetting = (settingName, defaultValue) => {
  return getSetting(`better-travel.${settingName}`, defaultValue);
};

const saveTravelSetting = (settingName, value) => {
  saveSetting(`better-travel.${settingName}`, value);
};

export {
  getTravelSetting,
  saveTravelSetting
};
