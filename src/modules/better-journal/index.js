import {
  addStyles,
  doEvent,
  getCurrentPage,
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
import progressLog from './progress-log';

import listAndIconsStyles from './list-and-icons.css';

import settings from './settings';

let isProcessing = false;
const processEntries = async () => {
  if (! ('camp' === getCurrentPage() || 'hunterprofile' === getCurrentPage())) {
    return;
  }

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

const processSingleEntries = async () => {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  const entriesEl = document.querySelectorAll('.jsingle .entry');
  for (const entry of entriesEl) {
    doEvent('journal-entry', entry);
  }
  isProcessing = false;
};

/**
 * Initialize the module.
 */
const init = async () => {
  const enabled = {
    styles: getSetting('better-journal.styles', true),
    list: getSetting('better-journal.list', false),
    icons: getSetting('better-journal.icons'),
    iconsMinimal: getSetting('better-journal.icons-minimal'),
    replacements: getSetting('better-journal.replacements', true),
    goldAndPoints: getSetting('better-journal.gold-and-points', true),
    itemColors: getSetting('better-journal.item-colors', true),
    progressLog: getSetting('better-journal.progress-log', true),
  };

  if (enabled.styles) {
    journalStyles();
  }

  if (enabled.list) {
    journalList();
    if (enabled.icons || enabled.iconsMinimal) {
      addStyles(listAndIconsStyles, 'better-journal-list-and-icons');
    }
  }

  if (enabled.icons) {
    journalIcons();
    journalIconsMinimal();
  } else if (enabled.iconsMinimal) {
    journalIconsMinimal();
  }

  if (enabled.replacements) {
    journalReplacements();
  }

  if (enabled.goldAndPoints) {
    journalGoldAndPoints();
  }

  if (enabled.itemColors) {
    journalItemColors();
  }

  if (enabled.progressLog) {
    progressLog();
  }

  journalHistory(getSetting('better-journal.history', getFlag('journal-history', true)));

  processEntries();
  onRequest('*', (data) => {
    setMultipleTimeout(processEntries, [100, 500, 1000]);

    if (data.journal_markup && data.journal_markup.length > 0) {
      processSingleEntries(data.journal_markup);
    }
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
