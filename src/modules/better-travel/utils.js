import { getCurrentLocation, getSetting, saveSetting } from '@utils';

/**
 * Locations with a cursed/twisted variant, keyed by environment id.
 */
const cursedLocations = {
  lost_city: { quest: 'QuestLostCity', name: 'Cursed City' },
  sand_dunes: { quest: 'QuestSandDunes', name: 'Sand Crypts' },
  desert_oasis: { quest: 'QuestLivingGarden', name: 'Twisted Garden' },
};

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

/**
 * Get the alternate (cursed/twisted) name for a location, if it has one.
 *
 * @param {string} locationId The environment id.
 *
 * @return {string|null} The alternate name, or null.
 */
const getAlternateLocationName = (locationId) => {
  return cursedLocations[locationId]?.name || null;
};

/**
 * Get the display name for a location, using the cursed/twisted name when
 * the curse is active. The curse is shared between all three locations, but
 * quest data only exists for the current one, so we can only tell while the
 * user is in one of them.
 *
 * @param {Object} environment The environment object.
 *
 * @return {string} The display name.
 */
const getLocationDisplayName = (environment) => {
  const cursed = cursedLocations[environment?.id];
  const current = cursedLocations[getCurrentLocation()];
  if (!cursed || !current) {
    return environment?.name;
  }

  return false === user?.quests?.[current.quest]?.is_normal ? cursed.name : environment.name;
};

export { getAlternateLocationName, getLocationDisplayName, getTravelSetting, saveTravelSetting };
