import { addStyles } from '@utils';

import baseItemCounters from './modules/base-item-counters';
import codex from './modules/codex';
import hideTooltips from './modules/hide-tooltips';
import largerSkinImages from './modules/larger-skin-images';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import randomSkinButton from './modules/random-skin-button';
import realBaseStats from './modules/real-base-stats';
import showUnownedSkins from './modules/show-unowned-skins';
import skinPreviewBase from './modules/skin-preview-base';
import specialEffects from './modules/special-effects';

import largerCodicesStyles from './modules/larger-codices/styles.css';
import trapGradientBackgroundStyles from './modules/trap-gradient-background/styles.css';

const featureManifest = [
  { id: 'random-skin-button', load: randomSkinButton },
  { id: 'skin-preview-base', load: skinPreviewBase },
  { id: 'codex', load: codex },
  { id: 'quick-filters-and-sort', setting: 'better-trap-selector.quick-filters-and-sort', default: true, load: quickFiltersAndSort },
  { id: 'special-effects', setting: 'better-trap-selector.special-effects', default: true, load: specialEffects },
  { id: 'hide-tooltips', setting: 'better-trap-selector.hide-tooltips', default: false, load: hideTooltips },
  { id: 'larger-skin-images', setting: 'better-trap-selector.larger-skin-images', default: true, load: largerSkinImages },
  { id: 'show-unowned-skins', setting: 'better-trap-selector.show-unowned-skins', default: true, load: showUnownedSkins },
  {
    id: 'trap-gradient-background',
    setting: 'better-trap-selector.trap-gradient-background',
    default: false,
    load: () => addStyles(trapGradientBackgroundStyles, 'better-trap-selector-trap-gradient-background'),
  },
  {
    id: 'larger-codices',
    setting: 'better-trap-selector.larger-codices',
    default: true,
    load: () => addStyles(largerCodicesStyles, 'better-trap-selector-larger-codices'),
  },
  { id: 'real-base-stats', setting: 'better-trap-selector.real-base-stats', default: true, load: realBaseStats },
  { id: 'base-item-counters', setting: 'better-trap-selector.base-item-counters', default: true, load: baseItemCounters },
];

export default featureManifest;
