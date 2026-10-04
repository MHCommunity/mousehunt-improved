import { addStyles, getSetting, onNavigation, parseNumber } from '@utils';

import settings from './settings';

import onlyOpenMultipleStyles from './styles/only-open-multiple.css';

let isOpening = false;

/**
 * Open a convertible directly, without going through the item view.
 *
 * Using the item view's convert form shows the results on top of the item
 * view and queues it to reload when the results are closed, so the item view
 * would pop back up afterwards.
 *
 * @param {HTMLElement} element The element.
 * @param {string}      type    The type of action (one, all-but-one, all).
 */
const useConvertible = (element, type) => {
  const typeOptions = new Set(['one', 'all-but-one', 'all']);
  if (isOpening || !typeOptions.has(type)) {
    return;
  }

  const item = element.closest('.inventoryPage-item');
  const itemType = item?.getAttribute('data-item-type');
  if (!itemType) {
    return;
  }

  const quantityEl = item.querySelector('.quantity');
  const maxQuantity = quantityEl ? parseNumber(quantityEl.textContent) : 1;

  // The game only lets you open 200 at a time.
  let quantity = 1;
  if ('all' === type) {
    quantity = Math.min(maxQuantity, 200);
  } else if ('all-but-one' === type) {
    quantity = Math.min(maxQuantity - 1, 200);
  }

  if (quantity < 1) {
    return;
  }

  isOpening = true;
  element.classList.add('disabled');

  const done = () => {
    isOpening = false;
    element.classList.remove('disabled');
  };

  hg.utils.UserInventory.useConvertible(
    itemType,
    quantity,
    (data) => {
      done();

      if (data?.convertible_open) {
        new hg.views.ConvertibleOpenView(data.convertible_open).show();
      }

      const newQuantity = data?.inventory?.[itemType]?.quantity;
      if (quantityEl && newQuantity !== undefined) {
        quantityEl.textContent = Number(newQuantity).toLocaleString();
      }
    },
    done
  );
};

/**
 * Add the 'Open All but One' buttons to convertible items.
 */
const addOpenButtons = () => {
  const convertibles = document.querySelectorAll(
    '.inventoryPage-tagContent-tagGroup[data-tag="convertibles"] .inventoryPage-item.convertible[data-item-classification="convertible"]'
  );
  const chests = document.querySelectorAll(
    '.inventoryPage-tagContent-tagGroup[data-tag="treasure_chests"] .inventoryPage-item.convertible[data-item-classification="convertible"]'
  );

  const allItems = [...convertibles, ...chests];

  allItems.forEach((item) => {
    if (!item) {
      return;
    }

    const button = item.querySelector('.inventoryPage-item-button[data-item-action="single"]');
    if (!button) {
      return;
    }

    const itemType = item.getAttribute('data-item-type');
    if (!itemType) {
      return;
    }

    const quantity = item.querySelector('.quantity');
    if (!quantity) {
      return;
    }

    const makeNewButton = (text) => {
      const action = text.toLowerCase().replaceAll(' ', '-');

      const itemsToSkip = new Set(['kilohertz_processor_convertible', 'dragon_skull_convertible', 'cursed_skull_convertible']);

      // Dont add the all or all but one buttons to specific items.
      if (('all-but-one' === action || 'all' === action) && itemsToSkip.has(itemType)) {
        return;
      }

      if (item.querySelector(`.inventoryPage-item-button[data-item-action="${action}"]`)) {
        return;
      }

      const newButton = button.cloneNode(true);

      newButton.classList.add('mh-improved-open-button', `open-${action}`);
      newButton.textContent = `Open ${text}`;
      newButton.value = text;
      newButton.setAttribute('data-item-action', action);
      newButton.removeAttribute('onclick');

      button.after(newButton);
    };

    if (getSetting('inventory-buttons.open-one', true)) {
      makeNewButton('One');
    }

    if (getSetting('inventory-buttons.open-all-but-one', false) && quantity.textContent !== '1') {
      makeNewButton('All But One');
    }

    if (getSetting('inventory-buttons.open-all', true)) {
      makeNewButton('All');
    }
  });
};

/**
 * Listen for clicks on our buttons.
 *
 * The listener is delegated rather than bound to each button because the game's
 * inventory search clones matching items into the search results group without
 * their event listeners, which would leave the cloned buttons doing nothing.
 */
const addClickListener = () => {
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('.mh-improved-open-button');
    if (!button) {
      return;
    }

    event.preventDefault();
    useConvertible(button, button.getAttribute('data-item-action'));
  });
};

/**
 * Initialize the module.
 */
const init = () => {
  if (getSetting('inventory-buttons.only-open-extras', false)) {
    addStyles(onlyOpenMultipleStyles, 'inventory-buttons');
  }

  if (getSetting('inventory-buttons.open-one', true) || getSetting('inventory-buttons.open-all-but-one', false) || getSetting('inventory-buttons.open-all', true)) {
    addClickListener();

    onNavigation(addOpenButtons, {
      page: 'inventory',
      tab: 'special',
      anySubtab: true,
    });
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'inventory-buttons',
  name: 'Convertible opening buttons',
  type: 'inventory-shops',
  default: true,
  description: 'Add "Open One", "Open All But One", and "Open All" buttons to convertibles in your inventory.',
  load: init,
  settings,
};
