import { getSetting, saveSetting } from '@utils';

const keepInventoryToggled = async (opts) => {
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

  let isSetOpen = getSetting(setting, 'not-set');
  if (isSetOpen) {
    inventory.classList.add(inventoryOpenClass);
    toggleButton.classList.add(buttonOpenClass);
  } else if (isSetOpen === 'not-set') {
    isSetOpen = false;
  }

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Longer than a simple ternary and a toggle to make it more readable.
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
  });
};

export default keepInventoryToggled;
