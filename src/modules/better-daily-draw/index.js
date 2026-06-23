import { getSetting, onDeactivation } from '@utils';

import settings from './settings';

/**
 * Reverse daily_draw elements.
 */
const reverseDailyDrawElements = () => {
  const firstDailyDraw = document.querySelector('.daily_draw');

  if (! firstDailyDraw) {
    return;
  }

  const container = firstDailyDraw.parentElement;

  const dailyDrawDivs = container.querySelectorAll('.daily_draw');

  if (dailyDrawDivs.length > 0) {
    const reversedDivs = [...dailyDrawDivs].reverse();

    dailyDrawDivs.forEach((div) => div.remove());

    const emptyDiv = container.querySelector('.empty');

    reversedDivs.forEach((div) => {
      if (emptyDiv) {
        emptyDiv.before(div);
      } else {
        container.append(div);
      }
    });
  }
};

/**
 * Main function to set up the daily draw sorting.
 */
const main = () => {
  const sortOldestFirst = getSetting('better-daily-draw.sort-oldest-first', false);

  if (! sortOldestFirst) {
    return;
  }

  if (messenger?.UI?.notification) {
    const originalTogglePopup = messenger.UI.notification.togglePopup;

    messenger.UI.notification.togglePopup = function (...args) {
      const result = originalTogglePopup.apply(this, args);
      setTimeout(reverseDailyDrawElements, 555);

      return result;
    };
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  main();

  onDeactivation('better-daily-draw', () => {
    if (messenger?.UI?.notification?.originalTogglePopup) {
      messenger.UI.notification.togglePopup = messenger.UI.notification.originalTogglePopup;
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-daily-draw',
  name: 'Better Daily Draw',
  type: 'better',
  default: false,
  description: 'Daily Draw options.',
  load: init,
  settings,
};
