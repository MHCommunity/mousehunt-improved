import { exportPopup } from './exporter';

const hasRankupForecaster = () => {
  return localStorage.getItem('Chro-forecaster-time');
};

const fetch = async () => {
  return JSON.parse(localStorage.getItem('Chro-forecaster-time'));
};

const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
};

const exportRankupForecaster = () => {
  exportPopup({
    type: 'rankup-forecaster-history',
    text: 'Rankup Forecaster History',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: [
        'Date',
        'Wisdom',
      ],
    }
  });
};

export {
  exportRankupForecaster,
  hasRankupForecaster
};
