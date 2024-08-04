import {
  createPopup,
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

let hasFailedFetch = false;

/**
 * Check for the auto horn.
 */
const checkForAutoHorn = () => {
  if (hasFailedFetch) {
    return;
  }

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
  } catch {
    // Don't do anything with the error, as it's not important.
    hasFailedFetch = true;
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
    if (currentDialog && currentDialog.length > 0) {
      currentDialog = currentDialog.replaceAll(' ', '-').toLowerCase();
      doEvent('dialog-show', currentDialog);
      doEvent(`dialog-show-${currentDialog}`);
    }
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
 * Add a confirmation popup if the user is using the userscript.
 */
const addUserscriptConfirmation = () => {
  // Only show the popup if we're on a userscript.
  if ('userscript' !== mhImprovedPlatform) {
    return;
  }

  // Don't show the popup if the user has already confirmed it.
  if ('confirmed' === localStorage.getItem('mousehunt-improved-userscript-confirmation')) {
    return;
  }

  // Don't show the popup on iOS devices, as we only support the userscript there.
  if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
    return;
  }

  const popup = createPopup({
    title: 'Important MouseHunt Improved Userscript information',
    content: `<p>
      You are currently using MouseHunt Improved as a userscript. It is recommended to install the browser extension instead for a better, faster, and more stable experience.
      <div class="mh-improved-userscript-popup-actions">
        <a href="https://addons.mozilla.org/en-US/firefox/addon/mousehunt-improved/" title="View on Firefox Add-ons">
          <img src="https://i.mouse.rip/firefox.svg" alt="View on Firefox Add-ons" />
        </a>
        <a href=https://chrome.google.com/webstore/detail/mousehunt-improved/mbkpejkkhmebmdjokdplhkljgkcfhjol" title="View on Chrome Web Store">
          <img src="https://i.mouse.rip/chrome.svg" alt="View on Chrome Web Store" />
        </a>
      </div>
      <button class="mh-improved-userscript-popup-confirm mousehuntActionButton small gray"><span>
        I understand, don't show this again
      </span></button>
    </p>`,
    className: 'mh-improved-userscript-popup',
  });

  const confirmButton = document.querySelector('.mh-improved-userscript-popup-confirm');
  confirmButton.addEventListener('click', () => {
    localStorage.setItem('mousehunt-improved-userscript-confirmation', 'confirmed');
    popup.hide();
  });
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
  addUserscriptConfirmation();

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
