import { addHudStyles } from '@utils';

import styles from './styles.css';

/**
 * Make the progress bar draggable.
 */
const makeProgressDraggable = () => {
  const progressBar = document.querySelector('.seasonalGardenHUD-amplifierProgress');
  if (! progressBar) {
    return;
  }

  const progressBarMarker = document.querySelector('.seasonalGardenHUD-amplifierProgress-bar');
  if (! progressBarMarker) {
    return;
  }

  const originalWidth = progressBarMarker.style.width;
  let timeout = null;
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.round((x / width) * 100);

    progressBarMarker.style.width = `${percent}%`;
    setTimeout(() => progressBarMarker.classList.add('seasonalGardenHUD-amplifierProgress-bar--animating'), 50);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      progressBarMarker.style.width = originalWidth;

      setTimeout(() => progressBarMarker.classList.remove('seasonalGardenHUD-amplifierProgress-bar--animating'), 300);
    }, 600);
  });
};

/**
 * Change the color of the progress bar when the bar is clicked.
 */
const changeBarColor = () => {
  const trigger = document.querySelector('.seasonalGardenHUD-season');
  if (! trigger) {
    return;
  }

  const bar = document.querySelector('.seasonalGardenHUD-amplifierProgress-bar');
  if (! bar) {
    return;
  }

  trigger.addEventListener('click', () => {
    // add a hue-rotate filter to the bar with a random hue
    const hue = Math.round(Math.random() * 360);
    bar.style.filter = `hue-rotate(${hue}deg)`;
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  makeProgressDraggable();
  changeBarColor();
};
