import { addStyles, getFlag } from '@utils';

import baseItemCounters from './modules/base-item-counters';
import hideTooltips from './modules/hide-tooltips';
import largerSkinImages from './modules/larger-skin-images';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import randomSkinButton from './modules/random-skin-button';
import realBaseStats from './modules/real-base-stats';
import showUnownedSkins from './modules/show-unowned-skins';
import skinPreviewBase from './modules/skin-preview-base';
import specialEffects from './modules/special-effects';

import trapGradientBackgroundStyles from './modules/trap-gradient-background/styles.css';

const featureManifest = [
  { id: 'random-skin-button', load: randomSkinButton },
  { id: 'skin-preview-base', load: skinPreviewBase },
  { id: 'quick-filters-and-sort', setting: 'better-trap-selector.quick-filters-and-sort', default: true, load: quickFiltersAndSort },
  { id: 'special-effects', setting: 'better-trap-selector.special-effects', default: true, load: specialEffects },
  { id: 'hide-tooltips', load: hideTooltips },
  { id: 'larger-skin-images', condition: () => !getFlag('better-trap-selector-no-larger-skin-images'), load: largerSkinImages },
  { id: 'show-unowned-skins', condition: () => !getFlag('better-trap-selector-no-unowned-skins'), load: showUnownedSkins },
  {
    id: 'trap-gradient-background',
    setting: 'better-trap-selector.trap-gradient-background',
    default: false,
    load: () => addStyles(trapGradientBackgroundStyles, 'better-trap-selector-trap-gradient-background'),
  },
  { id: 'real-base-stats', setting: 'better-trap-selector.real-base-stats', default: true, load: realBaseStats },
  { id: 'base-item-counters', setting: 'better-trap-selector.base-item-counters', default: true, load: baseItemCounters },
];

export default featureManifest;
