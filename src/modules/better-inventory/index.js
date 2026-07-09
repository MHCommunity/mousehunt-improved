import {
  addStyles,
  createPopup,
  getCurrentLocation,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  getData,
  getSetting,
  makeElement,
  makeMhButton,
  onNavigation,
  onOverlayChange,
  onRequest
} from '@utils';

import recipes from './modules/recipes';
import settings from './settings';

import doubleWidthStyles from './styles/double-width-item.css';
import fullWidthStyles from './styles/full-width-item.css';
import largerImagesStyles from './styles/larger-images.css';
import styles from './styles/styles.css';
import tinyGroupStyles from './styles/tiny-group.css';

/**
 * Set the quantity to the max when clicking the convert button.
 *
 * @param {number} attempts The number of attempts.
 */
const setOpenQuantityOnClick = (attempts = 0) => {
  const qty = document.querySelector('.itemView-action-convertForm');
  if (! qty) {
    if (attempts > 10) {
      return;
    }

    setTimeout(setOpenQuantityOnClick, 200, attempts + 1);
    return;
  }

  qty.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
      const textQty = e.target.innerText;
      const qtyArray = textQty.split(' ');
      let maxNum = qtyArray.at(-1);
      maxNum = maxNum.replace('Submit', '');
      maxNum = Number.parseInt(maxNum);

      const input = document.querySelector('.itemView-action-convert-quantity');
      input.value = maxNum;
    }
  });
};

/**
 * Add the item view popup to collectibles.
 */
const updateCollectibles = () => {
  const collectibles = document.querySelectorAll('.mousehuntHud-page-subTabContent.collectible .inventoryPage-item.small');
  if (! collectibles.length) {
    return;
  }

  collectibles.forEach((collectible) => {
    const type = collectible.getAttribute('data-item-type');
    if (! type) {
      return;
    }

    const name = collectible.getAttribute('data-name');
    const nameEl = collectible.querySelector('.inventoryPage-item-content-name span');
    if (name && nameEl) {
      nameEl.innerText = name;
    }

    if ('message_item' === collectible.getAttribute('data-item-classification')) {
      return;
    }

    collectible.setAttribute('onclick', '');
    collectible.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.ItemView.show(type);
    });
  });
};

/**
 * Add the arm button to charms.
 */
const addArmButtonToCharms = () => {
  if ('inventory' !== getCurrentPage() || 'traps' !== getCurrentTab() || 'trinket' !== getCurrentSubtab()) {
    return;
  }

  const charms = document.querySelectorAll('.inventoryPage-item.trinket');
  if (! charms.length) {
    return;
  }

  charms.forEach((charm) => {
    // If it already has an arm button, skip it.
    const existingArmButton = charm.querySelector('.inventoryPage-item-imageContainer-action');
    if (existingArmButton) {
      return;
    }

    const actionContainer = charm.querySelector('.inventoryPage-item-imageContainer');
    if (! actionContainer) {
      return;
    }

    const armButton = makeElement('div', 'inventoryPage-item-imageContainer-action');
    armButton.setAttribute('onclick', 'app.pages.InventoryPage.armItem(this); return false;');

    actionContainer.append(armButton);
  });
};

const sortInventoryItemsByName = (items) => {
  return [...items].sort((a, b) => {
    const aName = a.getAttribute('data-name') || '';
    const bName = b.getAttribute('data-name') || '';

    return aName.localeCompare(bName);
  }).filter((item, index, self) => {
    return index === self.findIndex((t) => (
      t.getAttribute('data-item-type') === item.getAttribute('data-item-type')
    ));
  });
};

