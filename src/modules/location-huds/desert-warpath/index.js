import { addHudStyles } from '@utils';

import styles from './styles.css';

let engaged = false;
const addMissiles = () => {
  const container = document.querySelector('.warpathHUD-waveContainer');
  if (! container) {
    return;
  }

  const trigger = document.querySelector('.warpathHUD-streakContainer');
  if (! trigger) {
    return;
  }

  trigger.addEventListener('click', () => {
    engaged = ! engaged;

    if (engaged) {
      container.classList.add('warpathHUD-engaged');
    } else {
      container.classList.remove('warpathHUD-engaged');
    }
  });

  const launchMissle = (event) => {
    if (! engaged) {
      return;
    }

    // Get the x coordinate of the mouse click for the element.
    let x = event.clientX ? event.clientX - container.getBoundingClientRect().left : Math.floor(Math.random() * container.getBoundingClientRect().width);

    // Randomize the x coordinate a bit.
    x += Math.floor(Math.random() * 50) - 25;

    hg.views.HeadsUpDisplayDesertWarpathView.spawnMissile(x, 1);

    let missile;
    setTimeout(() => {
      missile = container.querySelectorAll('.warpathHUD-missile[style*="left: ' + x + 'px"]');
      if (! missile || missile.length === 0) {
        return;
      }

      missile.forEach((m) => {
        setTimeout(() => {
          m.classList.add('mh-ui-fade');
        }, 50);

        setTimeout(() => {
          m.classList.add('mh-ui-fade-out');
        }, 100);

        setTimeout(() => {
          m.remove();
        }, 500);
      });
    }, 700);
  };

  container.addEventListener('click', launchMissle);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  addMissiles();
};
