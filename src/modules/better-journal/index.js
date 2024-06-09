import { addStyles, getSetting } from '@utils';

import journalGoldAndPoints from './modules/journal-gold-and-points';
import journalHistory from './modules/journal-history';
import journalIcons from './modules/journal-icons';
import journalIconsMinimal from './modules/journal-icons-minimal';
import journalItemColors from './modules/journal-item-colors';
import journalList from './modules/journal-list';
import journalReplacements from './modules/journal-replacements';
import journalStyles from './modules/journal-styles';

import listAndIconsStyles from './styles/list-and-icons.css';
import styles from './styles/styles.css';

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
    history: getSetting('better-journal.journal-history', true),
  };

  const modules = [
    { enabled: enabled.styles, load: journalStyles },
    { enabled: enabled.list, load: () => {
      journalList();
      if (enabled.icons || enabled.iconsMinimal) {
        addStyles(listAndIconsStyles, 'better-journal-list-and-icons');
      }
    } },
    { enabled: enabled.icons, load: () => {
      journalIcons();
      journalIconsMinimal();
    } },
    { enabled: enabled.iconsMinimal, load: () => {
      if (! enabled.icons) {
        journalIconsMinimal();
      }
    } },
    { enabled: enabled.replacements, load: journalReplacements },
    { enabled: enabled.goldAndPoints, load: journalGoldAndPoints },
    { enabled: enabled.itemColors, load: journalItemColors },
    { enabled: enabled.history, load: journalHistory },
  ];

  for (const module of modules) {
    if (module.enabled) {
      module.load();
    }
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-journal',
  name: 'Better Journal',
  type: 'better',
  default: true,
  description: 'Modify the journal text, layout, and styling.',
  load: init,
  settings,
};
