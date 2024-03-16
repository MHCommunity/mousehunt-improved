import { doEvent, getFlag, getHeaders, onTurn } from '@utils';

const checkForAutoHorn = () => {
  const storageKeys = new Set(['NOB-huntsLeft', 'HornTimeDelayMax', 'AutoSolveKR', 'TrapCheckTimeDelayMax', 'TrapCheckTimeOffset', 'TrapCheckTimeDelayMin', 'AutoSolveKRDelayMin', 'AutoSolveKRDelayMax', 'SaveKRImage', 'autoPopupKR', 'AggressiveMode', 'HornTimeDelayMin']);
  if (! Object.keys(localStorage).filter((key) => storageKeys.has(key)).length) {
    return;
  }

  const time = document.querySelector('#nextHornTimeElement');
  const msg = document.querySelector('#nobSpecialMessage');

  if (! (time || msg)) {
    return;
  }

  try {
    // Send a post request to the auto horn tracker.
    fetch('https://autohorn.mouse.rip/submit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        id: user.user_id,
        snid: user.sn_user_id,
        username: user.username,
      }),
    });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
};

/**
 * Add events that we can listen for.
 */
const addEvents = () => {
  const hunterHornTimer = document.querySelector('.huntersHornView__timerState');
  if (hunterHornTimer) {
    // Add a mutation observer to check when the innerText changes and when it does, start an interval where we fire an event every second.
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
  // If you want to disable the reporting, you can but you have to admit you're a cheater.
  if (! getFlag('i-am-a-cheater-and-i-know-it')) {
    checkForAutoHorn();
    onTurn(checkForAutoHorn, 2000);
  }

  addEvents();
};

export default {
  id: '_required',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
