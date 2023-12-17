import { saveSetting } from '@utils';

const migrateSetting = (settingKey) => {
  const setting = localStorage.getItem(settingKey.from);
  if (null === setting) {
    return;
  }

  saveSetting(settingKey.to, JSON.parse(setting));

  localStorage.removeItem(settingKey.from);
};

const migrateSettings = (settings) => {
  settings.forEach((setting) => {
    migrateSetting(setting);
  });
};

export default migrateSettings;
