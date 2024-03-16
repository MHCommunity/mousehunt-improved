import {
  doEvent,
  getFlag,
  getSetting,
  onRequest,
  setMultipleTimeout
} from '@utils';

import journalGoldAndPoints from './journal-gold-and-points';
import journalHistory from './journal-history';
import journalIcons from './journal-icons';
import journalIconsMinimal from './journal-icons-minimal';
import journalItemColors from './journal-item-colors';
import journalList from './journal-list';
import journalReplacements from './journal-replacements';
import journalStyles from './journal-styles';

import settings from './settings';

let isProcessing = false;
const processEntries = async () => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  const entries = document.querySelectorAll('.journal .entry');
  for (const entry of entries) {
    doEvent('journal-entry', entry);
  }

  doEvent('journal-entries', entries);

  isProcessing = false;
};

/**
 * Initialize the module.
 */
const init = async () => {
  if (getSetting('better-journal.styles', true)) {
    journalStyles();
  }

  journalHistory(getFlag('journal-history'));

  if (getSetting('better-journal.icons')) {
    journalIconsMinimal();
    journalIcons();
  }

  if (getSetting('better-journal.icons-minimal')) {
    journalIconsMinimal();
  }

  if (getSetting('better-journal.replacements', true)) {
    journalReplacements();
  }

  if (getSetting('better-journal.list', false)) {
    journalList();
  }

  if (getSetting('better-journal.gold-and-points', true)) {
    journalGoldAndPoints();
  }

  if (getSetting('better-journal.item-colors', true)) {
    journalItemColors();
  }

  processEntries();
  onRequest('*', () => {
    setMultipleTimeout(processEntries, [0, 100, 500]);
  });
};

export default {
  id: 'better-journal',
  name: 'Better Journal',
  type: 'better',
  default: true,
  description: 'Modify the journal text, layout, and styling.',
  load: init,
  settings,
};
