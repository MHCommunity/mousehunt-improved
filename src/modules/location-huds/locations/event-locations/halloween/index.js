import { addHudStyles, onRequest } from '@utils';

import { spookyShuffleTracker } from './spooky-shuffle-tracker';

import styles from './styles.css';

/**
 * Remove the disabled class from the cheese.
 */
const unDisableCheese = () => {
  const armButtons = document.querySelectorAll('.halloweenBoilingCauldronHUD-bait');
  armButtons.forEach((armButton) => {
    armButton.classList.remove('disabled');
    const link = armButton.querySelector('a.disabled');
    if (link) {
      link.classList.remove('disabled');
    }

    const tooltipLink = armButton.querySelector('.halloweenBoilingCauldronHUD-bait-tooltipContent a.disabled');
    if (tooltipLink) {
      tooltipLink.classList.remove('disabled');
    }
  });
};

/**
 * Always active.
 */
const halloweenGlobal = async () => {
  spookyShuffleTracker();
};

/**
 * Only active at the event location.
 */
const halloweenLocation = async () => {
  addHudStyles(styles);
  unDisableCheese();
  onRequest('*', unDisableCheese);
};

export {
  halloweenGlobal,
  halloweenLocation
};
