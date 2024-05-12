import { addStyles, onRequest } from '@utils';

import styles from './styles.css';

const initiateKingsReward = () => {
  const reward = document.querySelector('.huntersHornMessageView huntersHornMessageView--puzzle .huntersHornMessageView__action');
  if (reward) {
    reward.click();
  }
};

const startKingsReward = () => {
  const rewardStart = document.querySelector('.huntersHornMessageView--puzzle .huntersHornMessageView__action');
  if (rewardStart) {
    rewardStart.click();
  }

  setTimeout(() => {
    const puzzle = document.querySelector('.puzzleView__code');
    if (puzzle) {
      puzzle.focus();
    }
  }, 500);
};

const continueOnKingsReward = (req) => {
  if (req.success && req.puzzle_reward) {
    const resume = document.querySelector('.puzzleView__resumeButton');
    if (resume) {
      resume.click();
    }
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-kings-reward');

  onRequest('turns/activeturn.php', initiateKingsReward, true);
  onRequest('users/puzzle.php', continueOnKingsReward, true);

  onRequest('*', startKingsReward);
  startKingsReward();
};

export default {
  id: 'better-kings-reward',
  name: 'Better King\'s Reward',
  type: 'better',
  default: true,
  description: 'Updates the style of the King\'s Reward slightly, automatically closes the success message',
  load: init,
};
