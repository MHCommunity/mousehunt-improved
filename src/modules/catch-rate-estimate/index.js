import {
  addStyles,
  getCurrentPage,
  makeElement,
  onPageChange,
  onRequest
} from '@utils';

import settings from './settings';
import styles from './styles.css';

import {
  getCatchRate,
  getMiceEffectivness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
} from './data';

const updateMinLucks = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const effectiveness = await getMiceEffectivness();

  const miceNames = Object.values(effectiveness)
    .flatMap(({ mice }) => mice)
    .flatMap(({ name }) => name);

  renderList(miceNames);
};

const renderList = (list) => {
  let minluckList = document.querySelector('#mh-improved-cre');
  if (! minluckList) {
    minluckList = makeElement('div', 'campPage-trap-trapEffectiveness');
    minluckList.id = 'mh-improved-cre';

    const statsContainer = document.querySelector('.campPage-trap-statsContainer');
    statsContainer.append(minluckList);
  }

  const existing = document.querySelector('#mh-improved-cre-table');
  if (existing) {
    existing.remove();
  }

  const table = makeElement('table');
  table.id = 'mh-improved-cre-table';

  const tableheader = makeElement('thead');
  makeElement('th', 'name', 'Mouse', tableheader);
  makeElement('th', '', 'Minluck', tableheader);
  makeElement('th', '', 'Catch Rate', tableheader);
  table.append(tableheader);

  const rows = [];

  list.forEach((mouseName) => {
    const mousePower = getMousePower(mouseName);
    const mouseEffectiveness = getMouseEffectiveness(mouseName);

    const minluck = getMinluck(mousePower, mouseEffectiveness);
    const catchRate = getCatchRate(mousePower, mouseEffectiveness);

    const crClass = ['mh-improved-cre-data'];
    if (catchRate.rate * 100 >= 100) {
      crClass.push('mh-improved-cre-data-good');
    } else if (catchRate.rate * 100 <= 60) {
      crClass.push('mh-improved-cre-data-bad');
    }

    if (user.trap_luck >= minluck) {
      crClass.push('mh-improved-cre-data-minlucked');
    }

    rows.push({
      mouseName,
      minluck,
      catchRateValue: catchRate.rate,
      catchRate: catchRate.percent,
      crClass,
    });
  });

  rows.sort((a, b) => {
    if (a.catchRateValue !== b.catchRateValue) {
      return a.catchRateValue - b.catchRateValue;
    }

    return b.minluck - a.minluck;
  });

  rows.forEach(({ mouseName, minluck, catchRate, crClass }) => {
    const row = makeElement('tr', 'mh-improved-cre-row');
    makeElement('td', 'mh-improved-cre-name', mouseName, row);
    makeElement('td', crClass, minluck, row);
    makeElement('td', crClass, catchRate, row);

    table.append(row);
  });

  minluckList.append(table);
};

const main = () => {
  if ('camp' === getCurrentPage()) {
    updateMinLucks();

    // Run it again after a delay to make sure the page is fully loaded.
    setTimeout(() => {
      updateMinLucks();
    }, 750);
  }

  onPageChange({ camp: { show: updateMinLucks } });
  onRequest(updateMinLucks, '/managers/ajax/users/changetrap.php');
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  main();
};

export default {
  id: 'catch-rate-estimate',
  name: 'Catch Rate Estimate',
  type: 'feature',
  default: true,
  description: 'Minluck and catch rate estimates.',
  load: init,
  settings,
  beta: true,
};
