import { exportPopup } from './exporter';

/**
 * Check if the favorite setups userscript is available.
 *
 * @return {boolean} If the favorite setups userscript is available.
 */
const hasFavoriteSetupsUserscript = () => {
  return localStorage.getItem('favorite-setups-saved');
};

/**
 * Fetch the favorite setups.
 *
 * @return {Array} The favorite setups.
 */
const fetch = async () => {
  const setups = JSON.parse(localStorage.getItem('favorite-setups-saved'));

  const flattenedSetups = [];

  for (const setupName in setups) {
    const setup = setups[setupName];
    flattenedSetups.push({
      name: setupName,
      bait: setup.bait,
      base: setup.base,
      weapon: setup.weapon,
      trinket: setup.trinket,
      skin: setup.skin,
      location: setup.location,
      sort: setup.sort,
    });
  }

  return flattenedSetups;
};

/**
 * Update the total items count.
 *
 * @param {Array} data The data.
 */
const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
};

/**
 * Export the favorite setups userscript.
 */
const exportFavoriteSetupsUserscript = () => {
  exportPopup({
    type: 'favorite-setups-saved',
    text: 'Favorite Setups (userscript)',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: [
        'Name',
        'Bait',
        'Base',
        'Weapon',
        'Trinket',
        'Skin',
        'Location',
        'Sort',
      ],
    },
  });
};

export {
  exportFavoriteSetupsUserscript,
  hasFavoriteSetupsUserscript
};
