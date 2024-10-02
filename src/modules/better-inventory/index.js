import {
  addStyles,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
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

const resortInventory = () => {
  const lists = document.querySelectorAll('.mousehuntHud-page-tabContent.active .inventoryPage-tagContent-listing');

  lists.forEach((list) => {
    const items = list.querySelectorAll('.inventoryPage-item');
    sortedItems = sortInventoryItemsByName(items);

    sortedItems.forEach((item) => {
      // While we're here, update the name so its not truncated.
      const name = item.getAttribute('data-name');
      const nameEl = item.querySelector('.inventoryPage-item-content-name span');
      if (name && nameEl) {
        nameEl.innerText = name;
      }

      list.append(item);
    });
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

/**
 * Main function.
 */
const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

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
