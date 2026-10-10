import { getFlag } from '@utils';

import infiniteSuperBrie from './modules/infinite-super-brie';
import rankupForecaster from './modules/rank-up-forecaster';
import showFabledProgressBarText from './modules/fake-fabled';
import socialNoop from './modules/social';

const featureManifest = [
  { id: 'social-noop', condition: () => getFlag('social-noop') || getFlag('twitter'), load: socialNoop },
  { id: 'rank-up-forecaster', condition: () => !getFlag('userscript-styles-no-rankup-forecaster'), load: rankupForecaster },
  { id: 'fake-fabled', condition: () => getFlag('fake-fabled'), load: showFabledProgressBarText },
  { id: 'infinite-super-brie', condition: () => getFlag('infinite-super-brie'), load: infiniteSuperBrie },
];

export default featureManifest;
