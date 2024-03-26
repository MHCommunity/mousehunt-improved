import {
  addStyles,
  makeElement,
  onDialogShow,
  onEvent,
  setMultipleTimeout
} from '@utils';

import { updateDateDates } from '../shared';

import styles from './styles.css';

const addUnfoundEggHighlight = () => {
  const tabContent = document.querySelector('.springHuntHUD-popup-tabContentContainer');
  if (! tabContent) {
    return;
  }

  const stats = tabContent.querySelector('.springHuntHUD-totalEggStats');
  if (! stats) {
    return;
  }

  const existingLink = stats.querySelector('.springHuntHUD-unfoundEggHighlight');
  if (existingLink) {
    return;
  }

  const highlightEl = makeElement('a', 'springHuntHUD-unfoundEggHighlight', 'Highlight missing');
  highlightEl.addEventListener('click', () => {
    if (tabContent.classList.contains('highlight')) {
      tabContent.classList.remove('highlight');
      highlightEl.innerText = 'Highlight missing';
    } else {
      tabContent.classList.add('highlight');
      highlightEl.innerText = 'Unhighlight missing';
    }
  });

  stats.append(highlightEl);
};

const addUnfoundEggHighlightWithTimeout = () => {
  setMultipleTimeout(() => {
    addUnfoundEggHighlight();
  }, [10, 500, 1000]);
};

/**
 * Always active.
 */
const springEggHuntGlobal = async () => {
  addStyles(styles, 'location-hud-events-spring-egg-hunt');

  onDialogShow('springHuntPopup', () => {
    addUnfoundEggHighlightWithTimeout();
    onEvent('ajax_response', addUnfoundEggHighlightWithTimeout, true);
  });

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
