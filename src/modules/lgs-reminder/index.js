import humanizeDuration from 'humanize-duration';

import {
  addStyles,
  getSetting,
  makeElement,
  onActivation,
  onDeactivation,
  onEvent,
  onSettingsChange,
  sleep
} from '@utils';

import settings from './settings';
import styles from './styles.css';

const humanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
});

const isExact = () => {
  return getSetting('lgs-reminder.show-seconds');
};

const getShieldEndDateTime = () => {
  const shieldExpiry = user.shield_expiry;
  if (! shieldExpiry) {
    return;
  }

  // make a new date object
  const expiry = Date.parse(shieldExpiry);

  // subtract 5 hours from the expiry time for some reason.
  const realExpiry = expiry - offset;

  return new Date(realExpiry);
};

const getShieldTime = () => {
  const expiry = getShieldEndDateTime();
  const now = new Date();

  // get the difference in seconds
  return Math.floor((expiry - now));
};

const getShieldTimeFormatted = () => {
  const time = getShieldTime();
  if (! time) {
    return '';
  }

  let units = ['y', 'mo', 'w', 'd', 'h', 'm'];

  if (getSetting('lgs-reminder.days-and-lower')) {
    units = ['d', 'h', 'm'];
  }

  if (isExact()) {
    units.push('s');
  }

  const duration = humanizer(time, {
    round: true,
    units,
    spacer: '',
    delimiter: ' ',
  });

  return duration;
};

const updateLgsReminder = (el) => {
  const time = getShieldTime();

  // Check if we have less than 2 days left.
  if (time <= 60 * 60 * 24 * 2) {
    el.classList.add('lgs-warning');
  }

  // If we have less than 1 hour left, then add another warning.
  if (time <= 60 * 60) {
    el.classList.add('lgs-danger');
  }

  el.innerText = getShieldTimeFormatted();
};

const main = () => {
  startingTime = getShieldTime();

  const shieldEl = document.querySelector('.mousehuntHud-shield.golden');
  if (! shieldEl) {
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

  const exact = isExact();
  if (exact) {
    reminder.classList.add('exact');
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

  updateLgsReminder(reminder);

  if (isExact()) {
    onEvent('horn-countdown-tick', async () => {
      await sleep(500);
      updateLgsReminder(reminder);
    });
  } else {
    onEvent('horn-countdown-tick-minute', () => {
      updateLgsReminder(reminder);
    });
  }
};

const setOffset = () => {
  const userShieldExpiry = new Date(Date.parse(user.shield_expiry));
  const userShieldSeconds = new Date(new Date().setSeconds(new Date().getSeconds() + user.shield_seconds));
  const difference = userShieldExpiry - userShieldSeconds;

  // round to the nearest second
  offset = Math.round(difference / 1000) * 1000;
};

let offset;

/**
 * Initialize the module.
 */
const init = async () => {
  // Only load if the user has LGS.
  if (! user.has_shield) {
    return;
  }

  setOffset();

  addStyles(styles, 'lgs-reminder');
  main();

  onSettingsChange('lgs-reminder.new-style', () => {
    const selectors = [
      '.mousehunt-improved-lgs-reminder',
      '.mousehunt-improved-lgs-reminder-new',
      '.mousehunt-improved-lgs-reminder-wrapper',
    ];

    selectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.remove();
      }
    });

    main();
  });

  onActivation('lgs-reminder', main);

  onDeactivation('lgs-reminder', () => {
    const reminder = document.querySelector('.mousehunt-improved-lgs-reminder');
    if (reminder) {
      reminder.remove();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'lgs-reminder',
  name: `${getSetting('experiments.new-settings-styles-columns', false) ? 'LGS' : 'Lucky Golden Shield'} Duration & Reminder`,
  type: 'feature',
  description: 'Show your LGS duration in the HUD and warn you when it\'s about to expire.',
  default: false,
  load: init,
  settings,
};
