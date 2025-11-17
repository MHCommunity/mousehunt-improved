import {
  addSettingsTab,
  createPopup,
  doEvent,
  doInternalEvent,
  getCurrentDialog,
  getCurrentPage,
  makeElement,
  onDialogShow,
  onEvent,
  onNavigation,
  onRequest,
  onTravel,
  setMultipleTimeout
} from '@utils';

import globalUtils from './global-utils';

let hasAddedHornCountdownEvents = false;

/**
 * Add the horn countdown events.
 */
const addHornCountdownEvents = () => {
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

  doInternalEvent('journal-entries-processing', entries);

  for (const entry of entries) {
    doInternalEvent('journal-entry', entry);
  }

  doInternalEvent('journal-entries-processed', entries);

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
  setMultipleTimeout(processEntries, [100, 500, 1000]);

  onRequest('*', (data) => {
    setMultipleTimeout(processEntries, [100, 500, 1000]);

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

const refreshOnLogin = (response, request) => {
  if ('loginHitGrab' !== request?.action) {
    return;
  }

  window.location.reload();
};

/**
 * Initialize the module.
 */
const init = async () => {
  // Add the global utils to the window object.
  globalUtils();

  addEvents();
  addDialogListeners();
  addJournalProcessingEvents();
  addUserscriptConfirmation();

  onEvent('dialog-show-support', addSupportLink);

  onTravel(null, { callback: addEvents });

  onRequest('users/session.php', refreshOnLogin);

  onNavigation(addSettingsTab, {
    page: 'preferences',
  });
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
