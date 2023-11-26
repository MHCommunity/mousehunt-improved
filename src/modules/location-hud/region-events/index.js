import {
  addHudStyles,
  onRequest
} from '../../utils';

import halloweenStyles from './halloween/styles.css';

const undisableCheese = () => {
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

export default () => {
  if ('halloween_event_location' === getCurrentLocation()) {
    addHudStyles(halloweenStyles);
    undisableCheese();
    onRequest(undisableCheese);
  }
};
