import { debuglog, getFlag } from '@utils';

import eventHorn from './modules/event-horn';
import rankupForecaster from './modules/rank-up-forecaster';
import trollMode from './modules/troll-mode';
import twitter from './modules/twitter';

/**
 * Initialize the module.
 */
const init = async () => {
  const defaultDisabledFeatures = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: twitter },
    { id: 'birthday-horn', load: () => eventHorn('birthday') },
    { id: 'halloween-horn', load: () => eventHorn('halloween') },
    { id: 'great-winter-hunt-horn', load: () => eventHorn('greatWinterHunt') },
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
