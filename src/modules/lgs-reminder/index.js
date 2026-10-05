import { addStyles, getSetting, humanizeTime, makeElement, onModuleToggle, onSettingsChange } from '@utils';

import settings from './settings';
import styles from './styles.css';

/**
 * Get the shield end date time.
 *
 * @return {Date} The shield end date time.
 */
const getShieldEndDateTime = () => {
  const shieldExpiry = user.shield_expiry;
  if (!shieldExpiry) {
    return new Date(Date.now() - 60 * 1000); // 1 minute ago to make it expired.
  }

  // make a new date object
  const expiry = Date.parse(shieldExpiry);

  // subtract 5 hours from the expiry time for some reason.
  const realExpiry = expiry - offset;

  return new Date(realExpiry);
};

/**
 * Get the remaining shield time.
 *
 * @return {number} The time in milliseconds.
 */
const getShieldTime = () => {
  const expiry = getShieldEndDateTime();
  const now = new Date();

  return Math.floor(expiry - now);
};

/**
 * Get the formatted shield time.
 *
 * @return {string} The formatted shield time.
 */
const getShieldTimeFormatted = () => {
  const time = getShieldTime();
  if (time <= 0) {
    return 'Expired';
  }

  let units = ['y', 'mo', 'w', 'd', 'h'];

  if (getSetting('lgs-reminder.days-and-lower') || time < 60 * 60 * 1000) {
    units = ['d', 'h', 'm'];
  }

  const duration = humanizeTime(time, { units });

  return duration;
};

/**
 * Update the LGS reminder.
 *
 * @param {HTMLElement} el The reminder element.
 */
const updateLgsReminder = (el) => {
  const time = getShieldTime();

  // Warn when there's less than 2 days left, and warn harder when there's less than 1 hour left.
  el.classList.toggle('lgs-warning', time <= 2 * 24 * 60 * 60 * 1000);
  el.classList.toggle('lgs-danger', time <= 60 * 60 * 1000);

  el.innerText = getShieldTimeFormatted();
};

/**
 * Main function.
 */
const main = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield.golden');
  if (!shieldEl) {
    return;
  }

  const newStyle = getSetting('lgs-reminder.new-style', false);

  let wrapper;
  let reminder;
  if (newStyle) {
    wrapper = makeElement('div', 'mousehunt-improved-lgs-reminder-wrapper');
    reminder = makeElement('div', 'mousehunt-improved-lgs-reminder-new');
  } else {
    reminder = makeElement('div', 'mousehunt-improved-lgs-reminder');
  }

  // Set the title to be the final time and remaining time.
  const endDate = getShieldEndDateTime().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });

  reminder.title = `LGS Expires on ${endDate} (${getShieldTimeFormatted()} remaining)`;

  if (newStyle) {
    const existing = document.querySelector('.mousehunt-improved-lgs-reminder-wrapper');
    if (existing) {
      existing.remove();
    }

    wrapper.append(reminder);
    shieldEl.after(wrapper);
  } else {
    const existing = document.querySelector('.mousehunt-improved-lgs-reminder');
    if (existing) {
      existing.remove();
    }

    shieldEl.append(reminder);
  }

  currentReminder = reminder;
  updateLgsReminder(reminder);
};

/**
 * Remove the reminder from the HUD.
 */
const removeReminder = () => {
  document.querySelectorAll('.mousehunt-improved-lgs-reminder, .mousehunt-improved-lgs-reminder-wrapper').forEach((el) => el.remove());
  currentReminder = null;
};

/**
 * Set the offset for the shield time.
 */
const setOffset = () => {
  const userShieldExpiry = new Date(Date.parse(user.shield_expiry));
  const userShieldSeconds = new Date(new Date().setSeconds(new Date().getSeconds() + user.shield_seconds));
  const difference = userShieldExpiry - userShieldSeconds;

  // round to the nearest second
  offset = Math.round(difference / 1000) * 1000;
};

let offset;
let currentReminder;

/**
 * Initialize the module.
 */
const init = async () => {
  // Only load if the user has LGS.
  if (!user.has_shield) {
    return;
  }

  setOffset();

  addStyles(styles, 'lgs-reminder');
  main();

  document.addEventListener('horn-countdown-tick-minute', () => {
    if (currentReminder?.isConnected) {
      updateLgsReminder(currentReminder);
    }
  });

  onSettingsChange('lgs-reminder.new-style', () => {
    removeReminder();
    main();
  });

  onSettingsChange('lgs-reminder.days-and-lower', () => {
    if (currentReminder?.isConnected) {
      updateLgsReminder(currentReminder);
    }
  });

  onModuleToggle('lgs-reminder', {
    enable: main,
    disable: removeReminder,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'lgs-reminder',
  name: 'Lucky Golden Shield Timer',
  type: 'hunting-traps',
  description: 'Show your LGS duration in the HUD and warn you when it’s about to expire.',
  default: false,
  liveToggle: true,
  load: init,
  settings,
};
