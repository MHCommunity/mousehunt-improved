import {
  addBodyClass,
  addIconToMenu,
  addStyles,
  getSetting,
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
      const span = document.createElement('span');
      span.classList.add('mh-journal-privacy-name');
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
        disablePrivacy();
      } else {
        enablePrivacy();
      }
    },
  });
};

/**
 * Remove the toggle icon from the menu.
 */
const removeIcon = () => {
  if (getSetting('journal-privacy.show-toggle-icon', false)) {
    return;
  }

  const icon = document.querySelector('#mousehunt-improved-journal-privacy');
  if (icon) {
    icon.style.display = 'none';
    icon.style.visibility = 'hidden';
  }
};

let isPrivacyEnabled = true;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    getSetting('journal-privacy.transparent', false) ? stylesTransparent : styles,
    iconStyles
  ], 'journal-privacy');

  enablePrivacy();
  if (getSetting('journal-privacy.show-toggle-icon', false)) {
    addIcon();
    disablePrivacy();
  }

  onRequest('pages/journal.php', applyClassToNames);

  onActivation(() => {
    addIcon();
    enablePrivacy();
  });

  onDeactivation(() => {
    removeIcon();
    disablePrivacy();
  });

  onSettingsChange('journal-privacy.show-toggle-icon', {
    enable: addIcon,
    disable: removeIcon,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'journal-privacy',
  name: 'Journal Privacy',
  type: 'element-hiding',
  default: false,
  description: 'Hide player names in the journal. Good for screenshots that maintain privacy.',
  load: init,
  settings,
};
