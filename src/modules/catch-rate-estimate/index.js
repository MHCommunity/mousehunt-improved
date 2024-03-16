import {
  addStyles,
  getCurrentPage,
  makeElement,
  onPageChange,
  onRequest,
  onTravel
} from '@utils';

import styles from './styles.css';

import {
  getCatchRate,
  getMiceEffectiveness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
} from './data';

const updateMinLucks = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const effectiveness = await getMiceEffectiveness();

  if (! effectiveness) {
    return;
  }

  const miceIds = Object.values(effectiveness)
    .flatMap(({ mice }) => mice)
    .map((mouse) => {
      return {
        name: mouse.name,
        type: mouse.type,
      };
    });

  renderList(miceIds);
};

const renderList = async (list) => {
  let minluckList = document.querySelector('#mh-improved-cre');
  if (! minluckList) {
    minluckList = makeElement('div', 'campPage-trap-trapEffectiveness');
    minluckList.id = 'mh-improved-cre';

    const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
    if (! statsContainer) {
      return;
    }

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

  for (const mouse of list) {
    const mousePower = await getMousePower(mouse.type);
    const mouseEffectiveness = await getMouseEffectiveness(mouse.type);

    const minluck = await getMinluck(mousePower, mouseEffectiveness);
    const catchRate = await getCatchRate(mousePower, mouseEffectiveness);

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
      mouse: mouse.name,
      minluck,
      catchRateValue: catchRate.rate,
      catchRate: catchRate.percent,
      crClass,
    });
  }

  rows.sort((a, b) => {
    if (a.catchRateValue !== b.catchRateValue) {
      return a.catchRateValue - b.catchRateValue;
    }

    return b.minluck - a.minluck;
  });

  rows.forEach(({ mouse, minluck, catchRate, crClass }) => {
    const row = makeElement('tr', 'mh-improved-cre-row');
    makeElement('td', 'mh-improved-cre-name', mouse, row);
    makeElement('td', crClass, minluck, row);
    makeElement('td', crClass, catchRate, row);

    table.append(row);
  });

  minluckList.append(table);
};

const main = async () => {
  if ('camp' === getCurrentPage()) {
    await updateMinLucks();
  }

  onPageChange({ camp: { show: updateMinLucks } });
  onRequest('*', updateMinLucks);
  onTravel(null, { callback: updateMinLucks });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'catch-rate-estimate');

  main();
};

export default {
  id: 'catch-rate-estimate',
  name: 'Catch Rate Estimator & Minlucks',
  type: 'feature',
  default: true,
  description: 'Minluck and catch rate estimates.',
  load: init,
};
