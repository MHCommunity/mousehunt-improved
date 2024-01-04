import { addStyles, makeElement, onDialogShow } from '@utils';

import styles from './styles.css';

import gwh from './great-winter-hunt';
import halloween from './halloween';

const adventCalendarPopup = () => {
  const suffix = document.querySelector('#overlayPopup .suffix');
  if (! suffix) {
    return;
  }

  const existingToggle = document.querySelector('.toggle-advent-calendar-spoilers');
  if (existingToggle) {
    return;
  }

  const toggleBtn = makeElement('button', ['mousehuntActionButton', 'tiny', 'toggle-advent-calendar-spoilers']);
  makeElement('span', '', 'View unblurred calendar', toggleBtn);
  toggleBtn.setAttribute('data-enabled', 'false');

  toggleBtn.addEventListener('click', () => {
    const popup = document.querySelector('#overlayPopup');
    if (! popup) {
      return;
    }

    popup.classList.toggle('advent-calendar-spoilers');

    const enabled = toggleBtn.getAttribute('data-enabled');
    if ('true' === enabled) {
      toggleBtn.setAttribute('data-enabled', 'false');
      toggleBtn.querySelector('span').innerText = 'View unblurred calendar';
    } else {
      toggleBtn.setAttribute('data-enabled', 'true');
      toggleBtn.querySelector('span').innerText = 'Hide unblurred calendar';
    }
  });

  suffix.append(toggleBtn);
};

const maybeHideAdventCalendarInMenu = () => {
  // If it's not December, then hide the advent calendar in the menu.
  const now = new Date();
  if (now.getMonth() !== 11) {
    return '.mousehuntHeaderView-gameTabs .menuItem.adventCalendar { display: none; }';
  }

  return '';
};

export default (location) => {
  switch (location) {
  case 'halloween_event_location':
    halloween();
    break;
  case 'winter_hunt_grove':
  case 'winter_hunt_workshop':
  case 'winter_hunt_fortress':
    gwh();
    break;
  default:
    break;
  }

  // Need to fire it always because the showdown styles are always loaded
  addStyles([
    styles,
    maybeHideAdventCalendarInMenu()
  ]);

  onDialogShow(adventCalendarPopup, 'adventCalendarPopup');
};
