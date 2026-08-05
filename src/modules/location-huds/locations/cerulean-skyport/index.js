import { addHudStyles, onRequest } from '@utils';

import { addAirshipRandomizer } from '../../shared/airship-randomizer';
import { addHullClick } from './ledger';
import { initCurrentRaidIndicator } from './current-raid';
import { initRaidFavorites } from './raid-favorites';

import fullWidthAirshipStyles from '../floating-islands/full-width-airship.css';
import styles from './styles.css';

/**
 * Toggle our HUD animations off when the hunter has checked the game's
 * Stabilize Airship option.
 */
const updateAnimationState = () => {
  const isDisabled = user?.quests?.QuestCeruleanSkyport?.airship?.is_animation_disabled ?? false;
  document.body.classList.toggle('mh-improved-skyport-animations-disabled', Boolean(isDisabled));
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([styles, fullWidthAirshipStyles], 'cerulean-skyport');
  addAirshipRandomizer();
  addHullClick();
  initRaidFavorites();
  initCurrentRaidIndicator();

  updateAnimationState();
  onRequest('*', updateAnimationState);
};
