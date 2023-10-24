import { addUIStyles } from '../utils';
import styles from './styles.css';

const continueOnKingsReward = (req) => {
  if (req.success && req.puzzle_reward) {
    const resume = document.querySelector('.puzzleView__resumeButton');
    if (resume) {
      resume.click();
    }
  }
};

const initiateKingsReward = () => {
  const reward = document.querySelector('.huntersHornMessageView huntersHornMessageView--puzzle .huntersHornMessageView__action');
  if (reward) {
    reward.click();
  }
};

export default () => {
  addUIStyles(styles);

  onRequest(initiateKingsReward, 'managers/ajax/turns/activeturn.php', true);
  onRequest(continueOnKingsReward, 'managers/ajax/users/puzzle.php', true);
};
