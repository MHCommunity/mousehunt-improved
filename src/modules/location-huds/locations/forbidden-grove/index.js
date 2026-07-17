import { addHudStyles, getCurrentLocation, makeElement, replaceOrAppend } from '@utils';
import { formatRotationTime, getLocationRotation } from '@utils/shared/location-rotations';

import styles from './styles.css';

import addCheeseSelector from '../../shared/cheese-selectors';

/**
 * Update the closing time text.
 *
 * @return {HTMLDivElement} The time left element.
 */
const updateClosingTime = () => {
  const rotation = getLocationRotation('forbidden_grove');

  const timeLeftEl = makeElement('div', 'forbiddenGroveHUD-grovebar-timeLeft');
  timeLeftEl.innerText = 'Open' === rotation.current.name ? `${formatRotationTime(rotation.current.minutesLeft)} remaining` : '';

  return timeLeftEl;
};

/**
 * Update the HUD.
 */
const hud = () => {
  if ('forbidden_grove' !== getCurrentLocation()) {
    return;
  }

  const hudBar = document.querySelector('.forbiddenGroveHUD-grovebar');
  if (!hudBar) {
    return;
  }

  const timeLeftEl = updateClosingTime();

  replaceOrAppend(hudBar, '.forbiddenGroveHUD-grovebar-timeLeft', timeLeftEl);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  addCheeseSelector('forbidden-grove', ['ancient_cheese', 'radioactive_blue_cheese', 'magical_radioactive_blue_cheese', 'moon_cheese', 'crescent_cheese']);

  hud();

  document.addEventListener('horn-countdown-tick-minute', hud);
};
