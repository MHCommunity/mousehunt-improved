import { addStyles, setMultipleTimeout } from '@utils';

import { updateDateDates } from '../shared';

import styles from './styles.css';

/**
 * Always active.
 */
const springEggHuntGlobal = async () => {
  addStyles(styles, 'location-hud-events-spring-egg-hunt');

  setMultipleTimeout(() => {
    updateDateDates('.springEggHuntCampHUD-dateCountdownMiniContainer .dateCountdownMini__remainingText');
  }, [100, 500, 1000]);
};

/**
 * Only active at the event location.
 */
const springEggHuntLocation = async () => {
  // no-op.
};

export {
  springEggHuntGlobal,
  springEggHuntLocation
};
