import { addStyles, onJournalEntry } from '@utils';

import styles from './styles.css';

/**
 * Wrap the points and gold in spans.
 *
 * @param {Object} model The journal entry model.
 */
const wrapGoldAndPoints = (model) => {
  if (!model.html) {
    return;
  }

  if (model.html.includes('mh-ui-points') || model.html.includes('mh-ui-gold')) {
    return;
  }

  let html = model.html;
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

  model.setHtml(html);
};

/**
 * Main function.
 */
const main = async () => {
  addStyles(styles, 'better-journal-gold-and-points');

  onJournalEntry(wrapGoldAndPoints, {
    id: 'better-journal-gold-and-points',
    stage: 'text',
  });
};

export default main;
