import { addHudStyles, onTurn, setMultipleTimeout } from '@utils';

import styles from './styles.css';

const addWidthToPollutinumBar = () => {
  const gauge = document.querySelector('.pollutionOutbreakHUD-scumContainer');
  if (! gauge) {
    return;
  }

  const quantityEl = gauge.querySelector('.quantity');
  const maxQuantityEl = gauge.querySelector('.maxQuantity');

  if (! quantityEl || ! maxQuantityEl) {
    return;
  }

  const quantity = Number.parseInt(quantityEl.innerText, 10);
  const maxQuantity = Number.parseInt(maxQuantityEl.innerText.replace('/', ''), 10);
  const percentage = Math.round((quantity / maxQuantity) * 100);
  gauge.style.setProperty('--pollution-outbreak-width', `${percentage}%`);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  setMultipleTimeout(addWidthToPollutinumBar, [0, 100, 500]);
  onTurn(addWidthToPollutinumBar, 500);
};