const addSkinPreview = async (item) => {
  const type = item.getAttribute('data-item-type');
  if (! items) {
    items = await getData('items');
  }

  const itemData = items.find((i) => i.type === type);
  if (! itemData || ! itemData?.images?.trap) {
    return;
  }

  const description = item.querySelector('.inventoryPage-item-content-description-text');
  if (! description) {
    return;
  }

  if (item.getAttribute('data-added-preview')) {
    return;
  }

  item.setAttribute('data-added-preview', true);

  const preview = makeElement('div', 'mh-improved-skin-preview');
  const previewLink = makeElement('a', 'mh-improved-skin-preview-link');
  previewLink.href = '#';
  previewLink.innerText = 'View Image';
  previewLink.setAttribute('data-image', itemData.images.trap);
  previewLink.addEventListener('click', (e) => {
    e.preventDefault();
    const popup = createPopup({
      title: itemData.name,
      template: 'largerImage',
      className: 'largerImage',
      show: false,
    });

    popup.addToken('{*image*}', itemData.images.trap);
    popup.show();
  });

  preview.append(previewLink);

  description.append(preview);
};

const resortInventory = () => {
  const lists = document.querySelectorAll('.mousehuntHud-page-tabContent.active .inventoryPage-tagContent-listing');

  lists.forEach((list) => {
    const items = list.querySelectorAll('.inventoryPage-item');
    sortedItems = sortInventoryItemsByName(items);

    for (const item of items) {
      // While we're here, update the name so its not truncated.
      const name = item.getAttribute('data-name');
      const nameEl = item.querySelector('.inventoryPage-item-content-name span');
      if (name && nameEl) {
        nameEl.innerText = name;
      }

      addSkinPreview(item);

      list.append(item);
    }
  });
};

const addResortInventory = () => {
  onNavigation(() => {
    setTimeout(resortInventory, 250);
  }, {
    page: 'inventory',
    anyTab: true,
    anySubtab: true,
  });

  onRequest('pages/page.php', (response, data) => {
    if ('Inventory' === data.page_class) {
      setTimeout(resortInventory, 250);
    }
  });
};

let _InventoryPageuseItem;
const replaceInventoryView = () => {
  if (_InventoryPageuseItem) {
    return;
  }

  _InventoryPageuseItem = app.pages.InventoryPage.useItem;

  app.pages.InventoryPage.useItem = function (target) {
    const itemClassification = target.getAttribute('data-item-classification');
    if (! itemClassification) {
      return _InventoryPageuseItem.call(this, target);
    }

    const allowedTypes = [
      'bait',
      'collectible',
      'crafting_item',
      'message_item',
      'recipe',
      'stat',
    ];

    if (! allowedTypes.includes(itemClassification)) {
      return _InventoryPageuseItem.call(this, target);
    }

    const container = target.closest('.mousehuntHud-page-subTabContent');
    if (! container) {
      return _InventoryPageuseItem.call(this, target);
    }

    if (container.classList.contains('hammer')) {
      return this.showConfirmPopup(target, 'hammer');
    }

    if ('recipe' === itemClassification) {
      const element = document.elementFromPoint(window.event.clientX, window.event.clientY);
      const closest = element.closest('[data-produced-item]');
      if (closest) {
        app.pages.InventoryPage.showConfirmPopup(closest, 'recipe');
      }

      return;
    }

    const itemType = target.getAttribute('data-item-type');

    if ('crafting_item' === itemClassification) {
      // If the user is holding shift, then show the item view.
      if (window.event && window.event.shiftKey) {
        return hg.views.ItemView.show(itemType);
      }

      return this.toggleCraftingTableItem(target);
    }

    if ('message_item' === itemClassification) {
      return this.useMessageItem(target);
    }

    if ('bait' === itemClassification) {
      return this.armItem(target);
    }

    if (! itemType) {
      return;
    }

    if ('eggstreme_eggscavation_upgrade_stat_item' === itemType || 'eggstreme_eggscavation_shovel_stat_item' === itemType) {
      return hg.views.EggstremeEggscavationView.show();
    }

    hg.views.ItemView.show(itemType);
  };
};

const cheeseEffectValues = {
  'Uber Fresh': 13,
  'Ultim. Fresh': 12,
  'Ultimately Fresh': 12,
  'Insanely Fresh': 11,
  'Extrmly. Fresh': 10,
  'Extremely Fresh': 10,
  'Very Fresh': 9,
  Fresh: 8,
  'No Effect': 7,
  Stale: 6,
  'Very Stale': 5,
  'Extrmly. Stale': 4,
  'Extremely Stale': 4,
  'Insanely Stale': 3,
  'Ultim. Stale': 2,
  'Uber Stale': 1
};

