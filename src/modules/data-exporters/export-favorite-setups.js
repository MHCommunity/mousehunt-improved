import { exportPopup } from './exporter';

const hasFavoriteSetups = () => {
  return localStorage.getItem('favorite-setups-saved');
};

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

const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
};

const exportFavoriteSetups = () => {
  exportPopup({
    type: 'favorite-setups-saved',
    text: 'Favorite Setups',
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
    }
  });
};

export {
  exportFavoriteSetups,
  hasFavoriteSetups
};
