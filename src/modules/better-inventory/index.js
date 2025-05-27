import {
  addStyles,
  createPopup,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  getData,
  getSetting,
  makeElement,
  onEvent,
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

    setTimeout(() => {
      setOpenQuantityOnClick(attempts + 1);
    }, 200);
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
 * Add the open all button to the convertible items.
 */
const addOpenAllToConvertible = () => {
  const form = document.querySelector('.convertible .itemView-action-convertForm');
  if (! form) {
    return;
  }

  if (form.getAttribute('data-open-all-added')) {
    return;
  }

  form.setAttribute('data-open-all-added', true);

  // get the innerHTML and split it on the input tag. then wrap the second match in a span so we can target it
  const formHTML = form.innerHTML;
  const formHTMLArray = formHTML.split(' /');
  // if we don't have a second match, just return
  if (! formHTMLArray[1]) {
    return;
  }

  const formHTMLArray2 = formHTMLArray[1].split('<a');
  if (! formHTMLArray2[1]) {
    return;
  }

  const quantity = formHTMLArray2[0].trim();

  const newFormHTML = `${formHTMLArray[0]}/ <span class="open-all">${quantity}</span><a${formHTMLArray2[1]}`;
  form.innerHTML = newFormHTML;

  const openAll = document.querySelector('.open-all');
  openAll.addEventListener('click', () => {
    const input = form.querySelector('.itemView-action-convert-quantity');
    if (! input) {
      return;
    }

    input.value = Number.parseInt(input.value, 10) > 200 ? 200 : Number.parseInt(input.value, 10);
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

const addSkinPreview = (item) => {
  const type = item.getAttribute('data-item-type');
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
      return _InventoryPageuseItem(element);
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
      return _InventoryPageuseItem(target);
    }

    const container = target.closest('.mousehuntHud-page-subTabContent');
    if (! container) {
      return _InventoryPageuseItem(target);
    }

    if (container.classList.contains('hammer')) {
      return this.showConfirmPopup(target, 'hammer');
    }

    if ('recipe' === itemClassification) {
      const element = document.elementFromPoint(window.event.clientX, window.event.clientY);
      const closest = element.closest('[data-item-type]');
      if (closest) {
        hg.views.ItemView.show(closest.getAttribute('data-item-type'));
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

let clickHandlers = [];
const addTrapSorting = async () => {
  // Remove any existing sort rows to prevent duplicates.
  const existing = document.querySelectorAll('.mh-inventory-sort-row');
  if (existing.length) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  // Remove any existing click handlers to prevent memory leaks.
  clickHandlers.forEach((handler) => {
    if (handler && handler.remove) {
      handler.remove();
    } else if (handler && handler.removeEventListener) {
      document.removeEventListener('click', handler);
    }
  });
  clickHandlers = [];

  const header = document.querySelector('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabHeader-container');
  if (! header) {
    return;
  }

  const titles = await getData('titles');

  const sortTypes = [
    { name: 'Name', type: 'name' },
    { name: 'Title', type: 'min_title' },
    { name: 'Power', type: 'power' },
    { name: 'Power Bonus', type: 'power_bonus' },
    { name: 'Luck', type: 'luck' },
    { name: 'Attraction Bonus', type: 'attraction_bonus' },
    { name: 'Cheese Effect', type: 'cheese_effect' },
  ];

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

  const sortRow = makeElement('div', 'mh-inventory-sort-row');
  for (const type of sortTypes) {
    // Only weapons have a power type.
    if ('weapon' !== getCurrentSubtab() && 'power_type' === type.type) {
      continue;
    }

    const sortButton = makeElement('button', ['mh-inventory-sort-button', 'mousehuntActionButton', 'tiny', type.type]);
    makeElement('span', 'mh-inventory-sort-button-text', type.name, sortButton);
    sortButton.setAttribute('data-sort-type', type.type);
    sortButton.setAttribute('data-sort-order', 'desc');

    const handler = sortButton.addEventListener('click', (e) => {
      const currentOrder = sortButton.getAttribute('data-sort-order');
      const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
      sortButton.setAttribute('data-sort-order', newOrder);

      e.preventDefault();

      let currentType = getCurrentSubtab();
      if ('traps' === currentType) {
        currentType = 'base';
      }

      const elsToSort = document.querySelectorAll(`.inventoryPage-tagContent-listing .inventoryPage-item.${currentType}`);
      if (! elsToSort.length) {
        return;
      }

      const container = elsToSort[0].parentElement;
      if (! container) {
        return;
      }

      // Use the global items variable
      const itemsToSort = [];
      elsToSort.forEach((el) => {
        const itemType = el.getAttribute('data-item-type');
        if (itemType) {
          const theItem = items.find((i) => i.type === itemType);
          if (theItem) {
            itemsToSort.push(theItem);
          }
        }
      });

      const sortType = sortButton.getAttribute('data-sort-type');

      const sortedItems = [...itemsToSort].sort((a, b) => {
        let result = 0;

        if (sortType === 'name') {
          result = (a?.name || '').localeCompare(b?.name || '');
        } else if (sortType === 'min_title') {
          const aTitle = titles.find((t) => t.id === a?.has_stats?.min_title)?.order || 0;
          const bTitle = titles.find((t) => t.id === b?.has_stats?.min_title)?.order || 0;

          result = aTitle - bTitle;
        } else if (sortType === 'power_type') {
          result = (a?.power_type || '').localeCompare(b?.power_type || '');
        } else if (sortType === 'cheese_effect') {
          const aEffect = cheeseEffectValues[a?.has_stats?.cheese_effect] || 0;
          const bEffect = cheeseEffectValues[b?.has_stats?.cheese_effect] || 0;

          result = aEffect - bEffect;
        } else {
          let aValue = Number.parseFloat(a?.has_stats?.[sortType] || 0);
          let bValue = Number.parseFloat(b?.has_stats?.[sortType] || 0);

          if (! aValue || Number.isNaN(aValue)) {
            aValue = Number.parseFloat(a?.has_stats?.[`${sortType}_formatted`].replace('%', '')) || 0;
          }

          if (! bValue || Number.isNaN(bValue)) {
            bValue = Number.parseFloat(b?.has_stats?.[`${sortType}_formatted`].replace('%', '')) || 0;
          }

          aValue = aValue || 0;
          bValue = bValue || 0;

          result = aValue - bValue;
        }

        return newOrder === 'asc' ? result : -result;
      });

      clickHandlers.push(handler);

      // Move the sorted items in the DOM
      sortedItems.forEach((item) => {
        const itemType = item.type;
        const itemEl = container.querySelector(`.inventoryPage-item[data-item-type="${itemType}"]`);
        if (itemEl) {
          container.append(itemEl);
        }
      });
    });

    sortRow.append(sortButton);
  }

  header.append(sortRow);
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

  const go = () => {
    addOpenAllToConvertible();
    updateCollectibles();
    addArmButtonToCharms();
    replaceInventoryView();
  };

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

  onEvent('js_dialog_show', addOpenAllToConvertible);

  recipes();
};

/**
 * Initialize the module.
 */
const init = async () => {
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
  type: 'better',
  default: true,
  description: 'Update the inventory layout and styling.',
  load: init,
  settings,
};
