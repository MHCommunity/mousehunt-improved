import { addHudStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import styles from './styles.css';

const changeColors = () => {
  const popup = document.querySelector('.superBrieFactoryVendingMachinePopup');
  if (! popup) {
    return;
  }

  const can = makeElement('div', 'vending-machine-can');
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

const updateDateTooltip = () => {
  const tooltip = document.querySelector('.superBrieFactoryHUD-dateCountdownMiniWrapper.mousehuntTooltipParent .mousehuntTooltip');
  if (! tooltip) {
    return;
  }

  if (tooltip.getAttribute('data-changed')) {
    return;
  }

  tooltip.classList.add('bottom');
  tooltip.classList.remove('top');
  tooltip.setAttribute('data-changed', 'true');
};

const spaceNumbers = (text) => {
  return text.replaceAll(/(\d+)/g, ' $1 ').trim();
};

const updateDateDates = () => {
  const badge = document.querySelector('.superBrieFactoryHUD-dateCountdownMiniContainer .dateCountdownMini__remainingText');
  if (badge) {
    if (badge.getAttribute('data-changed')) {
      return;
    }

    badge.innerHTML = spaceNumbers(badge.innerHTML);
    badge.setAttribute('data-changed', 'true');
  }

  const tooltip = document.querySelector('.superBrieFactoryHUD-dateCountdownMiniWrapper.mousehuntTooltipParent .mousehuntTooltip .dateCountdown__datesContainer .dateCountdown__remainingText');
  if (tooltip) {
    if (tooltip.getAttribute('data-changed')) {
      return;
    }

    tooltip.innerHTML = spaceNumbers(tooltip.innerHTML);
    tooltip.setAttribute('data-changed', 'true');
  }
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
    updateDateTooltip();
    updateDateDates();
  }, [100, 500, 1000]);

  onDialogShow('superBrieFactoryVendingMachinePopup', () => {
    setTimeout(changeColors, 500);
  });
};

export {
  birthdayGlobal,
  birthdayLocation
};
