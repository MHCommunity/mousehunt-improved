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

import iconStyles from './icon.css';
import styles from './styles.css';
import stylesTransparent from './styles-transparent.css';

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

const enablePrivacy = () => {
  addBodyClass('mh-journal-privacy-enabled', true);
  removeBodyClass('mh-journal-privacy-disabled');
  applyClassToNames();
};

const disablePrivacy = () => {
  removeBodyClass('mh-journal-privacy-enabled');
  addBodyClass('mh-journal-privacy-disabled', true);
  removeClassFromNames();
};

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

export default {
  id: 'journal-privacy',
  name: 'Journal Privacy',
  type: 'element-hiding',
  default: false,
  description: 'Hides player names in the journal. Good for screenshots that won\'t dox them.',
  load: init,
  settings,
};
