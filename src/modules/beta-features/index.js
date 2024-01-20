import { debuglog, getFlag } from '@utils';

import eventHorn from './modules/event-horn';
import raffle from './modules/raffle';
import rankupForecaster from './modules/rank-up-forecaster';
import trollMode from './modules/troll-mode';

import socialNoop from '@/shared/social';

/**
 * Initialize the module.
 */
const init = async () => {
  const defaultDisabledFeatures = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: socialNoop },
    { id: 'social-noop', load: socialNoop },
    { id: 'birthday-horn', load: () => eventHorn('birthday') },
    { id: 'halloween-horn', load: () => eventHorn('halloween') },
    { id: 'great-winter-hunt-horn', load: () => eventHorn('greatWinterHunt') },
    { id: 'raffle', load: raffle },
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
