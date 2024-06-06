import { exportPopup } from '../utils';
import { getSetting } from '@utils';

/**
 * Fetch the favorite setups.
 *
 * @return {Array} The favorite setups.
 */
const fetch = async () => {
  const setups = getSetting('favorite-setups.setups');

  // resort the setups so that they are { id, name, location, weapon_id, base_id, trinket_id, bait_id, power_type } and add default values
  return setups.map((setup) => {
    return {
      id: setup.id || 0,
      name: setup.name || '',
      location: setup.location || '',
      bait_id: setup.bait_id || 0,
      base_id: setup.base_id || 0,
      trinket_id: setup.trinket_id || 0,
      weapon_id: setup.weapon_id || 0,
      power_type: setup.power_type || '',
    };
  });
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
 * Export the favorite setups.
 */
const exportFavoriteSetups = () => {
  exportPopup({
    type: 'favorite-setups',
    text: 'Favorite Setups',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: [
        'ID',
        'Name',
        'Location',
        'Bait ID',
        'Base ID',
        'Trinket ID',
        'Weapon ID',
        'Power Type',
      ],
    },
  });
};

export default exportFavoriteSetups;
