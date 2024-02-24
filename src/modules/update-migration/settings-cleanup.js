import { debuglog, getSetting, saveSetting } from '@utils';

import eventEnvironments from '@data/environments-events.json';

/**
 * Removes settings from local storage.
 *
 * @param {Array} settingsToDelete An array of setting ids to remove from local storage.
 */
const cleanupSettings = (settingsToDelete) => {
  settingsToDelete.forEach((setting) => {
    debuglog('update-migration', `Removing setting ${setting}`);
    localStorage.removeItem(setting);
  });
};

/**
 * Removes all the stored cache AR settings.
 */
const cleanupCacheArSettings = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('mh-improved-cached-ar-v')) {
      debuglog('update-migration', `Removing setting ${key}`);
      localStorage.removeItem(key);
    }
  });
};

const removeOldEventFavoriteLocations = () => {
  // key is event, value is array of months
  const events = [
    {
      key: 'gwh',
      months: [0, 10, 11]
    },
    {
      key: 'halloween',
      months: [9, 10]
    },
    {
      key: 'bday',
      months: [1, 2]
    }
  ];

  const travelSettings = getSetting('better-travel-settings');
  if (! travelSettings || ! travelSettings.favorites) {
    return;
  }

  const currentMonth = new Date().getMonth();
  travelSettings.favorites.forEach((favorite, index) => {
    // if the favorite location matches an event environment id and the event is not in the current month, remove it
    const isEventFavorite = eventEnvironments.find((event) => event.id === favorite);
    if (isEventFavorite && isEventFavorite.event) {
      const environmentEvent = isEventFavorite.event;

      // find the event in the events array
      const event = events.find((ee) => ee.key === environmentEvent);
      if (event && ! event.months.includes(currentMonth)) {
        travelSettings.favorites.splice(index, 1);
      }
    }
  });

  saveSetting('better-travel-settings', travelSettings);
};

export {
  cleanupSettings,
  cleanupCacheArSettings,
  removeOldEventFavoriteLocations
};
