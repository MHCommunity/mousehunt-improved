import { getSetting, saveSetting, waitForElement } from '@utils';

const setToggleInventory = (setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass) => {
  const isSetOpen = getSetting(setting, false);
  if (isSetOpen) {
    inventory.classList.add(inventoryOpenClass);
    toggleButton.classList.add(buttonOpenClass);
  } else {
    inventory.classList.remove(inventoryOpenClass);
    toggleButton.classList.remove(buttonOpenClass);
  }
  return isSetOpen;
};

const createToggleInventory = (setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass) => {
  // maybe toggle it once to set the initial state
  let isSetOpen = getSetting(setting, false);
  if (isSetOpen) {
    setToggleInventory(setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass);
  }

  return (e) => {
    e.preventDefault();
    e.stopPropagation();

    isSetOpen = getSetting(setting, false);
    saveSetting(setting, ! isSetOpen);
    setToggleInventory(setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass);
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
const keepInventoryToggled = async (opts) => {
  const {
    setting,
    buttonSelector,
    inventorySelector,
    inventoryOpenClass,
    buttonOpenClass,
  } = opts;

  await waitForElement(buttonSelector);

  const toggleButton = document.querySelector(buttonSelector);
  if (! toggleButton) {
    return;
  }

  const inventory = document.querySelector(inventorySelector);
  if (! inventory) {
    return;
  }

  const isSetOpen = setToggleInventory(setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass);
  if (isSetOpen) {
    toggleButton.click();
  }

  if (toggleInventory) {
    toggleButton.removeEventListener('click', toggleInventory);
  }

  toggleButton.addEventListener('click', () => createToggleInventory(setting, inventory, inventoryOpenClass, toggleButton, buttonOpenClass));
};

export default keepInventoryToggled;
