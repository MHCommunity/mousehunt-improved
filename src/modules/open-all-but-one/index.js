import { addUIStyles, onNavigation } from '@/utils';

import styles from './styles.css';

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
    newButton.setAttribute('data-item-action', 'single');
    newButton.onclick = null;
    newButton.addEventListener('click', (e) => {
      const quantity = item.querySelector('.inventoryPage-item-imageContainer .quantity');
      if (! quantity) {
        return;
      }

      quantity.textContent = Number.parseInt(quantity.textContent, 10) - 1;
      app.pages.InventoryPage.useConvertible(e.target);
    });

    button.parentNode.insertBefore(newButton, button.nextSibling);
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addUIStyles(styles);

  addOpenAllButOneButton();

  onNavigation(() => {
    addOpenAllButOneButton();
  }, {
    page: 'inventory',
  });
};
