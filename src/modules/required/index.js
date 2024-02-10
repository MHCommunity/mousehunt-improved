import { doEvent } from '@utils';

const addEvents = () => {
  const hunterHornTimer = document.querySelector('.huntersHornView__timerState');
  if (hunterHornTimer) {
    // Add a mutation observer to check when the innertext changes and when it does, start an interval where we fire an event every second.
    const observer = new MutationObserver(() => {
      // After the mutation, start the interval and then stop watching for mutations.
      setInterval(() => {
        doEvent('horn-countdown-tick', hunterHornTimer.innerText);
      }, 1000);

      setInterval(() => {
        doEvent('horn-countdown-tick-minute', hunterHornTimer.innerText);
      }, 60 * 1000);

      observer.disconnect();
    });

    observer.observe(hunterHornTimer, { childList: true });
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addEvents();
};

export default {
  id: '_required',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
