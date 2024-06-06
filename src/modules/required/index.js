import {
  doEvent,
  doInternalEvent,
  getCurrentDialog,
  getCurrentLocation,
  getCurrentPage,
  getFlag,
  getHeaders,
  getSetting,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
  onTravel,
  onTurn,
  setMultipleTimeout
} from '@utils';

/**
 * Check for the auto horn.
 */
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

let hasAddedHornCountdownEvents = false;

/**
 * Add the horn countdown events.
 */
const addHornCountdownEvents = () => {
  // Only run the horn countdown events on certain locations and if a module needs it.
  const locations = ['balacks_cove', 'floating_islands'];
  if (! getSetting('lgs-reminder', false) && ! locations.includes(getCurrentLocation())) {
    return;
  }

  if (hasAddedHornCountdownEvents) {
    return;
  }

  const hunterHornTimer = document.querySelector('.huntersHornView__timerState');
  if (hunterHornTimer) {
    // Add a mutation observer to check when the innerText changes and when it does, start an interval where we fire an event every second.
    const observer = new MutationObserver(() => {
      setInterval(() => {
        doInternalEvent('horn-countdown-tick-minute', hunterHornTimer.innerText);
      }, 60 * 1000);

      observer.disconnect();
    });

    observer.observe(hunterHornTimer, { childList: true });
  }

  hasAddedHornCountdownEvents = true;
};

/**
 * Add events that we can listen for.
 */
const addEvents = () => {
  addHornCountdownEvents();
};

let isJournalProcessing = false;

/**
 * Process the journal entries.
 */
const processEntries = async () => {
  if (
    isJournalProcessing || ! (
      'journal' === getCurrentPage() ||
      'camp' === getCurrentPage() ||
      'hunterprofile' === getCurrentPage()
    )
  ) {
    return;
  }

  isJournalProcessing = true;

  const entries = document.querySelectorAll('.journal .entry');
  for (const entry of entries) {
    doInternalEvent('journal-entry', entry);
  }

  isJournalProcessing = false;
};

/**
 * Process the single journal entries.
 */
const processSingleEntries = async () => {
  if (isJournalProcessing) {
    return;
  }

  isJournalProcessing = true;
  const entriesEl = document.querySelectorAll('.jsingle .entry');
  for (const entry of entriesEl) {
    doInternalEvent('journal-entry', entry);
  }

  isJournalProcessing = false;
};

/**
 * Add journal processing events.
 */
const addJournalProcessingEvents = async () => {
  const settings = [
    'better-journal.styles',
    'better-journal.replacements',
    'better-journal.list',
    'better-journal.gold-and-points',
    'better-journal.journal-history',
  ];

  // If any of the settings are enabled, then we'll process the journal entries, otherwise we can skip it.
  if (! settings.some((setting) => getSetting(setting))) {
    return;
  }

  setMultipleTimeout(processEntries, [100, 500, 1000]);

  onRequest('*', (data) => {
    setMultipleTimeout(processEntries, [100, 500, 1000, 2500]);

    if (data.journal_markup && data.journal_markup.length > 0) {
      processSingleEntries(data.journal_markup);
    }
  }, true);

  onEvent('journal-history-entry-added', processEntries);
};

/**
 * Add dialog listeners for dialog events.
 */
const addDialogListeners = () => {
  let currentDialog = null;
  onEvent('js_dialog_hide', () => {
    doEvent('dialog-hide', currentDialog);
    doEvent(`dialog-hide-${currentDialog}`);
  });

  onDialogShow('all', () => {
    currentDialog = getCurrentDialog();
    doEvent('dialog-show', currentDialog);
    doEvent(`dialog-show-${currentDialog}`);
  });
};

/**
 * Check for MHCT.
 *
 * @return {boolean} Whether MHCT is installed or not.
 */
const checkForMHCT = () => {
  return !! document.querySelector('#mhhh_version');
  // todo: add a popup to inform the user that they should install MHCT.
};

/**
 * Add a support link to the support dialog.
 */
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

  onTravel(null, { callback: addEvents });
};

/**
 * Initialize the module.
 */
export default {
  id: '_required',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
