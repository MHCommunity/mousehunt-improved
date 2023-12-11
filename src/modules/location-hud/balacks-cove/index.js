import { addHudStyles, onTravel } from '@/utils';

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
  let timeLeftText = '';

  // Props Warden Slayer & Timers+ for the math and logic.
  const today = new Date();

  const rotationLength = 18.66666;
  const rotationsExact = (((today.getTime() / 1000) - 1294680060) / 3600) / rotationLength;
  const rotationsInteger = Math.floor(rotationsExact);
  const partialrotation = (rotationsExact - rotationsInteger) * rotationLength;
  if (partialrotation < 16) {
    // currently low, whcih means its (16 hours - current time) until mid flooding, then one more hour after than until high tide
    const closes = 16 - partialrotation;
    timeLeftText = getClosingText(closes, 'Mid Tide', 60, 'High Tide');
  } else if (partialrotation >= 16 && partialrotation < 17) {
    // currently mid, which means its (1hr - current time) until high tide, then 40 minutes after that until low mid time again
    const closes = 1 - (partialrotation - 16);
    timeLeftText = getClosingText(closes, 'High Tide', 40, 'Low Tide');
  } else if (partialrotation >= 17 && partialrotation < 17.66666) {
    // currently high, which means its (40 minutes - current time) until mid tide again, then 1 hour after that until low tide
    const closes = 0.66666 - (partialrotation - 17);
    timeLeftText = getClosingtimeLeftTextText(closes, 'Low Tide', 60, 'Mid Tide');
  }

  const timeLeftEl = document.createElement('div');
  timeLeftEl.classList.add('balacksCoveHUD-tideContainer-timeLeft');
  timeLeftEl.innerHTML = timeLeftText;

  return timeLeftEl;
};

const hud = () => {
  const hudBar = document.querySelector('.balacksCoveHUD-tideContainer');
  if (! hudBar) {
    return;
  }

  const existing = document.querySelector('.balacksCoveHUD-tideContainer-timeLeft');
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
  addCheeseSelector('balacks-cove', [
    'vanilla_stilton_cheese',
    'vengeful_vanilla_stilton_cheese',
  ]);

  hud();
};
