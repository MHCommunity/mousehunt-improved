import { addEvent, addStyles } from '@utils';

import styles from './styles.css';

/**
 * Wrap the points and gold in spans.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const wrapGoldAndPoints = (entry) => {
  // if it has the pointsGold attribute, it's already been wrapped
  if (entry.getAttribute('data-modified-points-gold')) {
    return;
  }

  entry.setAttribute('data-modified-points-gold', true);

  if (entry.querySelector('.mh-ui-points') || entry.querySelector('.mh-ui-gold')) {
    return;
  }

  // Find the amount of points via a regex and wrap it in a span
  const points = entry.innerHTML.match(/worth (.+?) points/i);
  // also match the 'and X,XXX gold' part
  const gold = entry.innerHTML.match(/points and (.+?) gold/i);

  if (points) {
    entry.innerHTML = entry.innerHTML.replace(points[0], `worth <span class="mh-ui-points">${points[1]}</span> points`);
  }

  if (gold) {
    entry.innerHTML = entry.innerHTML.replace(gold[0], `points and <span class="mh-ui-gold">${gold[1]}</span> gold`);
  }
};

/**
 * Main function.
 */
const main = async () => {
  addStyles(styles, 'better-journal-gold-and-points');

  addEvent('journal-entry', wrapGoldAndPoints, {
    weight: 2000,
    id: 'better-journal-gold-and-points'
  });
};

export default main;
