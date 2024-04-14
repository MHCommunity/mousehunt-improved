import {
  doEvent,
  getCurrentDialog,
  getCurrentPage,
  getFlag,
  getHeaders,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
  onTurn,
  setMultipleTimeout
} from '@utils';

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

let isJournalProcessing = false;
const processEntries = async () => {
  if (! ('camp' === getCurrentPage() || 'hunterprofile' === getCurrentPage())) {
    return;
  }

  if (isJournalProcessing) {
    return;
  }

  isJournalProcessing = true;

  const entries = document.querySelectorAll('.journal .entry');
  for (const entry of entries) {
    doEvent('journal-entry', entry);
  }

  doEvent('journal-entries', entries);

  isJournalProcessing = false;
};

const processSingleEntries = async () => {
  if (isJournalProcessing) {
    return;
  }

  isJournalProcessing = true;
  const entriesEl = document.querySelectorAll('.jsingle .entry');
  for (const entry of entriesEl) {
    doEvent('journal-entry', entry);
  }
  isJournalProcessing = false;
};

const addJournalProcessingEvents = async () => {
  setMultipleTimeout(processEntries, [100, 500, 1000]);

  onRequest('*', (data) => {
    setMultipleTimeout(processEntries, [100, 500, 1000]);

    if (data.journal_markup && data.journal_markup.length > 0) {
      processSingleEntries(data.journal_markup);
    }
  });

  onEvent('journal-history-entry-added', processEntries);
};

const addDialogListeners = () => {
  let currentDialog = null;
  onEvent('js_dialog_hide', () => {
    console.log('dialog-hide', `dialog-hide-${currentDialog}`); // eslint-disable-line no-console
    doEvent('dialog-hide', currentDialog);
    doEvent(`dialog-hide-${currentDialog}`);
  });

  onDialogShow('all', () => {
    currentDialog = getCurrentDialog();
    console.log('dialog-show', `dialog-show-${currentDialog}`); // eslint-disable-line no-console
    doEvent('dialog-show', currentDialog);
    doEvent(`dialog-show-${currentDialog}`);
  });
};

const checkForMHCT = () => {
  const hasMhct = document.querySelector('#mhhh_version');
  console.log(hasMhct ? 'MHCT is installed' : 'MHCT is not installed'); // eslint-disable-line no-console
  // todo: add a popup to inform the user that they should install MHCT.
};

const addSupportLink = () => {
  const description = document.querySelector('#overlayPopup .jsDialogContainer .contactUsForm .description');
  if (! description) {
    return;
  }

  const supportWrap = makeElement('div', 'support-link');

  makeElement('p', '', 'Before contacting support, please make sure that the issue isn\'t caused by MouseHunt Improved. If it is, please report it on the GitHub page.', supportWrap);
  const supportLink = makeElement('a', '', 'Visit the MouseHunt Improved GitHub page');
  supportLink.href = 'https://github.com/MHCommunity/mousehunt-improved/issues';
  supportLink.target = '_blank';
  supportWrap.append(supportLink);

  description.before(supportWrap);
};

/**
 * Initialize the module.
 */
const init = async () => {
  // If you want to disable the reporting, you can but you have to admit you're a cheater.
  if (! getFlag('i-am-a-cheater-and-i-know-it')) {
    setTimeout(checkForAutoHorn, 5000);
    onTurn(checkForAutoHorn, 5000);
  }

  addEvents();
  addDialogListeners();
  addJournalProcessingEvents();

  checkForMHCT();

  onEvent('dialog-show-support', addSupportLink);
};

export default {
  id: '_required',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
