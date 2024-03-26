import { addHudStyles } from '@utils';

import styles from './styles.css';

let start;
const spinNeedle = () => {
  const needle = document.querySelector('.windmillHud-needle');
  if (! needle) {
    return;
  }

  const speed = document.querySelector('.windmillHud-speed');
  if (! speed) {
    return;
  }

  start = needle.style.transform.match(/rotate\(([^)]+)\)/);
  if (! start.length > 1) {
    return;
  }

  start = Number.parseInt(start[1].replace('deg', ''), 10);

  let timeout;
  let spins = 1;
  speed.addEventListener('click', () => {
    needle.style.transition = 'transform 0.4s';
    needle.style.transform = `rotate(${start + (360 * spins)}deg)`;

    spins += 1;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      needle.style.transition = 'none';
      needle.style.transform = `rotate(${start}deg)`;

      spins = 1;
    }, spins * 400);
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  spinNeedle();
};