/**
 * Read the displayed quantity from an inventory item element.
 *
 * @param {Element} el The inventory item element.
 *
 * @return {number} The quantity.
 */
const getInventoryItemQuantity = (el) => {
  const qtyEl = el.querySelector('.quantity');
  if (! qtyEl) {
    return 0;
  }

  const text = (qtyEl.getAttribute('title') || qtyEl.textContent || '').trim().toLowerCase().replaceAll(',', '');
  const num = Number.parseFloat(text);
  if (Number.isNaN(num)) {
    return 0;
  }

  if (text.includes('m')) {
    return num * 1_000_000;
  }

  if (text.includes('k')) {
    return num * 1000;
  }

  return num;
};

let specialEffectItems = null;

/**
 * Add sorting and filtering controls to the inventory traps tab.
 */
const addTrapSorting = async () => {
  const header = document.querySelector('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabHeader-container');
  if (! header) {
    return;
  }

  // Load all data up front (before touching the DOM) so that two concurrent
  // navigations can't both pass the "remove existing row" check and then each
  // append a row (which produced the duplicated controls).
  const titles = await getData('titles');
  if (! specialEffectItems) {
    specialEffectItems = await getData('trap-special-effects');
  }

  // An item has a special effect if it always does (`all`) or does in the
  // current location — matching the trap-selector-special-effects module.
  const specialTypes = new Set([
    ...(specialEffectItems?.all || []),
    ...(specialEffectItems?.[getCurrentLocation()] || []),
  ]);

  // Remove any existing controls (this also drops their click listeners).
  document.querySelectorAll('.mh-inventory-sort-row').forEach((el) => el.remove());

  let itemClass = getCurrentSubtab();
  if ('traps' === itemClass) {
    itemClass = 'base';
  }

  const listingSelector = `.inventoryPage-tagContent-listing .inventoryPage-item.${itemClass}`;

  const getEntries = () => [...document.querySelectorAll(listingSelector)].map((el) => {
    const type = el.getAttribute('data-item-type');
    return { el, type, item: items.find((i) => i.type === type) };
  });

  // --- Filters ---
  const filters = { le: 'all', effects: 'all' };

  const applyFilters = () => {
    getEntries().forEach(({ el, type, item }) => {
      const leOk = filters.le === 'all' ||
        (filters.le === 'le' ? Boolean(item?.is_limited_edition) : ! item?.is_limited_edition);
      const effectsOk = filters.effects === 'all' ||
        (filters.effects === 'special' ? specialTypes.has(type) : ! specialTypes.has(type));

      el.classList.toggle('mh-inventory-item-hidden', ! (leOk && effectsOk));
    });
  };

  // --- Sorting ---
  const compare = (a, b, sortType) => {
    if (sortType === 'name') {
      return (a.item?.name || '').localeCompare(b.item?.name || '');
    }

    if (sortType === 'min_title') {
      const aTitle = titles.find((t) => t.id === a.item?.has_stats?.min_title)?.order || 0;
      const bTitle = titles.find((t) => t.id === b.item?.has_stats?.min_title)?.order || 0;
      return aTitle - bTitle;
    }

    if (sortType === 'cheese_effect') {
      return (cheeseEffectValues[a.item?.has_stats?.cheese_effect] || 0) - (cheeseEffectValues[b.item?.has_stats?.cheese_effect] || 0);
    }

    if (sortType === 'quantity') {
      return getInventoryItemQuantity(a.el) - getInventoryItemQuantity(b.el);
    }

    const statValue = (entry) => {
      let value = Number.parseFloat(entry.item?.has_stats?.[sortType] || 0);
      if (! value || Number.isNaN(value)) {
        const text = entry.item?.has_stats?.[`${sortType}_formatted`] || '0';
        value = Number.parseFloat(text.replace('%', '')) || 0;
      }
      return value || 0;
    };

    return statValue(a) - statValue(b);
  };

  const doSort = (sortType, order) => {
    const entries = getEntries();
    if (! entries.length) {
      return;
    }

    const container = entries[0].el.parentElement;
    if (! container) {
      return;
    }

    entries.sort((a, b) => {
      const result = compare(a, b, sortType);
      return order === 'asc' ? result : -result;
    });

    entries.forEach(({ el }) => container.append(el));
  };

  // --- Build the controls ---
  const sortRow = makeElement('div', 'mh-inventory-sort-row');

  const sortGroup = makeElement('div', 'mh-inventory-control-group', '', sortRow);
  makeElement('span', 'mh-inventory-control-label', 'Sort', sortGroup);

  const sortTypes = [
    { name: 'Name', type: 'name' },
    { name: 'Power', type: 'power' },
    { name: 'Power Bonus', type: 'power_bonus' },
    { name: 'Luck', type: 'luck' },
    { name: 'Attraction Bonus', type: 'attraction_bonus' },
    { name: 'Title', type: 'min_title' },
    { name: 'Quantity', type: 'quantity' },
    { name: 'Cheese Effect', type: 'cheese_effect' },
  ];

  const sortButtons = [];
  sortTypes.forEach((sortDef) => {
    const button = makeMhButton({
      text: sortDef.name,
      className: ['mh-inventory-sort-button', 'lightBlue'],
      appendTo: sortGroup,
    });
    sortButtons.push(button);

    button.addEventListener('click', (event) => {
      event.preventDefault();

      const isActive = button.classList.contains('active');
      const order = isActive && button.getAttribute('data-sort-order') === 'desc' ? 'asc' : 'desc';

      sortButtons.forEach((other) => {
        other.classList.toggle('active', other === button);
        if (other !== button) {
          other.removeAttribute('data-sort-order');
        }
      });
      button.setAttribute('data-sort-order', order);

      doSort(sortDef.type, order);
    });
  });

  const filterGroup = makeElement('div', 'mh-inventory-control-group', '', sortRow);
  makeElement('span', 'mh-inventory-control-label', 'Filter', filterGroup);

  const filterDefs = [
    { group: 'le', value: 'le', name: 'LE' },
    { group: 'le', value: 'non-le', name: 'Non-LE' },
    { group: 'effects', value: 'special', name: 'Special' },
    { group: 'effects', value: 'normal', name: 'Normal' },
  ];

  const filterButtons = [];
  filterDefs.forEach((filterDef) => {
    const button = makeMhButton({
      text: filterDef.name,
      className: ['mh-inventory-filter-button', 'lightBlue'],
      appendTo: filterGroup,
    });
    button.setAttribute('data-filter-group', filterDef.group);
    button.setAttribute('data-filter-value', filterDef.value);
    filterButtons.push(button);

    button.addEventListener('click', (event) => {
      event.preventDefault();

      // Toggle: clicking the active value clears the group; otherwise select it.
      filters[filterDef.group] = filters[filterDef.group] === filterDef.value ? 'all' : filterDef.value;

      filterButtons.forEach((other) => {
        if (other.getAttribute('data-filter-group') === filterDef.group) {
          other.classList.toggle('active', other.getAttribute('data-filter-value') === filters[filterDef.group]);
        }
      });

      applyFilters();
    });
  });

  header.append(sortRow);
};

const go = () => {
  updateCollectibles();
  addArmButtonToCharms();
  replaceInventoryView();
};

let items;

/**
 * Main function.
 */
const main = async () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  items = await getData('items');

  go();

  onNavigation(go, {
    page: 'inventory',
  });

  if (getSetting('better-inventory.add-trap-sorting', false)) {
    onNavigation(addTrapSorting, {
      page: 'inventory',
      tab: 'traps',
      anySubtab: true,
    });
  }

  if (getSetting('better-inventory.sort-inventory', true)) {
    addResortInventory();
  }

  recipes();
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles([
    styles,
    getSetting('better-inventory.one-item-per-row', true) ? fullWidthStyles : doubleWidthStyles,
    getSetting('better-inventory.larger-images', true) ? largerImagesStyles : '',
    getSetting('better-inventory.show-all-group', false) ? tinyGroupStyles : '',
  ], 'better-inventory');

  main();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-inventory',
  name: 'Better Inventory',
  type: 'inventory-economy',
  default: true,
  description: 'Update the inventory layout and styling.',
  load: init,
  settings,
};
