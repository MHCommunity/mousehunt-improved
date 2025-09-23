import { addStyles, getSetting, onNavigation, waitForElement } from '@utils';

import settings from './settings';

import onlyOpenMultipleStyles from './styles/only-open-multiple.css';

/**
 * Replace the convertible open action.
 *
 * @param {HTMLElement} element The element.
 * @param {string}      type    The type of action (one, all-but-one, all).
 */
const useConvertible = async (element, type) => {
  const typeOptions = new Set(['one', 'all-but-one', 'all']);
  if (! typeOptions.has(element.getAttribute('data-item-action')) || ! typeOptions.has(type)) {
    return;
  }

  const itemType = element.getAttribute('data-item-type');

  hg.views.ItemView.show(itemType);

  // wait for the item view to load
  const quantityEl = await waitForElement('.itemView-action-convertForm');
  let maxQuantity = 1;
  if (quantityEl && quantityEl.innerText.includes('/')) {
    maxQuantity = Number.parseInt(quantityEl.innerText.split('/')[1].replaceAll(',', '').trim(), 10);
  }

  let quantity = 1;

  if ('all' === type || 'all-but-one' === type) {
    quantity = maxQuantity > 200 ? 200 : maxQuantity;
  }

  if ('all-but-one' === type) {
    quantity = maxQuantity - 1;
  }

  const quantityInput = document.querySelector('.itemView-action-convert-quantity');
  if (quantityInput) {
    quantityInput.value = quantity;

    const useButton = document.querySelector('.itemView-action-convert-actionButton');
    if (useButton) {
      useButton.click();
    }
  }
};

/**
 * Add the 'Open All but One' buttons to convertible items.
 */
const addOpenButtons = () => {
  const convertibles = document.querySelectorAll('.inventoryPage-tagContent-tagGroup[data-tag="convertibles"] .inventoryPage-item.convertible[data-item-classification="convertible"]');
  const chests = document.querySelectorAll('.inventoryPage-tagContent-tagGroup[data-tag="treasure_chests"] .inventoryPage-item.convertible[data-item-classification="convertible"]');

  const allItems = [...convertibles, ...chests];

  allItems.forEach((item) => {
    if (! item) {
      return;
    }

    const button = item.querySelector('.inventoryPage-item-button[data-item-action="single"]');
    if (! button) {
      return;
    }

    const itemType = item.getAttribute('data-item-type');
    if (! itemType) {
      return;
    }

    const quantity = item.querySelector('.quantity');
    if (! quantity) {
      return;
    }

    const makeNewButton = (text) => {
      const action = text.toLowerCase().replaceAll(' ', '-');

      const itemsToSkip = new Set([
        'kilohertz_processor_convertible',
        'dragon_skull_convertible',
        'cursed_skull_convertible',
      ]);

      // Dont add the all or all but one buttons to specific items.
      if (
        ('all-but-one' === action || 'all' === action) &&
        itemsToSkip.has(itemType)
      ) {
        return;
      }

      if (item.querySelector(`.inventoryPage-item-button[data-item-action="${action}"]`)) {
        return;
      }

      const newButton = button.cloneNode(true);

      newButton.classList.add(`open-${action}`);
      newButton.textContent = `Open ${text}`;
      newButton.value = text;
      newButton.setAttribute('data-item-action', action);

      newButton.addEventListener('click', (event) => {
        useConvertible(event.target, action);
      });

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
 * Initialize the module.
 */
const init = () => {
  if (getSetting('inventory-buttons.only-open-extras', false)) {
    addStyles(onlyOpenMultipleStyles, 'only-open-multiple');
  }

  if (
    getSetting('inventory-buttons.open-one', true) ||
    getSetting('inventory-buttons.open-all-but-one', false) ||
    getSetting('inventory-buttons.open-all', true)
  ) {
    onNavigation(addOpenButtons, {
      page: 'inventory',
      tab: 'special',
      anySubTab: true,
    });
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'inventory-buttons',
  name: 'Inventory - Open Buttons',
  type: 'feature',
  default: true,
  description: 'Adds "One", "All But One", and "All" buttons to convertible items in your inventory.',
  load: init,
  settings,
};
