import { doRequest } from '@utils';

import { exportPopup, recursiveFetch } from './exporter';

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

const getData = async (classification) => {
  const regionEl = document.querySelector(`.item-wrapper[data-region="${classification.id}"]`);

  const totalItemsEl = regionEl.querySelector('.total-items');
  totalItemsEl.textContent = '…';
  totalItemsEl.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });

  const response = await doRequest('managers/ajax/users/userInventory.php', {
    action: 'get_items_by_classification',
    'classifications[]': classification.id,
  });

  const items = [];

  // convert the weights to numbers
  response.items.forEach((item) => {
    const itemData = {
      item_id: item.item_id || 0,
      type: item.type || '',
      name: item.name || '',
      classification: item.classification || classification.id,
      quantity: item.quantity || 0,
      thumbnail: item.thumbnail || '',
      limited_edition: item.limited_edition || false,
      is_tradable: item.is_tradable || false,
      is_givable: item.is_givable || false,
    };

    items.push(itemData);
    totalItemsEl.textContent = items.length.toLocaleString();
  });

  // resolve the promise with the data
  return {
    category: classification.name,
    items,
  };
};

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
    fetch: () => recursiveFetch(itemCategories, getData),
    updateSingleTotal: true,
    download: {
      headers: [
        'Category',
        'Item ID',
        'Item Type',
        'Item Name',
        'Classification',
        'Quantity',
        'Thumbnail',
        'Limited Edition',
        'Tradable',
        'Givable',
      ],
      reduceResults: true,
    },
  });
};

export default exportInventory;
