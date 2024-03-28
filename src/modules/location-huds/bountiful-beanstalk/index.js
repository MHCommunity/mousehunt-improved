import {
  addHudStyles,
  getSetting,
  makeElement,
  onRequest,
  onTurn,
  saveSetting
} from '@utils';

import regionStyles from '../shared/folklore-forest/styles.css';
import smallInvStyles from './small-inv.css';
import styles from './styles.css';

const keepInventoryToggled = () => {
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

const keepRoomDataToggled = () => {
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

const funTime = () => {
  const meter = document.querySelector('.bountifulBeanstalkCastleView__noiseMeterFrame');
  if (! meter) {
    return;
  }

  meter.addEventListener('click', () => {
    // For 1 second, animate through the colors of the rainbow using hue-rotate.
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

const makeGiantMoreVisible = () => {
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

const toggleFuelWithIcon = () => {
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

const updateTitle = () => {
  const title = document.querySelector('.bountifulBeanstalkCastleView__title');
  if (! title) {
    return;
  }

  if (title.classList.contains('loot-displayed')) {
    const display = document.querySelector('.loot-display');
    if (display) {
      display.remove();
    }
  }

  const loot = document.querySelector('.bountifulBeanstalkCastleView__currentRoomLoot');
  const lootMult = document.querySelector('.bountifulBeanstalkCastleView__currentRoomLootMultiplier');

  if (! loot || ! lootMult) {
    title.classList.remove('loot-displayed');
    return;
  }

  if (loot.innerText && lootMult.innerText) {
    makeElement('div', 'loot-display', `${lootMult.innerText}x ${loot.innerText}`, title);
    title.classList.add('loot-displayed');
  }
};

const updateLootText = () => {
  const ccLoot = document.querySelector('.headsUpDisplayBountifulBeanstalkView__multiplier.headsUpDisplayBountifulBeanstalkView__multiplier--condensed_creativity div');
  if (ccLoot) {
    ccLoot.innerText = 'Con. Creativity:';
  }

  const featherLoot = document.querySelector('.headsUpDisplayBountifulBeanstalkView__multiplier.headsUpDisplayBountifulBeanstalkView__multiplier--feather div');
  if (featherLoot) {
    featherLoot.innerText = 'Golden Feather:';
  }
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
  makeGiantMoreVisible();
  toggleFuelWithIcon();
  updateTitle();
  updateLootText();

  onRequest('*', updateTitle);
  onTurn(updateTitle, 1000);

  funTime();

  onTurn(makeGiantMoreVisible, 1000);
};
