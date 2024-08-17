import {
  addStyles,
  doEvent,
  getCurrentPage,
  makeElement,
  onNavigation,
  onRequest
} from '@utils';

import {
  getCatchRate,
  getMiceEffectiveness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
} from './data';

import styles from './styles.css';

let lastStats = '';
let effectiveness = null;
let isUpdating = false;

let hasRiftstalkerCodex = false;
let riftSetCount = 0;
let trapPower;
let trapPowerBonus;

const updateStats = () => {
  trapPower = 0;
  trapPowerBonus = 0;
  trapLuck = user.trap_luck;

  const riftStalkerCodex = document.querySelector('.campPage-trap-trapStat-mathRow.special .campPage-trap-trapStat-mathRow-name');
  if (riftStalkerCodex && riftStalkerCodex.innerText.includes('Riftstalker')) {
    hasRiftstalkerCodex = true;
    riftSetCount = Number.parseInt(riftStalkerCodex.innerText.replace('Riftstalker Set Bonus (', '').replace(' pieces)', '') || 0, 10);
  }

  if ('zugzwang_tower' !== getCurrentLocation()) {
    trapPower = user.trap_power;
    trapPowerBonus = user.trap_power_bonus;

    return;
  }

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat.power .campPage-trap-trapStat-mathRow');

  trapMath.forEach((mathRow) => {
    const row = mathRow.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (! row.textContent) {
      return;
    }

    const label = mathRow.querySelector('.campPage-trap-trapStat-mathRow-name');
    if (label && label.textContent.includes('Your trap is receiving a boost!')) {
      return;
    }

    const value = Number.parseInt(row.textContent.replaceAll(',', '').replace('%', '') || 0, 10);
    if (! value) {
      return;
    }

    if (row.innerText.includes('%')) {
      trapPowerBonus += value;
    } else {
      trapPower += value;
    }
  });
};

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
  if (minluckList) {
    minluckList.classList.add('cre-refreshing');
  } else {
    const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
    if (! statsContainer) {
      isUpdating = false;
      return;
    }

    minluckList = makeElement('div', ['mh-cre-table', 'campPage-trap-trapEffectiveness', 'cre-loading']);
    minluckList.id = 'mh-improved-cre';
    minluckList.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    statsContainer.append(minluckList);
  }

  const currentStats = `
    ${user.trap_power}
    ${user.trap_luck}
    ${user.trap_attraction_bonus}
    ${user.trap_cheese_effect}
    ${user.trap_luck}
    ${user.trap_power}
    ${user.trap_power_bonus}
    ${user.trap_power_type_name}
    ${user.trinket_item_id}
    ${user.trinket_quantity}
    ${user.base_item_id}
    ${user.weapon_item_id}
    ${user.bait_item_id}
    ${user.bait_quantity}
    ${user.environment_id}
  `;

  if (currentStats !== lastStats) {
    effectiveness = await getMiceEffectiveness();
    lastStats = currentStats;

    updateStats();
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
  minluckList.classList.remove('cre-refreshing');
};

/**
 * Render the minluck list.
 *
 * @param {Promise<Array>} list The list of mice.
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

    const options = {
      mouseType: mouse.type,
      mousePower,
      effectiveness: mouseEffectiveness / 100,
      trapPower,
      trapLuck,
      trapPowerBonus,
      hasRiftstalkerCodex,
      riftSetCount,
    };

    const minluck = await getMinluck(options);
    let catchRate = await getCatchRate(options);
    if (Number.isNaN(catchRate.rate)) {
      catchRate = {
        rate: 0,
        percent: '0%',
      };
    }

    const crClass = ['mh-improved-cre-data'];
    const minluckClass = ['mh-improved-cre-data'];

    if (catchRate.rate * 100 >= 100) {
      crClass.push('mh-improved-cre-data-good');
      minluckClass.push('mh-improved-cre-data-good');
    } else if (catchRate.rate * 100 <= 60) {
      crClass.push('mh-improved-cre-data-bad');
      minluckClass.push('mh-improved-cre-data-bad');
    }

    if (user.trap_luck >= minluck) {
      crClass.push('mh-improved-cre-data-minlucked');
      minluckClass.push('mh-improved-cre-data-minlucked');
    }

    // Ultimate charm.
    if (1075 == user.trinket_item_id) { // eslint-disable-line eqeqeq
      crClass.push('mh-improved-cre-data-ultimate');
      catchRate.rate = 1;
      catchRate.percent = '100%';
    }

    rows.push({
      mouse: mouse.name,
      type: mouse.type,
      minluck,
      catchRateValue: catchRate.rate,
      catchRate: catchRate.percent,
      crClass,
      minluckClass,
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

  rows.forEach(({ mouse, type, minluck, catchRate, crClass, minluckClass }) => {
    const row = makeElement('tr', 'mh-improved-cre-row');
    const name = makeElement('td', 'mh-improved-cre-name');
    const nameLink = makeElement('a', '', mouse);
    nameLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hg.views.MouseView.show(type);
    });
    name.append(nameLink);
    row.append(name);

    makeElement('td', minluckClass, minluck, row);
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

  onRequest('*', updateMinLucks);
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
  description: 'Display Minluck and catch rate estimates on the Camp page.',
  load: init,
};
