import { doRequest, formatNumber } from '@utils';

import { exportPopup } from '../utils';

const itemCategories = [
  { id: 'weapon', name: 'Weapons' },
  { id: 'base', name: 'Bases' },
  { id: 'trinket', name: 'Charms' },
  { id: 'bait', name: 'Cheeses' },
  { id: 'skin', name: 'Skins' },
  { id: 'crafting_item', name: 'Crafting Items' },
  { id: 'convertible', name: 'Convertible Items' },
  { id: 'potion', name: 'Potions' },
  { id: 'stat', name: 'Misc. Items' },
  { id: 'collectible', name: 'Collectibles' },
  { id: 'map_piece', name: 'Map Pieces' },
  { id: 'adventure', name: 'Adventure Items' },
];

/**
 * Fetch every classification in a single request, grouped by classification.
 *
 * @return {Promise<Array>} The items for each classification.
 */
const getData = async () => {
  const request = { action: 'get_items_by_classification' };
  itemCategories.forEach((classification, index) => {
    request[`classifications[${index}]`] = classification.id;
  });

  const response = await doRequest('managers/ajax/users/userInventory.php', request);

  const grouped = Object.fromEntries(itemCategories.map(({ id }) => [id, []]));
  (response?.items || []).forEach((item) => {
    grouped[item.classification]?.push({
      item_id: item.item_id || 0,
      type: item.type || '',
      name: item.name || '',
      classification: item.classification,
      quantity: item.quantity || 0,
      thumbnail: item.thumbnail || '',
      limited_edition: item.limited_edition || false,
      is_tradable: item.is_tradable || false,
      is_givable: item.is_givable || false,
    });
  });

  return itemCategories.map((classification) => {
    const totalItemsEl = document.querySelector(`.item-wrapper[data-region="${classification.id}"] .total-items`);
    if (totalItemsEl) {
      totalItemsEl.textContent = formatNumber(grouped[classification.id].length);
    }

    return {
      category: classification.name,
      items: grouped[classification.id],
    };
  });
};

/**
 * Export the inventory.
 */
const exportInventory = () => {
  let inventoryMarkup = '';
  itemCategories.forEach((region) => {
    inventoryMarkup += `<div class="item-wrapper inventory" data-region="${region.id}">
      <div class="region-name">${region.name}</div>
      <div class="total-items">-</div>
  </div>`;
  });

  exportPopup({
    type: 'inventory',
    text: 'Inventory',
    headerMarkup: '<div class="region-name">Category</div><div class="total-items">Items</div>',
    itemsMarkup: inventoryMarkup,
    footerMarkup: '<div class="region-name">Total</div><div class="total-items">0</div>',
    /**
     * Fetch the data for the inventory.
     *
     * @return {Promise} The promise that resolves when the data is fetched.
     */
    fetch: getData,
    updateSingleTotal: true,
    download: {
      headers: ['Category', 'Item ID', 'Item Type', 'Item Name', 'Classification', 'Quantity', 'Thumbnail', 'Limited Edition', 'Tradable', 'Givable'],
      reduceResults: true,
    },
  });
};

export default exportInventory;
