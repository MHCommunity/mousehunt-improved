import { addHudStyles, makeElement } from '@utils';
import { formatRotationTime, getLocationRotation } from '@utils/shared/location-rotations';

import styles from './styles.css';

import addCheeseSelector from '../../shared/cheese-selectors';

/**
 * Update the closing time text.
 */
const updateClosingTime = () => {
  const hudBar = document.querySelector('.balacksCoveHUD-tideContainer');
  if (!hudBar) {
    return;
  }

  const rotation = getLocationRotation('balacks_cove');
  if (!rotation) {
    return;
  }

  // Mid Tide happens twice a rotation, so skip the one that's the tide we're already in.
  const [next, following] = rotation.upcoming.filter((stage) => !stage.isSameLevel);

  let timeLeftText = `${formatRotationTime(next.minutes)} until ${next.name}`;
  if (following) {
    timeLeftText += `, <span class="offset">${formatRotationTime(following.minutes)} until ${following.name}</span>`;
  }

  const existing = document.querySelector('.balacksCoveHUD-tideContainer-timeLeft');
  if (existing) {
    existing.innerHTML = timeLeftText;
  } else {
    makeElement('div', 'balacksCoveHUD-tideContainer-timeLeft', timeLeftText, hudBar);
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  addCheeseSelector('balacks-cove', ['vanilla_stilton_cheese', 'vengeful_vanilla_stilton_cheese']);

  updateClosingTime();
  document.addEventListener('horn-countdown-tick-minute', updateClosingTime);
};
