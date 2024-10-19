import {
  addHudStyles,
  doRequest,
  getSetting,
  makeElement,
  makeMhButton,
  onRequest,
  onTurn,
  saveSetting,
  setMultipleTimeout
} from '@utils';

import keepInventoryToggled from '../../shared/folklore-forest/keep-inventory-open';

import regionStyles from '../../shared/folklore-forest/styles.css';
import smallInvStyles from './small-inv.css';
import styles from './styles.css';

/**
 * Expand the room data when clicked and keep it open.
 */
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

/**
 * Expand the tooltip when clicked and keep it open.
 */
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

/**
 * Add an easter egg to the noise meter.
 */
const funTime = async () => {
  const meter = document.querySelector('.bountifulBeanstalkCastleView__noiseMeterFrame');
  if (! meter) {
    return;
  }

  let isRotating = false;
  meter.addEventListener('click', () => {
    if (isRotating) {
      return;
    }

    isRotating = true;

    const time = 1000;

    let hue = 0;
    const interval = setInterval(() => {
      if (hue >= 360) {
        clearInterval(interval);
        isRotating = false;
      }

      hue += 1;
      meter.style.filter = `hue-rotate(${hue}deg)`;
    }, time / 360);
  });
};

/**
 * Add a class to make the giant more visible when chasing.
 */
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

/**
 * Click the fuel toggle button when the fuel icon is clicked.
 */
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

/**
 * Modify the loot text to not wrap.
 */
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

/**
 * Add crafting buttons to the baits.
 */
