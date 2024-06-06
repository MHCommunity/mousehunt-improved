import { addHudStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import { updateDateDates, updateDateTooltip } from '../shared';

import styles from './styles.css';

/**
 * Update the hud.
 */
const changeColors = () => {
  const popup = document.querySelector('.superBrieFactoryVendingMachinePopup');
  if (! popup) {
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

  can.addEventListener('click', updateColor);
  updateColor();
  popup.append(can);

  const hat = makeElement('div', 'vending-machine-hat');

  // Get the hat element
  let initialMouseX = 0;
  let initialHatX = 0;

  // Flag to check if dragging is happening
  let isDragging = false;

  // Add event listeners
  hat.addEventListener('mousedown', (event) => {
    isDragging = true;
    initialMouseX = event.clientX;
    initialHatX = Number.parseInt(window.getComputedStyle(hat).left, 10);
  });

  document.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const deltaX = event.clientX - initialMouseX;
      const newPosition = initialHatX + deltaX;

      if (newPosition >= 25 && newPosition <= 415) {
        hat.style.left = `${newPosition}px`;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

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
    updateDateDates('.superBrieFactoryHUD-dateCountdownMiniContainer .dateCountdownMini__remainingText', '.superBrieFactoryHUD-dateCountdownMiniWrapper.mousehuntTooltipParent .mousehuntTooltip .dateCountdown__datesContainer .dateCountdown__remainingText');
  }, [100, 500, 1000]);

  onDialogShow('superBrieFactoryVendingMachinePopup', () => {
    setTimeout(changeColors, 500);
  });
};

export {
  birthdayGlobal,
  birthdayLocation
};
