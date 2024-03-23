import { addEvent, addStyles, makeElement } from '@utils';

import styles from './styles.css';

const makeProgressRow = (title, value, appendTo) => {
  makeElement('div', ['mh-ui-progress-log-cell-entry', 'mh-ui-progress-log-cell-entry-title'], title, appendTo);
  makeElement('div', 'mh-ui-progress-log-cell-entry', value, appendTo);
};

const updateLog = (entry) => {
  if (! entry.classList.contains('log_summary')) {
    return;
  }

  if (entry.getAttribute('data-log-updated')) {
    return;
  }

  entry.setAttribute('data-log-updated', 'true');

  const rows = entry.querySelectorAll('tr td.value');
  if (rows.length !== 10) {
    return;
  }

  const logStats = {
    mice: {
      catches: rows[0].innerText,
      fta: rows[1].innerText,
      misses: rows[2].innerText,
      stale: rows[3].innerText,
    },
    gold: {
      gained: rows[4].innerText,
      lost: rows[6].innerText,
      total: rows[8].innerText,
    },
    points: {
      gained: rows[5].innerText,
      lost: rows[7].innerText,
      total: rows[9].innerText,
    },
  };

  const logTimeEl = entry.querySelector('.reportSubtitle');
  const logTime = logTimeEl ? logTimeEl.innerText : '';

  const newLogWrapper = makeElement('div', 'mh-ui-progress-log-wrapper');

  const title = makeElement('div', 'mh-ui-progress-log-title');
  makeElement('div', 'reportTitle', 'Hunter’s Progress Report', title);
  makeElement('div', 'reportSubtitle', logTime, title);
  newLogWrapper.append(title);

  const logTable = makeElement('div', 'mh-ui-progress-log-table');

  const mice = makeElement('div', ['mh-ui-progress-log-row', 'mice']);
  makeElement('div', 'mh-ui-progress-log-group-title', 'Mice', mice);
  const miceValues = makeElement('div', 'mh-ui-progress-log-group-values');
  makeProgressRow('Catches', logStats.mice.catches, miceValues);
  makeProgressRow('Misses', logStats.mice.misses, miceValues);
  makeProgressRow('FTAs', logStats.mice.fta, miceValues);
  mice.append(miceValues);
  logTable.append(mice);

  const gold = makeElement('div', ['mh-ui-progress-log-row', 'gold']);
  makeElement('div', 'mh-ui-progress-log-group-title', 'Gold', gold);
  const goldValues = makeElement('div', 'mh-ui-progress-log-group-values');
  makeProgressRow('Gained', logStats.gold.gained, goldValues);
  makeProgressRow('Lost', logStats.gold.lost, goldValues);
  makeProgressRow('Total', logStats.gold.total, goldValues);
  gold.append(goldValues);
  logTable.append(gold);

  const points = makeElement('div', ['mh-ui-progress-log-row', 'points']);
  makeElement('div', 'mh-ui-progress-log-group-title', 'Points', points);
  const pointsValues = makeElement('div', 'mh-ui-progress-log-group-values');
  makeProgressRow('Gained', logStats.points.gained, pointsValues);
  makeProgressRow('Lost', logStats.points.lost, pointsValues);
  makeProgressRow('Total', logStats.points.total, pointsValues);
  points.append(pointsValues);
  logTable.append(points);

  newLogWrapper.append(logTable);

  const link = entry.querySelector('td a');
  if (link) {
    const button = makeElement('button', ['mh-ui-progress-log-link', 'mousehuntActionButton', 'tiny', 'mh-ui-progress-log-link-text']);
    button.setAttribute('onclick', link.getAttribute('onclick'));
    makeElement('span', '', 'View Progress Log', button);
    newLogWrapper.append(button);
  }

  entry.append(newLogWrapper);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-progress-log');

  addEvent('journal-entry', updateLog, { weight: 1100, id: 'better-journal-progress-log' });
};
