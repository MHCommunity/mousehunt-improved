import humanizeDuration from 'humanize-duration';

import { addStyles, getFlag, makeElement } from '@utils';

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
  return getFlag('lgs-reminder-exact');
};

const getShieldTime = () => {
  return user.shield_seconds * 1000;
};

const getShieldTimeFormattted = (time) => {
  const units = ['y', 'mo', 'w', 'd', 'h', 'm'];
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
  if (! time) {
    return;
  }

  const timeFmt = getShieldTimeFormattted(time);

  // Check if we have less than 2 days left.
  if (time <= 60 * 60 * 24 * 2) {
    el.classList.add('lgs-warning');
  }

  // If we have less than 1 hour left, then add another warning.
  if (time <= 60 * 60) {
    el.classList.add('lgs-danger');
  }

  el.innerText = timeFmt;
};

const main = () => {
  const shieldEl = document.querySelector('.mousehuntHud-shield.golden');
  if (! shieldEl) {
    return;
  }

  const reminder = makeElement('div', 'mousehunt-improved-lgs-reminder');

  const exact = isExact();
  if (exact) {
    reminder.classList.add('exact');
  }

  shieldEl.append(reminder);

  updateLgsReminder(reminder);

  // Every minute, update the time.
  const interval = exact ? 1000 : 60 * 1000;

  /* Wait a bit so we sync to the horn countdown a bit more */
  setTimeout(() => {
    setInterval(() => {
      user.shield_seconds -= interval / 1000;
      updateLgsReminder(reminder);
    }, interval);
  }, 750);
};

/**
 * Initialize the module.
 */
const init = async () => {
  // Only load if the user has LGS.
  if (user.has_shield) {
    addStyles(styles, 'lgs-reminder');
    main();
  }
};

export default {
  id: 'lgs-reminder',
  name: 'Lucky Golden Shield Duration & Reminder',
  type: 'feature',
  description: 'Show your LGS duration in the HUD and warn you when it\'s about to expire.',
  default: false,
  load: init,
};
