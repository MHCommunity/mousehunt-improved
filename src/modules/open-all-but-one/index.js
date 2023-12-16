import { addStyles, onNavigation } from '@utils';

import styles from './styles.css';

const getQuantityInput = () => {
  const quantity = document.querySelector('.itemView-action-convert-quantity');
  if (! quantity) {
    return false;
  }

  return quantity;
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
    newButton.setAttribute('onclick', 'return false;');

    const itemType = item.getAttribute('data-item-type');

    const maxQuantityEl = item.querySelector(`.inventoryPage-item[data-item-type="${itemType}"] .inventoryPage-item-imageContainer .quantity`);
    const maxQuantity = maxQuantityEl ? Number.parseInt(maxQuantityEl.textContent, 10) : 0;

    newButton.addEventListener('click', (e) => {
      e.preventDefault();

      hg.views.ItemView.show(itemType);

      const interval = setInterval(() => {
        quantityInput = getQuantityInput();
        if (quantityInput) {
          clearInterval(interval);
          quantityInput.value = maxQuantity - 1;

          const useButton = document.querySelector('.itemView-action-convert-actionButton');
          if (useButton) {
            useButton.click();
          }
        }
      }, 100);
    });

    button.parentNode.insertBefore(newButton, button.nextSibling);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  addOpenAllButOneButton();

  onNavigation(() => {
    addOpenAllButOneButton();
  }, {
    page: 'inventory',
  });
};

export default {
  id: 'open-all-but-one',
  name: 'Inventory - Open all But One buttons',
  type: 'feature',
  default: true,
  description: 'Adds \'Open All But One\' buttons to convertible items in your inventory.',
  load: init,
};
