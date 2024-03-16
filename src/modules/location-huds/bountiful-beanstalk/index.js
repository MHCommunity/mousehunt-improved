import { addHudStyles, getSetting, saveSetting } from '@utils';

import regionStyles from '../shared/folklore-forest/styles.css';
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
  } else if (isSetOpen === 'not-set') {
    isSetOpen = false;
  }

  toggleButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Longer than a simple ternary and a toggle to make it more readable.
    if (isSetOpen) {
      isSetOpen = false;
      inventory.classList.remove('headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open');
    } else {
      isSetOpen = true;
      inventory.classList.add('headsUpDisplayBountifulBeanstalk__inventoryContainerBlockContent--open');
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

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([regionStyles, styles]);

  keepInventoryToggled();
  keepRoomDataToggled();

  funTime();
};
