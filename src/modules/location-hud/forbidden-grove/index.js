import { addHudStyles, getCurrentLocation, onTravel } from '@/utils';

import styles from './styles.css';

import addCheeseSelector from '../shared/cheese-selectors';

const updateClosingTime = () => {
  let timeLeftText = '';

  // Props Warden Slayer & Timers+ for the math and logic.
  const today = new Date();
  const rotationLength = 20;
  const rotationsExact = (((today.getTime() / 1000) - 1285704000) / 3600) / rotationLength;
  const rotationsInteger = Math.floor(rotationsExact);
  const partialrotation = (rotationsExact - rotationsInteger) * rotationLength;
  if (partialrotation < 16) {
    const closes = (16 - partialrotation).toFixed(3);
    const hours = Math.floor(closes);
    const minutes = Math.ceil((closes - Math.floor(closes)) * 60);

    timeLeftText = `${hours}h ${minutes}m remaining`;
  }

  const timeLeftEl = document.createElement('div');
  timeLeftEl.classList.add('forbiddenGroveHUD-grovebar-timeLeft');
  timeLeftEl.innerText = timeLeftText;

  return timeLeftEl;
};

const hud = () => {
  if ('forbidden_grove' !== getCurrentLocation()) {
    return;
  }

  const hudBar = document.querySelector('.forbiddenGroveHUD-grovebar');
  if (! hudBar) {
    return;
  }

  const existing = document.querySelector('.forbiddenGroveHUD-grovebar-timeLeft');
  if (existing) {
    existing.remove();
  }

  const timeLeftEl = updateClosingTime();

  hudBar.append(timeLeftEl);

  // add a timer to update the time left
  const timer = setInterval(updateClosingTime, 60 * 1000);
  onTravel(null, { callback: () => {
    clearInterval(timer);
  } });
};

/**
 * Initialize the module.
 */
export default () => {
  addHudStyles(styles);
  addCheeseSelector('forbidden-grove', [
    'ancient_cheese',
    'radioactive_blue_cheese',
    'magical_radioactive_blue_cheese',
    'moon_cheese',
    'crescent_cheese',
  ]);
  hud();
};
