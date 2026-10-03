import { addBodyClass, addIconToMenu, addStyles, getSetting, isMenuItemHidden, makeElement, onEvent, onJournalEntriesProcessed, onModuleToggle, removeBodyClass } from '@utils';

import settings from './settings';

import iconStyles from './styles/icon.css';
import styles from './styles/styles.css';
import stylesTransparent from './styles/transparent.css';

const MODULE_ID = 'journal-privacy';
const ICON_ID = 'mousehunt-improved-journal-privacy';

/**
 * Apply a class to names in the journal.
 */
const applyClassToNames = () => {
  if (!isPrivacyEnabled) {
    return;
  }

  const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
  entries.forEach((entry) => {
    if (!entry || !entry.textContent) {
      return;
    }

    if (entry.getAttribute('replaced') === 'true') {
      return;
    }

    // if entry matches a name, add class
    const match = entry.textContent.match(/(.*)( has joined the | has left the | used Rare Map Dust |, the map owner, has )/);
    if (match && match[1]) {
      // Wrap the match in a span.
      const span = makeElement('span', 'mh-journal-privacy-name');
      span.textContent = match[1];

      entry.setAttribute('data-original', match[1]);
      entry.setAttribute('replaced', 'true');

      // Replace the match with the span.
      entry.innerHTML = entry.innerHTML.replace(match[1], span.outerHTML);
    }
  });
};

/**
 * Remove the privacy class from names in the journal.
 */
const removeClassFromNames = () => {
  if (isPrivacyEnabled) {
    return;
  }

  const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
  entries.forEach((entry) => {
    if (!entry || !entry.textContent) {
      return;
    }

    if (entry.getAttribute('replaced') !== 'true') {
      return;
    }

    // Get the span and replace it with the original text.
    const span = entry.querySelector('.mh-journal-privacy-name');
    if (span) {
      span.replaceWith(span.textContent);
      entry.removeAttribute('data-original');
      entry.removeAttribute('replaced');
    }
  });
};

/**
 * Enable privacy in the journal.
 */
const enablePrivacy = () => {
  addBodyClass('mh-journal-privacy-enabled', true);
  removeBodyClass('mh-journal-privacy-disabled');
  applyClassToNames();
};

/**
 * Disable privacy in the journal.
 */
const disablePrivacy = () => {
  removeBodyClass('mh-journal-privacy-enabled');
  addBodyClass('mh-journal-privacy-disabled', true);
  removeClassFromNames();
};

/**
 * Add the toggle icon to the menu.
 */
const addIcon = () => {
  const existingIcon = document.querySelector(`#${ICON_ID}`);
  if (existingIcon) {
    existingIcon.style.display = '';
    existingIcon.style.visibility = '';
    return;
  }

  addIconToMenu({
    id: ICON_ID,
    classname: 'mousehunt-improved-journal-privacy-icon',
    title: 'Toggle Journal Privacy',
    position: 'prepend',
    /**
     * Toggle the privacy.
     */
    action: () => {
      isPrivacyEnabled = !isPrivacyEnabled;

      if (isPrivacyEnabled) {
        enablePrivacy();
      } else {
        disablePrivacy();
      }
    },
  });
};

/**
 * Remove the toggle icon from the menu.
 */
const removeIcon = () => {
  const icon = document.querySelector(`#${ICON_ID}`);
  if (icon) {
    icon.style.display = 'none';
    icon.style.visibility = 'hidden';
  }
};

let isPrivacyEnabled = true;

// Whether the icon was hidden with Custom Menu the last time the state was synced.
let isIconHidden = null;

/**
 * Sync the privacy state with current settings.
 */
const syncPrivacyState = () => {
  if (!getSetting(MODULE_ID, false)) {
    isPrivacyEnabled = false;
    isIconHidden = null;
    removeIcon();
    disablePrivacy();
    return;
  }

  addIcon();

  // Only reset the state when the icon is hidden or shown, not on every menu change.
  const hidden = isMenuItemHidden(ICON_ID);
  if (hidden === isIconHidden) {
    return;
  }

  // Without the icon there's no way to turn privacy on, so keep it on. With the icon, start with it off.
  isIconHidden = hidden;
  isPrivacyEnabled = hidden;

  if (hidden) {
    enablePrivacy();
  } else {
    disablePrivacy();
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([getSetting('journal-privacy.transparent', false) ? stylesTransparent : styles, iconStyles], MODULE_ID);

  syncPrivacyState();

  // Catch entries added after load, like new pages and entries from sounding the horn.
  onJournalEntriesProcessed(applyClassToNames);

  onModuleToggle(MODULE_ID, {
    enable: syncPrivacyState,
    disable: () => {
      isPrivacyEnabled = false;
      isIconHidden = null;
      removeIcon();
      disablePrivacy();
    },
  });

  onEvent('mh-improved-custom-menu-changed', syncPrivacyState);
};

/**
 * Initialize the module.
 */
export default {
  id: 'journal-privacy',
  name: 'Journal Privacy',
  type: 'hide-simplify',
  default: false,
  description: 'Hide player names in the journal.',
  liveToggle: true,
  load: init,
  settings,
};
