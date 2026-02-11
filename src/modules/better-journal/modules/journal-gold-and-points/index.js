import { addStyles, onJournalEntry } from '@utils';

import styles from './styles.css';

/**
 * Wrap the points and gold in spans.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const wrapGoldAndPoints = (entry) => {
  if (! entry || ! entry.classList) {
    return;
  }

  // if it has the pointsGold attribute, it's already been wrapped
  if (entry.getAttribute('data-modified-points-gold')) {
    return;
  }

  entry.setAttribute('data-modified-points-gold', true);

  if (entry.querySelector('.mh-ui-points') || entry.querySelector('.mh-ui-gold')) {
    return;
  }

  let html = entry.innerHTML;
  // Find the amount of points via a regex and wrap it in a span
  const points = html.match(/worth (.+?) points/i);
  // also match the 'and X,XXX gold' part
  const gold = html.match(/points and (.+?) gold/i);

  if (points) {
    html = html.replace(points[0], `worth <span class="mh-ui-points">${points[1]}</span> points`);
  }

  if (gold) {
    html = html.replace(gold[0], `points and <span class="mh-ui-gold">${gold[1]}</span> gold`);
  }

  if (html !== entry.innerHTML) {
    entry.innerHTML = html;
  }
};

/**
 * Main function.
 */
const main = async () => {
  addStyles(styles, 'better-journal-gold-and-points');

  onJournalEntry(wrapGoldAndPoints, {
    id: 'better-journal-gold-and-points',
    weight: 2000,
  });
};

export default main;
