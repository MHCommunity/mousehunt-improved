import { addStyles, getFlag, getSetting } from '@utils';

import journalGoldAndPoints from './journal-gold-and-points';
import journalHistory from './journal-history';
import journalIcons from './journal-icons';
import journalIconsMinimal from './journal-icons-minimal';
import journalItemColors from './journal-item-colors';
import journalList from './journal-list';
import journalReplacements from './journal-replacements';
import journalStyles from './journal-styles';

import listAndIconsStyles from './list-and-icons.css';
import styles from './styles.css';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-journal');

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

  journalHistory(getSetting('better-journal.history', getFlag('journal-history', true)));
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
