import {
  addStyles,
  makeElement,
  onDialogShow,
  onEvent,
  onRequest,
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

const rightclickToFlag = () => {
  const board = document.querySelector('.eggSweeper');
  if (! board) {
    return;
  }

  const isFlagMode = board.classList.contains('flags');
  if (isFlagMode) {
    return;
  }

  const spaces = board.querySelectorAll('.eggSweeper-board-row-cell');
  if (! spaces) {
    return;
  }

  // Add an event listener to each space and if it is right-clicked, toggle the class on the parent.
  spaces.forEach((space) => {
    space.addEventListener('contextmenu', async (e) => {
      const cell = space.querySelector('a');
      if (! cell) {
        return;
      }

      e.preventDefault();

      hg.views.EggstremeEggscavationView.setFlagMode();
      hg.views.EggstremeEggscavationView.pickTile(cell);
      hg.views.EggstremeEggscavationView.setShovelMode();
    });
  });
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

  onDialogShow('eggSweeperPopup', () => {
    setTimeout(rightclickToFlag, 1000);
  });

  onRequest('events/eggstreme_eggscavation.php', (request, data) => {
    if ('show_field' === data.action) {
      setTimeout(rightclickToFlag, 1000);
    }
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