const addCraftingButtons = async () => {
  const baits = document.querySelectorAll('.headsUpDisplayBountifulBeanstalkView__baitCraftableContainer');
  if (! baits) {
    return;
  }

  /**
   * Purchase bait from the shop.
   *
   * @param {string}  shopItem The shop item to purchase.
   * @param {number}  quantity The quantity to purchase.
   * @param {Element} popup    The popup element.
   *
   * @return {boolean} True if the purchase was successful.
   */
  const purchaseBait = async (shopItem, quantity, popup) => {
    popup.classList.add('loading');

    const results = await doRequest('managers/ajax/purchases/itempurchase.php', {
      type: shopItem,
      quantity,
      buy: 1,
      is_kings_cart_item: 0,
    });

    if (! results || ! results.success) {
      popup.classList.remove('loading');
      popup.classList.add('error');

      setTimeout(() => {
        popup.classList.remove('error');
      }, 1000);

      return false;
    }

    if (! results.inventory || ! results.items) {
      return false;
    }

    results.inventory = results?.inventory || {};
    results.items = results?.items || {};

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

      let qty = isNormal ? amount.toString().replace('-normal', '') : amount;
      if (! isNormal) {
        qty = qty / 2;
      }

      const className = isNormal ? 'mh-crafting-action' : 'mh-crafting-action lightBlue';
      const title = isNormal ? `Craft ${amount.toString().replace('-normal', '')}` : `Craft ${amount} using Magic Essence`;
      const type = isNormal ? baitAmounts[baitType].shopNormal : baitAmounts[baitType].shop;

      makeMhButton({
        text: `Craft ${amount.toString().replace('-normal', '')}`,
        className,
        title,
        size: 'tiny',
        /**
         * Button action.
         */
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

const addCommaToNoiseMeter = async () => {
  const noise = document.querySelector('.bountifulBeanstalkCastleView__noiseLevel');
  if (noise && noise.innerText && Number.parseInt(noise.innerText) > 999) {
    noise.innerText = Number.parseInt(noise.innerText).toLocaleString();
  }
};

const addCommaToNoiseMeterTimeout = async () => {
  setMultipleTimeout(addCommaToNoiseMeter, [0, 500, 1000]);
};

let isAutoharpToggleInitiatiedByUs = false;
const addQuickHarpToggle = async () => {
  addQuickHarpToggleButton();
  onRequest('environment/bountiful_beanstalk.php', () => {
    if (isAutoharpToggleInitiatiedByUs) {
      return;
    }

    setTimeout(() => {
      addQuickHarpToggleButton();
    }, 100);
  });
};

const addQuickHarpToggleButton = async () => {
  const existingToggle = document.querySelector('.mh-quick-harp-toggle');
  if (existingToggle) {
    return;
  }

  const autoharp = document.querySelector('.headsUpDisplayBountifulBeanstalkView__playHarpDialogButton');
  if (! autoharp) {
    return;
  }

  if (autoharp.classList.contains('disabled')) {
    existingToggle?.remove();
    return;
  }

  const autoharpText = autoharp.querySelector('.headsUpDisplayBountifulBeanstalkView__playHarpDialogButtonPlayText');
  if (! autoharpText) {
    return;
  }

  const noiseFrame = document.querySelector('.bountifulBeanstalkCastleView__autoHarpNoiseMeterFrame');
  if (! noiseFrame) {
    return;
  }

  const toggleElements = () => {
    newToggleButton.classList.toggle('active');
    autoharp.classList.toggle('headsUpDisplayBountifulBeanstalkView__playHarpDialogButton--autoPlaying');
    autoharpText.innerText = autoharpText.innerText === 'Play' ? 'Auto Playing' : 'Play';
    noiseFrame.classList.toggle('bountifulBeanstalkCastleView__autoHarpNoiseMeterFrame--active');
  };

  const newToggleButton = makeElement('div', 'mh-quick-harp-toggle', 'Auto-Harp');

  if (user?.quests?.QuestBountifulBeanstalk?.castle?.auto_harp) {
    toggleElements();
  }

  newToggleButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    newToggleButton.classList.add('loading');

    isAutoharpToggleInitiatiedByUs = true;

    const result = await doRequest('managers/ajax/environment/bountiful_beanstalk.php', {
      action: 'toggle_auto_harp',
    });

    if (result && result.success) {
      newToggleButton.classList.remove('loading');
      newToggleButton.classList.add('hidden');

      setTimeout(() => {
        newToggleButton.classList.remove('hidden');
      }, 1000);

      toggleElements();
    } else {
      newToggleButton.classList.remove('loading');
      newToggleButton.classList.add('error');

      setTimeout(() => {
        newToggleButton.classList.remove('error');
      }, 1000);
    }

    isAutoharpToggleInitiatiedByUs = false;
  });

  autoharp.append(newToggleButton);
};

/**
 * Initialize the module.
 */
export default async () => {
  const stylesToAdd = [regionStyles, styles];

  if (getSetting('location-huds.bountiful-beanstalk-flip-avatar', false)) {
    stylesToAdd.push('.bountifulBeanstalkCastleView__playerMarkerUserThumb { transform: scaleX(-1); }');
  }

  if (getSetting('location-huds.bountiful-beanstalk-inventory-in-one-row', false)) {
    stylesToAdd.push(smallInvStyles);
  }

  addHudStyles(stylesToAdd);

  keepInventoryToggled({
    setting: 'location-huds.bountiful-beanstalk-inventory-toggled',
    buttonSelector: '.headsUpDisplayBountifulBeanstalk__inventoryContainer .headsUpDisplayBountifulBeanstalk__inventoryContainerButton',
    inventorySelector: '.headsUpDisplayBountifulBeanstalk__inventoryContainer .headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent',
    inventoryOpenClass: 'headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open',
    buttonOpenClass: 'headsUpDisplayBountifulBeanstalk__inventoryContainerButton--open',
  });
  keepRoomDataToggled();
  keepTooltipToggled();
  makeGiantMoreVisible();
  toggleFuelWithIcon();
  updateLootText();
  addCraftingButtons();
  addCommaToNoiseMeterTimeout();

  if (getSetting('location-huds.bountiful-beanstalk-quick-harp-toggle', false)) {
    addQuickHarpToggle();
  }

  funTime();

  onTurn(() => {
    makeGiantMoreVisible();
    addCommaToNoiseMeterTimeout();
  }, 1000);
};
