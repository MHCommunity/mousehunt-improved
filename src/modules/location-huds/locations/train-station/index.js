import { addHudStyles, getSetting, saveSetting } from '@utils';

import styles from './styles.css';

const TRAIN_BOARD_MINIMIZED_SETTING = 'location-huds.train-station-board-minimized';

/**
 * Keep the native train board drawer in the state last selected by the user.
 *
 * The game calls its minimized state "expanded", so preserve that class rather
 * than the visual meaning of the board state.
 */
const persistTrainBoardState = () => {
  const hud = document.querySelector('#hudLocationContent .trainStationHUD');
  const toggle = hud?.querySelector('.trainButton.expand');
  if (!hud || !toggle) {
    return;
  }

  if (!toggle.dataset.mhiTrainBoardStateListener) {
    toggle.dataset.mhiTrainBoardStateListener = 'true';
    toggle.addEventListener('click', () => {
      setTimeout(() => {
        saveSetting(TRAIN_BOARD_MINIMIZED_SETTING, hud.classList.contains('expanded'));
      });
    });
  }

  if (getSetting(TRAIN_BOARD_MINIMIZED_SETTING, false) && !hud.classList.contains('expanded')) {
    toggle.click();
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  persistTrainBoardState();
};
