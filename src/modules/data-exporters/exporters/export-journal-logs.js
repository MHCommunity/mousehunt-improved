import { dbGetAll, dbGetCount, formatNumber } from '@utils';
import { exportPopup } from '../utils';

/**
 * Check if there are any tracked journal logs to export.
 *
 * @return {Promise<boolean>} If the data is available.
 */
const hasJournalLogs = async () => {
  const count = await dbGetCount('journal-log-tracker');
  return count > 0;
};

/**
 * Fetch the tracked journal log summaries.
 *
 * @return {Promise<Array>} The journal logs.
 */
const fetch = async () => {
  const logs = await dbGetAll('journal-log-tracker');

  logs.sort((a, b) => b.id - a.id);

  return logs.map((entry) => {
    const log = entry?.data || {};

    return {
      id: log.id || 0,
      date: log.timestamp ? new Date(log.timestamp).toISOString() : '',
      duration: log.duration || '',
      catches: log.catches ?? '',
      ftc: log.ftc ?? '',
      fta: log.fta ?? '',
      gold: log.gold ?? '',
      points: log.points ?? '',
    };
  });
};

/**
 * Function to run after fetching.
 *
 * @param {Array} data The data.
 */
const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  if (totalItemsEl) {
    totalItemsEl.textContent = formatNumber(data.length);
  }
};

/**
 * Export the tracked journal logs.
 */
const exportJournalLogs = () => {
  exportPopup({
    type: 'journal-logs',
    text: 'Journal Logs',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: ['ID', 'Date', 'Duration', 'Catches', 'FTC', 'FTA', 'Gold', 'Points'],
    },
  });
};

export { exportJournalLogs, hasJournalLogs };
