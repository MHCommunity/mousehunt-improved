import { getSetting, onNavigation, waitForElement } from '@utils';

/**
 * Replace the convertible open action.
 *
 * @param {HTMLElement} element   The element.
 * @param {boolean}     allButOne If all but one should be opened.
 */
const useConvertible = async (element, allButOne = false) => {
  if ((element.getAttribute('data-item-action') !== 'all-but-one') && (element.getAttribute('data-item-action') !== 'all')) {
    return;
  }
  const itemType = element.getAttribute('data-item-type');

  hg.views.ItemView.show(itemType);

  // wait for the item view to load
  const quantityEl = await waitForElement('.itemView-action-convertForm');
  let maxQuantity = 1;
  if (quantityEl && quantityEl.innerText.includes('/')) {
    maxQuantity = Number.parseInt(quantityEl.innerText.split('/')[1].trim(), 10);
  }

  let quantity = maxQuantity > 200 ? 200 : maxQuantity;

  if (allButOne) {
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
const addOpenAllButOneButton = () => {
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

    if (openAllButOneSetting && quantity.textContent !== '1' && ! item.querySelector('.inventoryPage-item-button[data-item-action="all-but-one"]')) {
      const newButton = button.cloneNode(true);
      newButton.classList.add('open-all-but-one');
      newButton.textContent = 'All But One';
      newButton.value = 'All But One';
      newButton.setAttribute('data-item-action', 'all-but-one');

      newButton.addEventListener('click', (event) => {
        useConvertible(event.target, true);
      });

      button.after(newButton);
    }

    if (openAllSetting && ! item.querySelector('.inventoryPage-item-button[data-item-action="all"]')) {
      const newAllButton = button.cloneNode(true);
      newAllButton.classList.add('open-all');
      newAllButton.textContent = 'All';
      newAllButton.value = 'All';
      newAllButton.setAttribute('data-item-action', 'all');

      newAllButton.addEventListener('click', (event) => {
        useConvertible(event.target);
      });

      button.after(newAllButton);
    }
  });
};

let hasInitialized = false;
let openAllButOneSetting = true;
let openAllSetting = true;

/**
 * Initialize the module.
 */
const initOpenButtons = () => {
  openAllButOneSetting = getSetting('open-all-but-one', true);
  openAllSetting = getSetting('open-all', true);

  if (! (openAllButOneSetting || openAllSetting)) {
    return;
  }

  if (hasInitialized) {
    return;
  }

  hasInitialized = true;

  onNavigation(addOpenAllButOneButton, {
    page: 'inventory',
    tab: 'special',
    anySubTab: true,
  });
};

export {
  initOpenButtons
};
