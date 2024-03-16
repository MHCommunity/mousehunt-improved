import {
  debuglog,
  deleteSetting,
  getData,
  getSetting,
  saveSetting
} from '@utils';

const deleteLocalStorageArCache = () => {
  const localStorageKeys = Object.keys(localStorage);
  for (const key of localStorageKeys) {
    if (key.startsWith('mh-improved-cached-ar-v')) {
      localStorage.removeItem(key);
    }
  }
};

const copyHyperspeedTravelFavorites = () => {
  const lvSettings = localStorage.getItem('lv-faves-settings');
  if (! lvSettings) {
    return;
  }

  const lvFavesSettings = JSON.parse();
  if (! lvFavesSettings) {
    return;
  }

  const lvFaves = Object.keys(lvFavesSettings?.locationList) || [];
  if (! lvFaves || ! lvFaves.length) {
    return;
  }

  const favorites = getSetting('better-travel.favorites', []);

  // if there are any favorites that we don't have, add them
  lvFaves.forEach((location) => {
    if (! favorites.includes(location)) {
      favorites.push(location);
      saveSetting('better-travel.favorites', favorites);
    }
  });
};

const removeOldEventFavoriteLocations = async () => {
  const eventEnvironments = await getData('environments-events');
  if (! eventEnvironments) {
    return;
  }

  const travelFavorites = getSetting('better-travel.favorites', []);

  travelFavorites.forEach((location) => {
    if (eventEnvironments.includes(location)) {
      travelFavorites.splice(travelFavorites.indexOf(location), 1);
      saveSetting('better-travel.favorites', travelFavorites);
    }
  });
};

const update = () => {
  debuglog('update-migration', 'Cleaning up old AR caches');
  deleteLocalStorageArCache();

  // Previously we migrated these, but now we just remove them and let them be re-created.
  localStorage.removeItem('journal-changer-last-change');
  localStorage.removeItem('mh-improved-cache-quests');
  localStorage.removeItem('wisdom-stat');

  deleteSetting('better-travel.has-migrated-favorites');

  copyHyperspeedTravelFavorites();
  removeOldEventFavoriteLocations();

  setGlobal('mh-improved-update-needs-refresh', true);
};

export default {
  id: '0.36.0',
  update
};
