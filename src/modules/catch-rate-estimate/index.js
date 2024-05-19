import {
  addStyles,
  doEvent,
  getCurrentPage,
  getFlag,
  makeElement,
  onNavigation,
  onRequest,
  onTravel
} from '@utils';

import {
  getCatchRate,
  getMiceEffectiveness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
} from './data';

import styles from './styles.css';

let lastStats = [];
let effectiveness = null;
let isUpdating = false;

/**
 * Update the minluck list.
 */
const updateMinLucks = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  if (isUpdating) {
    return;
  }

  isUpdating = true;

  let minluckList = document.querySelector('#mh-improved-cre');
  if (! minluckList) {
    minluckList = makeElement('div', ['campPage-trap-trapEffectiveness', 'cre-loading']);
    minluckList.id = 'mh-improved-cre';

    const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
    if (! statsContainer) {
      isUpdating = false;
      return;
    }

    statsContainer.append(minluckList);
  }

  const currentStats = [
    user.trap_power,
    user.trap_luck,
    user.trap_attraction_bonus,
    user.trap_cheese_effect,
    user.trap_luck,
    user.trap_power,
    user.trap_power_bonus,
    user.trap_power_type_name,
    user.trinket_item_id,
    user.base_item_id,
    user.weapon_item_id,
    user.bait_item_id,
    user.environment_id,
  ];

  if (currentStats !== lastStats) {
    effectiveness = await getMiceEffectiveness();
    lastStats = currentStats;
  }

  if (! effectiveness) {
    isUpdating = false;
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

  await renderList(miceIds);

  isUpdating = false;
};

/**
 * Render the minluck list.
 *
 * @param {Array} list The list of mice.
 */
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
    doEvent('mh-improved-cre-list-rendered');
  }

  const existing = document.querySelector('#mh-improved-cre-table');
  if (existing) {
    existing.remove();
  }

  minluckList.classList.remove('cre-loading');

  const table = makeElement('table');
  table.id = 'mh-improved-cre-table';

  const tableheader = makeElement('thead');
  makeElement('th', 'name', 'Mouse', tableheader);
  makeElement('th', '', 'Minluck', tableheader);
  makeElement('th', '', 'Catch Rate', tableheader);

  tableheader.addEventListener('click', updateMinLucks);
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
      type: mouse.type,
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

  if (rows.length === 0) {
    makeElement('span', 'mh-improved-cre-no-mice', 'No mice found.', table);
    minluckList.append(table);
    return;
  }

  rows.forEach(({ mouse, type, minluck, catchRate, crClass }) => {
    const row = makeElement('tr', 'mh-improved-cre-row');
    const name = makeElement('td', 'mh-improved-cre-name');
    const nameLink = makeElement('a', '', mouse);
    nameLink.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.MouseView.show(type);
    });
    name.append(nameLink);
    row.append(name);

    makeElement('td', crClass, minluck, row);
    makeElement('td', crClass, catchRate, row);

    table.append(row);
  });

  minluckList.append(table);
};

/**
 * Main function.
 */
const main = async () => {
  onNavigation(updateMinLucks, {
    page: 'camp',
  });

  if (getFlag('catch-rate-estimate-more-refresh')) {
    onRequest('*', updateMinLucks);
  } else {
    onRequest('users/changetrap.php', updateMinLucks);
  }

  onTravel(null, { callback: updateMinLucks });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'catch-rate-estimate');

  setTimeout(main, 240);
};

/**
 * Initialize the module.
 */
export default {
  id: 'catch-rate-estimate',
  name: 'Catch Rate Estimator & Minlucks',
  type: 'feature',
  default: true,
  description: 'Minluck and catch rate estimates.',
  load: init,
};
