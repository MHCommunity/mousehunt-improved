import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Get the quantity input element.
 *
 * @return {Element|boolean} The quantity input element or false.
 */
const getQuantityInput = () => {
  const quantity = document.querySelector('.itemView-action-convert-quantity');
  if (! quantity) {
    return false;
  }

  return quantity;
};

/**
 * Replace the convertible open action.
 */
const replaceOpenAction = () => {
  const _original = app.pages.InventoryPage.useConvertible;

  /**
   * Use the convertible item.
   *
   * @param {Element} element The element to use.
   */
  app.pages.InventoryPage.useConvertible = (element) => {
    if (element.getAttribute('data-item-action') === 'all-but-one') {
      const itemType = element.getAttribute('data-item-type');

      hg.views.ItemView.show(itemType);

      // wait for the item view to load
      const interval = setInterval(() => {
        const quantityEl = document.querySelector('.itemView-action-convertForm');
        let maxQuantity = 0;
        if (quantityEl && quantityEl.innerText.includes('/')) {
          maxQuantity = Number.parseInt(quantityEl.innerText.split('/')[1].trim(), 10);
        }

        const quantity = maxQuantity > 200 ? 200 : maxQuantity - 1;

        const quantityInput = getQuantityInput();
        if (quantityInput) {
          clearInterval(interval);
          quantityInput.value = quantity;

          const useButton = document.querySelector('.itemView-action-convert-actionButton');
          if (useButton) {
            useButton.click();
          }
        }
      }, 100);
    } else {
      _original(element);
    }
  };
};

/**
 * Add the 'Open All but One' buttons to convertible items.
 */
const addOpenAllButOneButton = () => {
  const convertibleItems = document.querySelectorAll('.inventoryPage-item.convertible[data-item-classification="convertible"]');
  if (! convertibleItems.length) {
    return;
  }

  // Remove the existing open all but one buttons.
  const existingButtons = document.querySelectorAll('.open-all-but-one');
  existingButtons.forEach((button) => {
    button.remove();
  });

  const existingAllButtons = document.querySelectorAll('.open-all');
  existingAllButtons.forEach((button) => {
    button.remove();
  });

  convertibleItems.forEach((item) => {
    const button = item.querySelector('.inventoryPage-item-button[data-item-action="single"]');
    if (! button) {
      return;
    }

    const itemType = item.getAttribute('data-item-type');
    if (! itemType) {
      return;
    }

    const itemsToSkip = new Set([
      'kilohertz_processor_convertible',
    ]);

    if (itemsToSkip.has(itemType)) {
      return;
    }

    const quantity = item.querySelector('.quantity');
    if (! quantity) {
      return;
    }

    if (quantity.textContent === '1') {
      return;
    }

    const newButton = button.cloneNode(true);
    newButton.classList.add('open-all-but-one');
    newButton.textContent = 'All but One';
    newButton.value = 'All but One';
    newButton.setAttribute('data-item-action', 'all-but-one');

    button.parentNode.insertBefore(newButton, button.nextSibling);

    const newAllButton = button.cloneNode(true);
    newAllButton.classList.add('open-all');
    newAllButton.textContent = 'All';
    newAllButton.value = 'All';
    newAllButton.setAttribute('data-item-action', 'all');

    button.parentNode.insertBefore(newAllButton, button.nextSibling);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'open-all-but-one');

  replaceOpenAction();

  addOpenAllButOneButton();

  onNavigation(() => {
    addOpenAllButOneButton();
  }, {
    page: 'inventory',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'open-all-but-one',
  name: 'Inventory - Open All but One',
  type: 'feature',
  default: true,
  description: 'Adds \'Open All But One\' buttons to convertible items in your inventory.',
  load: init,
};
