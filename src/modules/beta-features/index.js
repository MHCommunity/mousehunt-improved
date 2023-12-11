import { getFlag } from '@/utils';

import eventHorn from './modules/event-horn';
import rankupForecaster from './modules/rank-up-forecaster';
import trollMode from './modules/troll-mode';
import twitter from './modules/twitter';

/**
 * Initialize the module.
 */
const init = () => {
  const features = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: twitter },
    { id: 'rankup-forecaster', load: rankupForecaster },
    { id: 'birthday-horn', load: () => eventHorn('birthday') },
    { id: 'halloween-horn', load: () => eventHorn('halloween') },
    { id: 'lunar-new-year-horn', load: () => eventHorn('lunar-new-year') },
  ];

  for (const feature of features) {
    if (getFlag(feature.id)) {
      feature.load();
    }
  }
};

export default {
  id: 'beta-features',
  type: 'required',
  load: init,
};
