import {
  addOnboardingTip,
  addStyles,
  createPopup,
  doEvent,
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

import favorites from './modules/favorites';
import recipes from './modules/recipes';
import sorting, { reapplySorting } from './modules/sorting';
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
 * Enhanced Search appends its search terms to `data-name`, because that's what the
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

  // Put back any sort the user picked, which the alphabetical pass just undid.
  if (getSetting('better-inventory.add-trap-sorting', false)) {
    reapplySorting(0);
  }

  // The same goes for favorites going first.
  doEvent('mh-improved-inventory-resorted');
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
    sorting();
  }

  if (getSetting('better-inventory.favorites', false)) {
    favorites();
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
  description: 'Update the inventory layout and styling.',
  type: 'inventory-shops',
  default: true,
  load: init,
  settings,
};
