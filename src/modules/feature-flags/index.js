import { addUIStyles, getFlag } from '@/utils';

import delayTooltipStyles from './modules/delayed-tooltips.css';
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
  ];

  for (const feature of features) {
    if (getFlag(feature.id)) {
      feature.load();
    }
  }
};
