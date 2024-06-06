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
  return JSON.parse(localStorage.getItem('Chro-forecaster-time'));
};

/**
 * Update the total items count.
 *
 * @param {Array} data The data to process.
 */
const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
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

export {
  exportRankupForecaster,
  hasRankupForecaster
};
