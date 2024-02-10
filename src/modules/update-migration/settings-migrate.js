import { saveSetting } from '@utils';

/**
 * Migrate a setting.
 *
 * @param {Object} settingKey      The setting key to migrate.
 * @param {string} settingKey.from The setting key to migrate from.
 * @param {string} settingKey.to   The setting key to migrate to.
 */
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
