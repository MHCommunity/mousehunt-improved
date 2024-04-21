import { addJournalEntry, addStyles, getSetting, saveSetting } from '@utils';

import styles from './styles.css';

const tips = [
  'Did you know that MouseHunt Improved has many easter eggs? Try to find them all!',
  'You can customize the modules you want to load in the settings.',
  'You can use the \'debug-all\' setting to enable all debug options.',
  'You can use the \'debug-dialog\', \'debug-navigation\', \'debug-request\', \'debug-events\' settings to enable specific debug options.',
  'You can use the \'debug\' function in the console to log messages.',
  'You can use the \'app.mhutils\' object in the console to access all the utility functions.',
  'You can use the \'app.mhui\' object in the console to access all the UI functions.',
  'There are many features in MouseHunt Improved that aren\'t even documented!',
];

const addTipDaily = async () => {
  const lastChangeValue = getSetting('tip-of-the-day.last', 0);
  const lastChange = new Date(Number.parseInt(lastChangeValue, 10));
  const now = new Date();

  // Check if the current time is past midnight and the journal has not been changed today
  if (
    ! lastChange ||
    lastChange.getDate() !== now.getDate() ||
    lastChange.getMonth() !== now.getMonth() ||
    lastChange.getFullYear() !== now.getFullYear()
  ) {
    addJournalEntry({
      id: 'tip-of-the-day',
      text: tips[Math.floor(Math.random() * tips.length)],
      noDate: true,
    });

    saveSetting('tip-of-the-day.last', now.getTime());
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'tip-of-the-day');

  addTipDaily();
};

export default {
  id: 'tip-of-the-day',
  name: 'Tip of the Day',
  type: 'hidden',
  default: false,
  load: init,
};
