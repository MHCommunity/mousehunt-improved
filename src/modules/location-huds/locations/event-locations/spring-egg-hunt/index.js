import { addStyles, addSubmenuItem, makeElement, onDialogShow, onEvent, onRequest, setMultipleTimeout } from '@utils';

import { updateDateDates } from '../shared';
import { openEggHelper } from './egg-helper';

import styles from './styles.css';
import addHudListener from '../../../shared/hud-listener';

/**
 * Add a button to highlight missing eggs.
 */
const addUnfoundEggHighlight = () => {
  const tabContent = document.querySelector('.springHuntHUD-popup-tabContentContainer');
  if (!tabContent) {
    return;
  }

  const stats = tabContent.querySelector('.springHuntHUD-totalEggStats');
  if (!stats) {
    return;
  }

  const existingLink = stats.querySelector('.springHuntHUD-unfoundEggHighlight');
  if (existingLink) {
    return;
  }

  const highlightEl = makeElement('a', 'springHuntHUD-unfoundEggHighlight', 'Highlight missing');
  addHudListener(highlightEl, 'click', () => {
    if (tabContent.classList.contains('highlight')) {
      tabContent.classList.remove('highlight');
      highlightEl.innerText = 'Highlight missing';
    } else {
      tabContent.classList.add('highlight');
      highlightEl.innerText = 'Unhighlight missing';
    }
  });

  const links = makeElement('div', 'springHuntHUD-totalEggStats-links');
  links.append(highlightEl);
  stats.append(links);

  const helperEl = makeElement('a', 'springHuntHUD-openEggHelper', 'Egg Hunt Helper');
  addHudListener(helperEl, 'click', openEggHelper);

  links.append(helperEl);
};

/**
 * Run the addUnfoundEggHighlight function multiple times with a timeout.
 */
const addUnfoundEggHighlightWithTimeout = () => {
  setMultipleTimeout(() => {
    addUnfoundEggHighlight();
  }, [10, 500, 1000]);
};

/**
 * Add an event listener to each space and if it is right-clicked, toggle the class on the parent.
 */
const rightclickToFlag = () => {
  const board = document.querySelector('.eggSweeper');
  if (!board) {
    return;
  }

  const isFlagMode = board.classList.contains('flags');
  if (isFlagMode) {
    return;
  }

  const spaces = board.querySelectorAll('.eggSweeper-board-row-cell');
  if (!spaces) {
    return;
  }

  // Add an event listener to each space and if it is right-clicked, toggle the class on the parent.
  spaces.forEach((space) => {
    addHudListener(space, 'contextmenu', async (e) => {
      const cell = space.querySelector('a');
      if (!cell) {
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

  addSubmenuItem({
    menu: 'camp',
    label: 'Egg Hunt Helper',
    icon: 'https://www.mousehuntgame.com/images/items/convertibles/transparent_thumb/887162c61d0e01985ffc12e41c03d952.png',
    callback: openEggHelper,
  });

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

export { springEggHuntGlobal, springEggHuntLocation };
