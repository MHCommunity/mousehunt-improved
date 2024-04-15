import {
  addHudStyles,
  doRequest,
  getSetting,
  makeElement,
  makeMhButton,
  onRequest,
  onTurn,
  saveSetting
} from '@utils';

import regionStyles from '../shared/folklore-forest/styles.css';
import smallInvStyles from './small-inv.css';
import styles from './styles.css';

const keepInventoryToggled = async () => {
  const toggleButton = document.querySelector('.headsUpDisplayBountifulBeanstalk__inventoryContainer .headsUpDisplayBountifulBeanstalk__inventoryContainerButton');
  if (! toggleButton) {
    return;
  }

  const inventory = document.querySelector('.headsUpDisplayBountifulBeanstalk__inventoryContainer .headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent');
  if (! inventory) {
    return;
  }

  let isSetOpen = getSetting('location-huds.bountiful-beanstalk-inventory-toggled', 'not-set');
  if (isSetOpen) {
    inventory.classList.add('headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open');
    toggleButton.classList.add('headsUpDisplayBountifulBeanstalk__inventoryContainerButton--open');
  } else if (isSetOpen === 'not-set') {
    isSetOpen = false;
  }

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Longer than a simple ternary and a toggle to make it more readable.
    if (isSetOpen) {
      isSetOpen = false;
      inventory.classList.remove('headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open');
      toggleButton.classList.remove('headsUpDisplayBountifulBeanstalk__inventoryContainerButton--open');
    } else {
      isSetOpen = true;
      inventory.classList.add('headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open');
      toggleButton.classList.add('headsUpDisplayBountifulBeanstalk__inventoryContainerButton--open');
    }

    saveSetting('location-huds.bountiful-beanstalk-inventory-toggled', isSetOpen);
  });
};

const keepRoomDataToggled = async () => {
  const roomData = document.querySelector('.headsUpDisplayBountifulBeanstalkView__lootMultiplierContainer');
  if (! roomData) {
    return;
  }

  let isSetOpen = getSetting('location-huds.bountiful-beanstalk-room-data-toggled', 'not-set');
  if (isSetOpen) {
    roomData.classList.add('mh-improved-room-data--open');
  } else if (isSetOpen === 'not-set') {
    isSetOpen = false;
  }

  roomData.addEventListener('click', (e) => {
    e.preventDefault();

    if (isSetOpen) {
      isSetOpen = false;
      roomData.classList.remove('mh-improved-room-data--open');
    } else {
      isSetOpen = true;
      roomData.classList.add('mh-improved-room-data--open');
    }

    saveSetting('location-huds.bountiful-beanstalk-room-data-toggled', isSetOpen);
  });
};

const keepTooltipToggled = async () => {
  const tooltip = document.querySelector('.bountifulBeanstalkCastleView__plinthOverlay.mousehuntTooltipParent .mousehuntTooltip');
  if (! tooltip) {
    return;
  }

  tooltip.addEventListener('click', (e) => {
    e.preventDefault();

    tooltip.classList.toggle('mh-improved-tooltip-stay-open');
  });
};

const funTime = async () => {
  const meter = document.querySelector('.bountifulBeanstalkCastleView__noiseMeterFrame');
  if (! meter) {
    return;
  }

  meter.addEventListener('click', () => {
    const time = 1000;

    let hue = 0;
    const interval = setInterval(() => {
      if (hue >= 360) {
        clearInterval(interval);
      }

      hue += 1;
      meter.style.filter = `hue-rotate(${hue}deg)`;
    }, time / 360);
  });
};

const makeGiantMoreVisible = async () => {
  const background = document.querySelector('.bountifulBeanstalkCastleView__background');
  if (! background) {
    return;
  }

  const isGiantChase = user?.quests?.QuestBountifulBeanstalk?.castle?.is_boss_chase || false;
  if (isGiantChase) {
    background.classList.add('is-boss-chase');
  } else {
    background.classList.remove('is-boss-chase');
  }
};

const toggleFuelWithIcon = async () => {
  const icon = document.querySelector('.headsUpDisplayBountifulBeanstalkView__fuelContainer');
  if (! icon) {
    return;
  }

  const button = document.querySelector('.headsUpDisplayBountifulBeanstalkView__fuelToggleButton');
  if (! button) {
    return;
  }

  icon.addEventListener('click', () => {
    button.click();
  });
};

const updateLootText = async () => {
  const ccLoot = document.querySelector('.headsUpDisplayBountifulBeanstalkView__multiplier.headsUpDisplayBountifulBeanstalkView__multiplier--condensed_creativity div');
  if (ccLoot) {
    ccLoot.innerText = 'Con. Creativity:';
  }

  const featherLoot = document.querySelector('.headsUpDisplayBountifulBeanstalkView__multiplier.headsUpDisplayBountifulBeanstalkView__multiplier--feather div');
  if (featherLoot) {
    featherLoot.innerText = 'Golden Feather:';
  }
};

