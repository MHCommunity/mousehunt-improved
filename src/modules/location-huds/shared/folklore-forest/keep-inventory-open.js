import { getSetting, saveSetting } from '@utils';

const createToggleInventory = (setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass) => {
  return (e) => {
    e.preventDefault();

    let isSetOpen = getSetting(setting, false);

    if (isSetOpen) {
      isSetOpen = false;
      inventory.classList.remove(inventoryOpenClass);
      toggleButton.classList.remove(buttonOpenClass);
    } else {
      isSetOpen = true;
      inventory.classList.add(inventoryOpenClass);
      toggleButton.classList.add(buttonOpenClass);
    }

    saveSetting(setting, isSetOpen);
  };
};

let toggleInventory;

/**
 * Keep the inventory open or closed based on a setting.
 *
 * @param {Object} opts                    Options for the function.
 * @param {string} opts.setting            The setting key to use.
 * @param {string} opts.buttonSelector     The button selector.
 * @param {string} opts.inventorySelector  The inventory selector.
 * @param {string} opts.inventoryOpenClass The class to add to the inventory when open.
 * @param {string} opts.buttonOpenClass    The class to add to the button when open.
 */
const keepInventoryToggled = (opts) => {
  const {
    setting,
    buttonSelector,
    inventorySelector,
    inventoryOpenClass,
    buttonOpenClass,
  } = opts;

  const toggleButton = document.querySelector(buttonSelector);
  if (! toggleButton) {
    return;
  }

  const inventory = document.querySelector(inventorySelector);
  if (! inventory) {
    return;
  }

  if (toggleInventory) {
    toggleButton.removeEventListener('click', toggleInventory);
  }

  toggleInventory = createToggleInventory(setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass);
  toggleButton.addEventListener('click', toggleInventory);
};

export default keepInventoryToggled;
