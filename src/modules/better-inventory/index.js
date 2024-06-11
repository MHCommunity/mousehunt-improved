import {
  addStyles,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  getSetting,
  makeElement,
  makeMhButton,
  onEvent,
  onNavigation,
  onOverlayChange,
  onRequest,
  saveSetting
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

const resortInventoryAddAllGroup = () => {
  const tagContent = document.querySelector('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabContent.active .inventoryPage-tagContent');
  if (! tagContent) {
    return;
  }

  const searchGroup = tagContent.querySelector('.inventoryPage-tagContent-tagGroup.search');
  if (! searchGroup) {
    return;
  }

  const existingAllGroup = tagContent.querySelector('.inventoryPage-tagContent-tagGroup.all-group');
  if (existingAllGroup) {
    existingAllGroup.remove();
  }

  const allGroup = makeElement('div', ['inventoryPage-tagContent-tagGroup', 'all-group']);

  const title = makeElement('div', 'inventoryPage-tagContent-tagTitle', 'All');

  const listing = makeElement('div', 'inventoryPage-tagContent-listing');

  let isToggled = getSetting('better-inventory.show-all-group-is-toggled', false);
  title.addEventListener('click', () => {
    listing.classList.toggle('hidden');
    allGroup.classList.toggle('toggled');

    isToggled = ! isToggled;
    saveSetting('better-inventory.show-all-group-is-toggled', isToggled);
  });

  if (isToggled) {
    listing.classList.add('hidden');
    allGroup.classList.add('toggled');
  }

  allGroup.append(title);

  // Append to tagContent as the second child if searchGroup is the first child
  if (searchGroup === tagContent.firstChild) {
    tagContent.insertBefore(allGroup, searchGroup.nextSibling);
  } else {
    searchGroup.before(allGroup);
  }

  const items = document.querySelectorAll('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabContent.active .inventoryPage-tagContent-listing .inventoryPage-item');
  const sortedItems = sortInventoryItemsByName(items);
  for (const item of sortedItems) {
    const newItem = makeElement('div', 'tiny-item');
    newItem.addEventListener('click', () => hg.views.ItemView.show(itemType));

    const classification = item.getAttribute('data-item-classification');
    newItem.setAttribute('data-item-classification', classification);

    const itemType = item.getAttribute('data-item-type');
    newItem.setAttribute('data-item-type', itemType);

    const existingImage = item.querySelector('.inventoryPage-item-imageContainer .itemImage img');
    if (existingImage && existingImage.src) {
      const newImg = makeElement('img', 'tiny-item-image');
      newImg.src = existingImage.src;
      newItem.append(newImg);
    }

    makeElement('div', 'tiny-item-name', item.getAttribute('data-name'), newItem);

    if ('weapon' === classification || 'base' === classification) {
      const hasStats = item.querySelector('.itemViewStatBlock-stat');
      if (hasStats) {
        const statTypes = [
          'powerType',
          'power',
          'powerBonus',
          'luck',
        ];

        const statsWrapper = makeElement('div', 'tiny-item-stats');

        for (const statType of statTypes) {
          const el = item.querySelector(`.itemViewStatBlock-stat.${statType} .itemViewStatBlock-stat-value span`);
          makeElement('div', `tiny-item-${statType}`, el ? el.innerHTML : '', statsWrapper);
        }

        newItem.append(statsWrapper);
      }
    } else {
      const quantityEl = item.querySelector('.inventoryPage-item-imageContainer .itemImage .quantity');
      makeElement('div', 'tiny-item-quantity', quantityEl ? quantityEl.innerText : '', newItem);
    }

    const actionContainer = makeElement('div', 'tiny-item-action');

    const callbacks = {
      // Todo: implement these callbacks.
      bait: { text: 'Use', callback: () => {} },
      weapon: { text: 'Arm', callback: () => {} },
      base: { text: 'Arm', callback: () => {} },
      trinket: { text: 'Arm', callback: () => {} },
      potion: { text: 'Brew', callback: () => {} },
      recipe: { text: 'Craft', callback: () => {} },
      convertible: { text: 'Open', callback: () => {} },
    };

    if (callbacks[classification]) {
      makeMhButton({
        text: callbacks[classification] ? callbacks[classification].text : 'View',
        size: 'tiny',
        className: 'tiny-item-view',
        appendTo: actionContainer,
        callback: () => {
          if (callbacks[classification].callback) {
            callbacks[classification].callback(itemType);
          }
        }
      });
    }

    makeMhButton({
      text: 'View',
      size: 'tiny',
      className: 'tiny-item-view',
      appendTo: actionContainer,
      callback: () => hg.views.ItemView.show(itemType),
    });

    // todo: add open all and all but one buttons and stuff here too,

    newItem.append(actionContainer);

    listing.append(newItem);
  }

  allGroup.append(listing);
};

const runResortInventory = () => {
  const func = getSetting('better-inventory.show-all-group', true) ? resortInventoryAddAllGroup : resortInventory;
  setTimeout(func, 250);
};

const addResortInventory = () => {
  onNavigation(runResortInventory, {
    page: 'inventory',
    anyTab: true,
    anySubtab: true,
  });

  onRequest('pages/page.php', (response, data) => {
    if ('Inventory' === data.page_class) {
      runResortInventory();
    }
  });
};

/**
 * Main function.
 */
const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  addOpenAllToConvertible();
  updateCollectibles();
  addArmButtonToCharms();

  onNavigation(() => {
    addOpenAllToConvertible();
    updateCollectibles();
    addArmButtonToCharms();
  }, {
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
  description: 'Updates the inventory layout and styling.',
  load: init,
  settings,
};
