import {
  addOnboardingTip,
  addStyles,
  createPopup,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  getData,
  getSetting,
  makeElement,
  onNavigation,
  onOverlayChange,
  onRequest,
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
  if (!qty) {
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
  if (!collectibles.length) {
    return;
  }

  collectibles.forEach((collectible) => {
    const type = collectible.getAttribute('data-item-type');
    if (!type) {
      return;
    }

    const name = getItemDisplayName(collectible); // eslint-disable-line no-use-before-define
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
  if (!charms.length) {
    return;
  }

  charms.forEach((charm) => {
    // If it already has an arm button, skip it.
    const existingArmButton = charm.querySelector('.inventoryPage-item-imageContainer-action');
    if (existingArmButton) {
      return;
    }

    const actionContainer = charm.querySelector('.inventoryPage-item-imageContainer');
    if (!actionContainer) {
      return;
    }

    const armButton = makeElement('div', 'inventoryPage-item-imageContainer-action');
    armButton.setAttribute('onclick', 'app.pages.InventoryPage.armItem(this); return false;');

    actionContainer.append(armButton);
  });
};

/**
 * Get an item's real name.
 *
 * The Enhanced Search experiment appends its search terms to `data-name`, because that's what the
 * game's own inventory filter matches on. It stashes the untouched name in `data-mhui-name` so that
 * displaying or sorting on the name here doesn't pick up the terms as well.
 *
 * @param {Element} item The inventory item.
 *
 * @return {string} The item's name.
 */
const getItemDisplayName = (item) => {
  return item.getAttribute('data-mhui-name') || item.getAttribute('data-name') || '';
};

const sortInventoryItemsByName = (items) => {
  return [...items]
    .sort((a, b) => {
      const aName = getItemDisplayName(a);
      const bName = getItemDisplayName(b);

      return aName.localeCompare(bName);
    })
    .filter((item, index, self) => {
      return index === self.findIndex((t) => t.getAttribute('data-item-type') === item.getAttribute('data-item-type'));
    });
};

const addSkinPreview = async (item) => {
  const type = item.getAttribute('data-item-type');
  if (!items) {
    items = await getData('items');
  }

  const itemData = items.find((i) => i.type === type);
  if (!itemData || !itemData?.images?.trap) {
    return;
  }

  const description = item.querySelector('.inventoryPage-item-content-description-text');
  if (!description) {
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
    const sortedItems = sortInventoryItemsByName(items);

    for (const item of items) {
      // While we're here, update the name so its not truncated.
      const name = getItemDisplayName(item);
      const nameEl = item.querySelector('.inventoryPage-item-content-name span');
      if (name && nameEl) {
        nameEl.innerText = name;
      }

      addSkinPreview(item);
    }

    for (const item of sortedItems) {
      list.append(item);
    }
  });
};

const addResortInventory = () => {
  onNavigation(
    () => {
      setTimeout(resortInventory, 250);
    },
    {
      page: 'inventory',
      anyTab: true,
      anySubtab: true,
    }
  );

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
    if (!itemClassification) {
      return _InventoryPageuseItem.call(this, target);
    }

    const allowedTypes = ['bait', 'collectible', 'crafting_item', 'message_item', 'recipe', 'stat'];

    if (!allowedTypes.includes(itemClassification)) {
      return _InventoryPageuseItem.call(this, target);
    }

    const container = target.closest('.mousehuntHud-page-subTabContent');
    if (!container) {
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

    if (!itemType) {
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
  'Uber Stale': 1,
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
  if (!qtyEl) {
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
 * Make a pill option styled like the game's native inventory filter pills.
 *
 * @param {string} text  The option text.
 * @param {string} title Tooltip text.
 *
 * @return {HTMLElement} The option link.
 */
const makeFilterOption = (text, title) => {
  const option = makeElement('a', ['mousehuntHud-page-subTabContent-prefix-filter-option', 'mh-inventory-option'], text);
  option.setAttribute('href', '#');
  option.setAttribute('title', title);

  return option;
};

/**
 * Add sorting and filtering controls to the inventory traps tab.
 */
const addTrapSorting = async () => {
  const header = document.querySelector('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabHeader-container');
  if (!header) {
    return;
  }

  // Load all data up front (before touching the DOM) so that two concurrent
  // navigations can't both pass the "remove existing row" check and then each
  // append a row (which produced the duplicated controls).
  const titles = await getData('titles');
  if (!specialEffectItems) {
    specialEffectItems = await getData('trap-special-effects');
  }

  // Unlike the location-scoped trap-selector-special-effects module, the inventory
  // filter counts an item as special if it has an effect anywhere in the game.
  const specialTypes = new Set(Object.values(specialEffectItems || {}).flat());

  // Remove any existing controls (this also drops their click listeners).
  document.querySelectorAll('.mh-inventory-controls').forEach((el) => el.remove());

  let itemClass = getCurrentSubtab();
  if ('traps' === itemClass) {
    itemClass = 'base';
  }

  const listingSelector = `.inventoryPage-tagContent-listing .inventoryPage-item.${itemClass}`;

  const getEntries = () =>
    [...document.querySelectorAll(listingSelector)].map((el) => {
      const type = el.getAttribute('data-item-type');
      return { el, type, item: items.find((i) => i.type === type) };
    });

  // --- Filters ---
  const filters = { le: 'all', effects: 'all' };
  const sortState = { type: null, order: null };
  let filterCountEl = null;

  const applyFilters = () => {
    const entries = getEntries();
    let shown = 0;

    entries.forEach(({ el, type, item }) => {
      const leOk = filters.le === 'all' || (filters.le === 'le' ? Boolean(item?.is_limited_edition) : !item?.is_limited_edition);
      const effectsOk = filters.effects === 'all' || (filters.effects === 'special' ? specialTypes.has(type) : !specialTypes.has(type));
      const visible = leOk && effectsOk;

      shown += visible ? 1 : 0;
      el.classList.toggle('mh-inventory-item-hidden', !visible);
    });

    if (filterCountEl) {
      const isFiltered = 'all' !== filters.le || 'all' !== filters.effects;
      filterCountEl.textContent = isFiltered ? `Showing ${shown} of ${entries.length}` : '';
    }
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
      if (!value || Number.isNaN(value)) {
        const text = entry.item?.has_stats?.[`${sortType}_formatted`] || '0';
        value = Number.parseFloat(text.replace('%', '')) || 0;
      }
      return value || 0;
    };

    return statValue(a) - statValue(b);
  };

  // Captured before the first sort so the Clear button can restore the game's own ordering.
  let originalOrder = null;

  const doSort = (sortType, order) => {
    const entries = getEntries();
    if (!entries.length) {
      return;
    }

    if (!originalOrder) {
      originalOrder = entries.map(({ el }) => ({ el, parent: el.parentElement }));
    }

    const container = entries[0].el.parentElement;
    if (!container) {
      return;
    }

    entries.sort((a, b) => {
      const result = compare(a, b, sortType);
      return order === 'asc' ? result : -result;
    });

    entries.forEach(({ el }) => container.append(el));
  };

  // --- Build the controls ---
  // Reuses the game's own subtab filter pill styling (the Owned/All pills on the charms
  // tab) so the controls match the native UI in both light and dark mode.
  const controls = makeElement('div', 'mh-inventory-controls');

  // Show the Reset link only when a sort or filter is active.
  const updateActiveState = () => {
    const hasActive = null !== sortState.type || 'all' !== filters.le || 'all' !== filters.effects;
    controls.classList.toggle('mh-inventory-has-active', hasActive);
  };

  const sortRow = makeElement('div', 'mh-inventory-controls-row');
  controls.append(sortRow);

  const sortLabel = makeElement('div', 'mousehuntHud-page-subTabHeader-prefix', 'Sort:');
  sortRow.append(sortLabel);

  const sortOptions = makeElement('div', ['mousehuntHud-page-subTabContent-prefix-filter-options', 'mh-inventory-sort-options']);
  sortRow.append(sortOptions);

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

  const sortChips = [];
  sortTypes.forEach((sortDef) => {
    const chip = makeFilterOption(sortDef.name, `Sort by ${sortDef.name}`);
    sortOptions.append(chip);
    sortChips.push(chip);

    chip.addEventListener('click', (event) => {
      event.preventDefault();

      // Clicking the active sort flips the direction.
      const isActive = chip.classList.contains('active');
      const order = isActive && chip.getAttribute('data-sort-order') === 'desc' ? 'asc' : 'desc';

      sortState.type = sortDef.type;
      sortState.order = order;

      sortChips.forEach((other) => {
        other.classList.toggle('active', other === chip);
        if (other !== chip) {
          other.removeAttribute('data-sort-order');
          other.setAttribute('title', `Sort by ${other.textContent}`);
        }
      });
      chip.setAttribute('data-sort-order', order);
      chip.setAttribute('title', `Sorted by ${sortDef.name}, ${'desc' === order ? 'highest' : 'lowest'} first — click to reverse`);

      doSort(sortDef.type, order);
      updateActiveState();
    });
  });

  const filterRow = makeElement('div', 'mh-inventory-controls-row');
  controls.append(filterRow);

  const filterLabel = makeElement('div', 'mousehuntHud-page-subTabHeader-prefix', 'Filter:');
  filterRow.append(filterLabel);

  const filterGroups = [
    {
      key: 'le',
      chips: [
        { value: 'all', name: 'All', title: 'Show both Limited Edition and regular items' },
        { value: 'le', name: 'LE', title: 'Show only Limited Edition items' },
        { value: 'non-le', name: 'Non-LE', title: 'Hide Limited Edition items' },
      ],
    },
    {
      key: 'effects',
      chips: [
        { value: 'all', name: 'All', title: 'Show items with and without special effects' },
        { value: 'special', name: 'Special', title: 'Show only items with special effects' },
        { value: 'normal', name: 'Normal', title: 'Show only items without special effects' },
      ],
    },
  ];

  const resetFilterChips = [];
  filterGroups.forEach((group) => {
    const segment = makeElement('div', 'mousehuntHud-page-subTabContent-prefix-filter-options');
    filterRow.append(segment);

    group.chips.forEach((chipDef) => {
      const chip = makeFilterOption(chipDef.name, chipDef.title);
      segment.append(chip);
      chip.classList.toggle('active', filters[group.key] === chipDef.value);

      if ('all' === chipDef.value) {
        resetFilterChips.push(chip);
      }

      chip.addEventListener('click', (event) => {
        event.preventDefault();

        filters[group.key] = chipDef.value;

        segment.querySelectorAll('.mh-inventory-option').forEach((other) => {
          other.classList.toggle('active', other === chip);
        });

        applyFilters();
        updateActiveState();
      });
    });
  });

  filterCountEl = makeElement('span', 'mh-inventory-filter-count');
  filterRow.append(filterCountEl);

  const resetLink = makeElement('a', 'mh-inventory-reset', 'Reset');
  filterRow.append(resetLink);
  resetLink.setAttribute('href', '#');
  resetLink.setAttribute('title', 'Clear sorting and filters');

  resetLink.addEventListener('click', (event) => {
    event.preventDefault();

    filters.le = 'all';
    filters.effects = 'all';
    sortState.type = null;
    sortState.order = null;

    sortChips.forEach((chip) => {
      chip.classList.remove('active');
      chip.removeAttribute('data-sort-order');
      chip.setAttribute('title', `Sort by ${chip.textContent}`);
    });

    resetFilterChips.forEach((allChip) => {
      allChip.parentElement.querySelectorAll('.mh-inventory-option').forEach((chip) => {
        chip.classList.toggle('active', chip === allChip);
      });
    });

    if (originalOrder) {
      originalOrder.forEach(({ el, parent }) => parent?.append(el));
      originalOrder = null;
    }

    applyFilters();
    updateActiveState();
  });

  header.append(controls);
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

  onNavigation(
    () => {
      setTimeout(() => {
        addOnboardingTip({
          step: 'better-inventory-crafting-shift-click',
          anchor: '.inventoryPage-item[data-item-classification="crafting_item"]',
          title: 'Take a closer look',
          content: 'Shift-click a crafting item to open its item page instead of adding it to the crafting table.',
          dismissOnAnchorClick: false,
        });
      }, 250);
    },
    {
      page: 'inventory',
      tab: 'crafting',
      anySubtab: true,
    }
  );

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
  addStyles(
    [
      styles,
      getSetting('better-inventory.one-item-per-row', true) ? fullWidthStyles : doubleWidthStyles,
      getSetting('better-inventory.larger-images', true) ? largerImagesStyles : '',
      getSetting('better-inventory.show-all-group', false) ? tinyGroupStyles : '',
    ],
    'better-inventory'
  );

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
