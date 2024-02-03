import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

const getQuantityInput = () => {
  const quantity = document.querySelector('.itemView-action-convert-quantity');
  if (! quantity) {
    return false;
  }

  return quantity;
};

const replaceOpenAction = () => {
  const _original = app.pages.InventoryPage.useConvertible;
  app.pages.InventoryPage.useConvertible = (element) => {
    if (element.getAttribute('data-item-action') === 'all-but-one') {
      const itemType = element.getAttribute('data-item-type');

      hg.views.ItemView.show(itemType);

      // wait for the item view to load
      const interval = setInterval(() => {
        const quantityEl = document.querySelector('.itemView-action-convertForm');
        const maxQuantity = quantityEl ? Number.parseInt(quantityEl.innerText.split('/')[1].trim(), 10) : 0;
        const quantity = maxQuantity - 1;

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

  convertibleItems.forEach((item) => {
    const button = item.querySelector('.inventoryPage-item-button[data-item-action="all"]');
    if (! button) {
      return;
    }

    const newButton = button.cloneNode(true);
    newButton.classList.add('open-all-but-one');
    newButton.textContent = 'All but One';
    newButton.value = 'All but One';
    newButton.setAttribute('data-item-action', 'all-but-one');

    button.parentNode.insertBefore(newButton, button.nextSibling);
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

export default {
  id: 'open-all-but-one',
  name: 'Inventory - Open All but One Buttons',
  type: 'feature',
  default: true,
  description: 'Adds \'Open All But One\' buttons to convertible items in your inventory.',
  load: init,
};
