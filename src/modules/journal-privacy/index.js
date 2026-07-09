import {
  addBodyClass,
  addIconToMenu,
  addStyles,
  getSetting,
  makeElement,
  onActivation,
  onDeactivation,
  onRequest,
  onSettingsChange,
  removeBodyClass
} from '@utils';

import settings from './settings';

import iconStyles from './styles/icon.css';
import styles from './styles/styles.css';
import stylesTransparent from './styles/transparent.css';

const MODULE_ID = 'journal-privacy';

/**
 * Apply a class to names in the journal.
 */
const applyClassToNames = () => {
  if (! isPrivacyEnabled) {
    return;
  }

  const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
  if (! entries) {
    return;
  }

  entries.forEach((entry) => {
    if (! entry || ! entry.textContent) {
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
  if (! entries) {
    return;
  }

  entries.forEach((entry) => {
    if (! entry || ! entry.textContent) {
      return;
    }

    if (entry.getAttribute('replaced') !== 'true') {
      return;
    }

    // Get the span and replace it with the original text.
    const span = entry.querySelector('.mh-journal-privacy-name');
    if (span) {
      entry.innerHTML = entry.innerHTML.replace(span.outerHTML, span.textContent);
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
  if (! getSetting('journal-privacy.show-toggle-icon', false)) {
    return;
  }

  const existingIcon = document.querySelector('#mousehunt-improved-journal-privacy');
  if (existingIcon) {
    existingIcon.style.display = '';
    existingIcon.style.visibility = '';
    return;
  }

  addIconToMenu({
    id: 'mousehunt-improved-journal-privacy',
    classname: 'mousehunt-improved-journal-privacy-icon',
    title: 'Toggle Journal Privacy',
    position: 'prepend',
    /**
     * Toggle the privacy.
     */
    action: () => {
      isPrivacyEnabled = ! isPrivacyEnabled;

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
  const icon = document.querySelector('#mousehunt-improved-journal-privacy');
  if (icon) {
    icon.style.display = 'none';
    icon.style.visibility = 'hidden';
  }
};

let isPrivacyEnabled = true;

/**
 * Sync the privacy state with current settings.
 */
const syncPrivacyState = () => {
  if (! getSetting(MODULE_ID, false)) {
    isPrivacyEnabled = false;
    removeIcon();
    disablePrivacy();
    return;
  }

  if (getSetting('journal-privacy.show-toggle-icon', false)) {
    addIcon();
    isPrivacyEnabled = false;
    disablePrivacy();
    return;
  }

  removeIcon();
  isPrivacyEnabled = true;
  enablePrivacy();
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    getSetting('journal-privacy.transparent', false) ? stylesTransparent : styles,
    iconStyles
  ], MODULE_ID);

  syncPrivacyState();

  onRequest('pages/journal.php', applyClassToNames);

  onActivation(MODULE_ID, syncPrivacyState);

  onDeactivation(MODULE_ID, () => {
    isPrivacyEnabled = false;
    removeIcon();
    disablePrivacy();
  });

  onSettingsChange('journal-privacy.show-toggle-icon', {
    enable: syncPrivacyState,
    disable: syncPrivacyState,
  });
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
  load: init,
  settings,
};
