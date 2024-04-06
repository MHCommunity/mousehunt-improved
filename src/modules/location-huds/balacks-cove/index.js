import { addHudStyles, makeElement, onEvent } from '@utils';

import styles from './styles.css';

import addCheeseSelector from '../shared/cheese-selectors';

const getClosingText = (closes, stage, nextStageOffsetMinutes, nextStageText) => {
  const hours = Math.floor(closes);
  const minutes = Math.ceil((closes - Math.floor(closes)) * 60);

  let timeLeftText = `${hours}h ${minutes}m until ${stage}`;

  if (nextStageOffsetMinutes && nextStageText) {
    const totTimeMinutes = (hours * 60) + minutes + nextStageOffsetMinutes;
    timeLeftText += `, <span class="offset">${Math.floor(totTimeMinutes / 60)}h ${totTimeMinutes % 60}m until ${nextStageText}</span>`;
  }

  return timeLeftText;
};

const updateClosingTime = () => {
  const hudBar = document.querySelector('.balacksCoveHUD-tideContainer');
  if (! hudBar) {
    return;
  }

  let timeLeftText = '';

  // Props Warden Slayer & Timers+ for the math and logic.
  const today = new Date();

  const rotationLength = 18.66666;
  const rotationsExact = (((today.getTime() / 1000) - 1294680060) / 3600) / rotationLength;
  const rotationsInteger = Math.floor(rotationsExact);
  const partialRotation = (rotationsExact - rotationsInteger) * rotationLength;

  if (partialRotation < 16) {
    // currently low, which means its (16 hours - current time) until mid flooding, then one more hour after than until high tide
    timeLeftText = getClosingText(16 - partialRotation, 'Mid Tide', 60, 'High Tide');
  } else if (partialRotation >= 16 && partialRotation < 17) {
    // currently mid, which means its (1hr - current time) until high tide, then 40 minutes after that until low mid time again
    timeLeftText = getClosingText(1 - (partialRotation - 16), 'High Tide', 40, 'Low Tide');
  } else if (partialRotation >= 17 && partialRotation < 17.66666) {
    // currently high, which means its (40 minutes - current time) until mid tide again, then 1 hour after that until low tide
    timeLeftText = getClosingText(0.66666 - (partialRotation - 17), 'Mid Tide', 60, 'Low Tide');
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
  addCheeseSelector('balacks-cove', [
    'vanilla_stilton_cheese',
    'vengeful_vanilla_stilton_cheese',
  ]);

  updateClosingTime();
  onEvent('horn-countdown-tick-minute', updateClosingTime);
};
