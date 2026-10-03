import { addHudStyles, onRequest } from '@utils';

import { addAirshipRandomizer } from '../../shared/airship-randomizer';
import { addHullClick } from './ledger';
import { initCurrentRaidIndicator } from './current-raid';
import { initIntelProgressBars } from './intel-progress';
import { initRaidFavorites } from './raid-favorites';

import fullWidthAirshipStyles from '../floating-islands/full-width-airship.css';
import animationStyles from './animations.css';
import styles from './styles.css';

let hasAnimations;

/**
 * Add the HUD styles, leaving out our animations when the hunter has checked
 * the game's Stabilize Airship option.
 *
 * @param {boolean} force Re-add the styles even if the animation state hasn't changed.
 */
const updateStyles = (force = false) => {
  const animationsEnabled = !user?.quests?.QuestCeruleanSkyport?.airship?.is_animation_disabled;
  if (!force && animationsEnabled === hasAnimations) {
    return;
  }

  hasAnimations = animationsEnabled;
  addHudStyles(animationsEnabled ? [styles, fullWidthAirshipStyles, animationStyles] : [styles, fullWidthAirshipStyles]);
};

/**
 * Initialize the module.
 */
export default async () => {
  updateStyles(true);
  addAirshipRandomizer();
  addHullClick();
  initRaidFavorites();
  initCurrentRaidIndicator();
  initIntelProgressBars();

  onRequest('*', () => updateStyles());
};
