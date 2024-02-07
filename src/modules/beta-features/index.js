import { debuglog, getFlag } from '@utils';

import journalIcons from './modules/journal-icons';
import journalIconsAll from './modules/journal-icons-all';
import journalList from './modules/journal-list';
import raffle from './modules/raffle';
import rankupForecaster from './modules/rank-up-forecaster';
import socialNoop from './modules/social';
import trollMode from './modules/troll-mode';

/**
 * Initialize the module.
 */
const init = async () => {
  const defaultDisabledFeatures = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: socialNoop },
    { id: 'social-noop', load: socialNoop },
    { id: 'raffle', load: raffle },
    { id: 'journal-icons', load: journalIcons },
    { id: 'journal-icons-all', load: journalIconsAll },
    { id: 'journal-list', load: journalList },
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
  type: 'required',
  load: init,
};