const baitAmounts = {
  beanster_cheese: {
    amounts: ['160-normal', 160],
    shop: 'beanster_pack_small_convertible',
    shopNormal: 'beanster_cheese',
  },
  lavish_beanster_cheese: {
    amounts: [4, 8, 80],
    shop: 'lavish_beanster_pack_small_convertible',
  },
  leaping_lavish_beanster_cheese: {
    amounts: [2, 4, 8],
    shop: 'leaping_lavish_beanster_pack_small_convertible',
  },
  royal_beanster_cheese: {
    amounts: [2, 18, 20],
    shop: 'royal_beanster_pack_small_convertible',
  }
};

const addCraftingButtons = async () => {
  const baits = document.querySelectorAll('.headsUpDisplayBountifulBeanstalkView__baitCraftableContainer');
  if (! baits) {
    return;
  }

  const purchaseBait = async (shopItem, quantity, popup) => {
    popup.classList.add('loading');

    const results = await doRequest('managers/ajax/purchases/itempurchase.php', {
      type: shopItem,
      quantity,
      buy: 1,
      is_kings_cart_item: 0,
    });

    results.inventory = results.inventory || {};
    results.items = results.items || {};

    const newInventoryQuantities = Object.keys(results.inventory).reduce((acc, key) => {
      acc[key] = results.inventory[key].quantity;
      return acc;
    }, {});

    const newItemsQuantities = Object.keys(results.items).reduce((acc, key) => {
      acc[key] = results.items[key].num_owned;
      return acc;
    }, {});

    const newQuantities = {
      ...newInventoryQuantities,
      ...newItemsQuantities,
    };

    baits.forEach((bait) => {
      const baitQuantity = bait.querySelector('.headsUpDisplayBountifulBeanstalkView__baitQuantity');
      if (! baitQuantity) {
        return;
      }

      const baitQuantityType = baitQuantity.getAttribute('data-item-type');
      if (baitQuantityType && newQuantities[baitQuantityType]) {
        baitQuantity.innerText = newQuantities[baitQuantityType].toLocaleString();
      }

      const baitCraftQty = bait.querySelector('.headsUpDisplayBountifulBeanstalkView__ingredientQuantity');
      if (! baitCraftQty) {
        return;
      }

      const baitIngredientType = baitCraftQty.getAttribute('data-item-type');
      if (baitIngredientType && newQuantities[baitIngredientType]) {
        baitCraftQty.innerText = newQuantities[baitIngredientType].toLocaleString();
      }
    });

    popup.classList.remove('loading');
    popup.classList.add('success');

    setTimeout(() => {
      popup.classList.remove('success');
    }, 1000);

    return (results && results.success);
  };

  baits.forEach((bait) => {
    const quantity = bait.querySelector('.headsUpDisplayBountifulBeanstalkView__baitQuantity');
    if (! quantity) {
      return;
    }

    const existingCraftingPopup = bait.querySelector('.mh-crafting-popup');
    if (existingCraftingPopup) {
      return;
    }

    quantity.classList.add('mousehuntTooltipParent');

    const popup = makeElement('div', ['mh-crafting-popup']);

    const existingPopup = bait.querySelector('.mousehuntTooltip');
    if (existingPopup) {
      existingPopup.classList.remove('noEvents');
    } else {
      popup.classList.add('mousehuntTooltip', 'tight', 'top');
    }

    const actions = makeElement('div', 'mh-crafting-actions');
    const baitType = bait.getAttribute('data-item-type');

    const amounts = baitAmounts[baitType].amounts;
    for (const amount of amounts) {
      const isNormal = amount.toString().includes('-normal');

      const qty = isNormal ? amount.toString().replace('-normal', '') : amount;
      const className = isNormal ? 'mh-crafting-action' : 'mh-crafting-action lightBlue';
      const title = isNormal ? `Craft ${amount}` : `Craft ${amount} using Magic Essence`;
      const type = isNormal ? baitAmounts[baitType].shopNormal : baitAmounts[baitType].shop;

      makeMhButton({
        text: `Craft ${qty}`,
        className,
        title,
        size: 'tiny',
        callback: () => {
          purchaseBait(type, qty, popup);
        },
        appendTo: actions,
      });
    }

    popup.append(actions);

    if (existingPopup) {
      existingPopup.insertBefore(popup, existingPopup.lastChild);
    } else {
      bait.append(popup);
    }
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  const stylesToAdd = [regionStyles, styles];

  if (getSetting('location-huds.bountiful-beanstalk-invetory-in-one-row', false)) {
    stylesToAdd.push(smallInvStyles);
  }

  addHudStyles(stylesToAdd);

  keepInventoryToggled();
  keepRoomDataToggled();
  keepTooltipToggled();
  makeGiantMoreVisible();
  toggleFuelWithIcon();
  updateLootText();
  addCraftingButtons();

  onRequest('*', updateTitle);
  onTurn(updateTitle, 1000);

  funTime();

  onTurn(makeGiantMoreVisible, 1000);
};
