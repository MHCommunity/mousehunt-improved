import { addUIStyles, getFlag } from '@/utils';

import delayTooltipStyles from './modules/delayed-tooltips.css';
import eventHorn from './modules/event-horn';
import rankupForecaster from './modules/rank-up-forecaster';
import trollMode from './modules/troll-mode';
import twitter from './modules/twitter';

/**
 * Initialize the module.
 */
export default () => {
  const features = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: twitter },
    { id: 'rankup-forecaster', load: rankupForecaster },
    { id: 'delayed-tooltips', load: () => addUIStyles(delayTooltipStyles) },
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
