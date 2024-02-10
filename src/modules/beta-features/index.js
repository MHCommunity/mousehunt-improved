import { debuglog, getFlag } from '@utils';

import journalHistory from './modules/journal-history';
import journalIcons from './modules/journal-icons';
import journalIconsAll from './modules/journal-icons-all';
import journalList from './modules/journal-list';
import raffle from './modules/raffle';
import rankupForecaster from './modules/rank-up-forecaster';
import socialNoop from './modules/social';
import ssdbTeeth from './modules/ssdb-teeth';
import trollMode from './modules/troll-mode';

import settings from './settings';

/**
 * Initialize the module.
 */
const init = async () => {
  const defaultDisabledFeatures = [
    { id: 'journal-history', load: journalHistory },
    { id: 'journal-icons-all', load: () => {
      journalIcons();
      journalIconsAll();
    } },
    { id: 'journal-icons', load: journalIcons },
    { id: 'journal-list', load: journalList },
    { id: 'lol-gottem', load: trollMode },
    { id: 'raffle', load: raffle },
    { id: 'social-noop', load: socialNoop },
    { id: 'ssdb-teeth', load: ssdbTeeth },
    { id: 'twitter', load: socialNoop },
  ];

  const defaultEnabledFeatures = [
    { id: 'rank-up-forecaster', load: rankupForecaster },
  ];

  const loaded = [];

  defaultDisabledFeatures.forEach((feature) => {
    if (getFlag(feature.id)) {
      loaded.push(feature.id);
      feature.load();
    }
  });

  defaultEnabledFeatures.forEach((feature) => {
    if (! getFlag(feature.id)) {
      loaded.push(feature.id);
      feature.load();
    }
  });

  debuglog('beta-features', 'Loaded features:', loaded);
};

export default {
  id: 'beta-features',
  type: 'advanced',
  alwaysLoad: true,
  load: init,
  settings,
};
