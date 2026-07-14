import { addStyles, getSetting } from '@utils';

import journalBehaviors from './behaviors';
import journalFullMiceImages from './modules/journal-full-mice-images';
import journalGoldAndPoints from './modules/journal-gold-and-points';
import journalHistory from './modules/journal-history';
import journalIcons from './modules/journal-icons';
import journalList from './modules/journal-list';
import journalReplacements from './modules/journal-replacements';
import journalStyles from './modules/journal-styles';
import loadStyleBundles from './style-bundles';

import listAndIconsStyles from './styles/list-and-icons.css';
import styles from './styles/styles.css';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-journal');
  journalBehaviors();
  loadStyleBundles();

  const enabled = {
    styles: getSetting('better-journal.styles', true),
    list: getSetting('better-journal.list', true),
    icons: getSetting('better-journal.icons', true),
    replacements: getSetting('better-journal.replacements', true),
    goldAndPoints: getSetting('better-journal.gold-and-points', true),
    history: getSetting('better-journal.journal-history', true),
    fullMiceImages: getSetting('better-journal.full-mice-images', false),
  };

  const modules = [
    { enabled: enabled.styles, load: journalStyles },
    { enabled: enabled.list, load: () => {
      if (enabled.icons || getSetting('better-journal.icons-minimal', false)) {
        addStyles(listAndIconsStyles, 'better-journal-list-and-icons');
      }

      return journalList();
    } },
    { enabled: enabled.icons, load: journalIcons },
    { enabled: enabled.replacements, load: journalReplacements },
    { enabled: enabled.goldAndPoints, load: journalGoldAndPoints },
    { enabled: enabled.history, load: journalHistory },
    { enabled: enabled.fullMiceImages, load: journalFullMiceImages },
  ];

  await Promise.all(modules.filter((module) => module.enabled).map((module) => module.load()));
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-journal',
  name: 'Better Journal',
  type: 'journal-progress-stats',
  default: true,
  description: 'Modify the journal text, layout, and styling.',
  load: init,
  settings,
};
