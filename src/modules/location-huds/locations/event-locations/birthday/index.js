import { addHudStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import { updateDateDates, updateDateTooltip } from '../shared';

import styles from './styles.css';
import addHudListener from '../../../shared/hud-listener';

// The hat being dragged, if any. One pair of document listeners serves every popup.
let hatDrag = null;
let hasHatDragListeners = false;

/**
 * Add the document listeners that move the hat while it's dragged.
 */
const addHatDragListeners = () => {
  if (hasHatDragListeners) {
    return;
  }

  hasHatDragListeners = true;

  document.addEventListener('mousemove', (event) => {
    if (!hatDrag) {
      return;
    }

    const newPosition = hatDrag.initialHatX + event.clientX - hatDrag.initialMouseX;
    if (newPosition >= 25 && newPosition <= 415) {
      hatDrag.hat.style.left = `${newPosition}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    hatDrag = null;
  });
};

/**
 * Update the hud.
 */
const changeColors = () => {
  const popup = document.querySelector('.superBrieFactoryVendingMachinePopup');
  if (!popup) {
    return;
  }

  const can = makeElement('div', 'vending-machine-can');

  /**
   * Update the color of the can.
   */
  const updateColor = () => {
    const hue = Math.floor(Math.random() * 360);
    can.style.filter = `hue-rotate(${hue}deg)`;
  };

  addHudListener(can, 'click', updateColor);
  updateColor();
  popup.append(can);

  const hat = makeElement('div', 'vending-machine-hat');

  addHudListener(hat, 'mousedown', (event) => {
    hatDrag = {
      hat,
      initialMouseX: event.clientX,
      initialHatX: Number.parseInt(window.getComputedStyle(hat).left, 10),
    };
  });

  addHatDragListeners();

  popup.append(hat);
};

/**
 * Always active.
 */
const birthdayGlobal = () => {}; // noop.

/**
 * Only active at the event location.
 */
const birthdayLocation = async () => {
  addHudStyles(styles);

  setMultipleTimeout(() => {
    updateDateTooltip('.superBrieFactoryHUD-dateCountdownMiniWrapper.mousehuntTooltipParent .mousehuntTooltip');
    updateDateDates(
      '.superBrieFactoryHUD-dateCountdownMiniContainer .dateCountdownMini__remainingText',
      '.superBrieFactoryHUD-dateCountdownMiniWrapper.mousehuntTooltipParent .mousehuntTooltip .dateCountdown__datesContainer .dateCountdown__remainingText'
    );
  }, [100, 500, 1000]);

  onDialogShow('superBrieFactoryVendingMachinePopup', () => {
    setTimeout(changeColors, 500);
  });
};

export { birthdayGlobal, birthdayLocation };
