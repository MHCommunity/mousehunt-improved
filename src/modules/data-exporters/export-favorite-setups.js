import { exportPopup } from './exporter';
import { getSetting } from '@utils';

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

const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
};

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
