import { addStyles, getFlag, getSetting } from '@utils';

import journalFullMiceImages from './modules/journal-full-mice-images';
import journalGoldAndPoints from './modules/journal-gold-and-points';
import journalHistory from './modules/journal-history';
import journalIcons from './modules/journal-icons';
import journalList from './modules/journal-list';
import journalReplacements from './modules/journal-replacements';
import journalStyles from './modules/journal-styles';

import listAndIconsStyles from './styles/list-and-icons.css';

const featureManifest = [
  { id: 'journal-styles', setting: 'better-journal.styles', default: true, load: journalStyles },
  {
    id: 'journal-list',
    setting: 'better-journal.list',
    default: true,
    load: () => {
      if (getSetting('better-journal.icons', true) || getFlag('better-journal-icons-minimal')) {
        addStyles(listAndIconsStyles, 'better-journal-list-and-icons');
      }

      return journalList();
    },
  },
  { id: 'journal-icons', setting: 'better-journal.icons', default: true, load: journalIcons },
  { id: 'journal-replacements', setting: 'better-journal.replacements', default: true, load: journalReplacements },
  { id: 'journal-gold-and-points', setting: 'better-journal.gold-and-points', default: true, load: journalGoldAndPoints },
  { id: 'journal-history', setting: 'better-journal.journal-history', default: true, load: journalHistory },
  { id: 'journal-full-mice-images', setting: 'better-journal.full-mice-images', default: false, load: journalFullMiceImages },
];

export default featureManifest;
