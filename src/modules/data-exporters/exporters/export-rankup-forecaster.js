import { formatNumber, lsGet } from '@utils';

import { exportPopup } from '../utils';

/**
 * Check if the data is available.
 *
 * @return {boolean} If the data is available.
 */
const hasRankupForecaster = () => {
  return localStorage.getItem('Chro-forecaster-time');
};

/**
 * Get the data from localStorage.
 *
 * @return {Array} The data.
 */
const fetch = async () => {
  return lsGet('Chro-forecaster-time', null);
};

/**
 * Update the total items count.
 *
 * @param {Array} data The data to process.
 */
const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = formatNumber(data.length);
};

/**
 * Export the rankup forecaster data.
 */
const exportRankupForecaster = () => {
  exportPopup({
    type: 'rankup-forecaster-history',
    text: 'Rankup Forecaster History',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: ['Date', 'Wisdom'],
    },
  });
};

export { exportRankupForecaster, hasRankupForecaster };
