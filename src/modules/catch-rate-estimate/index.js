import {
  addStyles,
  cacheGet,
  cacheSet,
  debuglog,
  doEvent,
  getCurrentLocation,
  getCurrentPage,
  getFlag,
  getSetting,
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

let lastStats = '';
let effectiveness = null;
let isUpdating = false;

let trapPower;
let trapPowerBoost;
let trapPowerBonus;
let trapLuck;

const updateStats = () => {
  trapPower = 0;
  trapPowerBoost = 0;
  trapPowerBonus = 0;
  trapLuck = user.trap_luck;

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat.power .campPage-trap-trapStat-mathRow');

  trapMath.forEach((mathRow) => {
    const row = mathRow.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (! row.textContent) {
      return;
    }

    const value = Number.parseInt(row.textContent.replaceAll(',', '').replace('%', '') || '0', 10);
    if (! value) {
      return;
    }

    const label = mathRow.querySelector('.campPage-trap-trapStat-mathRow-name');
    // "Your trap is weakened!", "Your trap is receiving a boost!"
    if (label && label.textContent.includes('Your trap is')) {
      // Skip Zugzwang's Tower effects. Calc'd later.
      if (user.environment_name !== 'Zugzwang\'s Tower') {
        const sign = label.textContent.includes('weakened') ? -1 : 1;
        trapPowerBoost += (sign * value);
      }
      return;
    }

    if (row.textContent.includes('%')) {
      trapPowerBonus += value;
    } else {
      trapPower += value;
    }
  });
};

/**
 * Update the mice effectiveness and cache the results.
 *
 * @param {string} location The current location.
 *
 * @return {Promise<Object>} The mice effectiveness.
 */
const updateMiceEffectiveness = async (location) => {
  effectiveness = await getMiceEffectiveness();
  cacheSet('cre-location', location);
  cacheSet('cre-stats', lastStats);
  cacheSet('cre-effectiveness', effectiveness);

  return effectiveness;
};

/**
 * Update the minluck list.
 *
 * @param {boolean} useCachedData Whether to use cached data.
 */
const updateMinLucks = async (useCachedData = false) => {
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

    statsContainer.append(minluckList);
  }

  try {
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

    const location = getCurrentLocation();
    if (useCachedData) {
      const cachedLocation = await cacheGet('cre-location');
      const cachedStats = await cacheGet('cre-stats');
      effectiveness = await (cachedLocation !== location || cachedStats !== currentStats ? updateMiceEffectiveness(location, currentStats) : cacheGet('cre-effectiveness'));
    } else {
      effectiveness = await updateMiceEffectiveness(location, currentStats);
    }

    if (currentStats !== lastStats) {
      lastStats = currentStats;

      updateStats();
    }

    if (! effectiveness) {
      throw new Error('Failed to fetch effectiveness data');
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
  } catch (error) {
    debuglog('cre', 'Error updating minluck list', error);
    minluckList.classList.add('cre-loading-failed');
  } finally {
    isUpdating = false;
    if (minluckList) {
      minluckList.classList.remove('cre-refreshing');
    }
  }
};

const updateTrapView = (rows) => {
  if (! getSetting('catch-rate-estimate.show-trap-highlight', false)) {
    return;
  }

  const trapView = document.querySelector('.trapImageView');
  if (! trapView) {
    return;
  }

  // remove existing highlight bar
  trapView.classList.remove(
    'mh-improved-cre-highlight',
    'mh-improved-cre-highlight-good',
    'mh-improved-cre-highlight-bad',
    'mh-improved-cre-highlight-minlucked',
    'mh-improved-cre-highlight-ultimate'
  );

  // Add a highlight bar to the top of the trap view based on if we're minlucking all of the mice,
  // the average catch rate, and if we're more likely to catch the mice than not.
  // if our average is worse than 40%, add a bad class. if it's better than 60%, add a good class. Better than 75%, add a great class.
  trapView.classList.add('mh-improved-cre-highlight');

  if (1075 == user.trinket_item_id) { // eslint-disable-line eqeqeq
    trapView.classList.add('mh-improved-cre-highlight-ultimate');
  } else if (rows.every((row) => user.trap_luck >= row.minluck)) {
    trapView.classList.add('mh-improved-cre-highlight-minlucked');
  } else {
    const averageCatchRate = rows.reduce((acc, row) => acc + row.catchRateValue, 0) / rows.length;
    if (averageCatchRate >= 0.75) {
      trapView.classList.add('mh-improved-cre-highlight-good');
    } else if (averageCatchRate <= 0.4) {
      trapView.classList.add('mh-improved-cre-highlight-bad');
    }
  }
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

  tableheader.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    minluckList.classList.add('cre-loading-refresh');
    minluckList.classList.add('cre-loading');
    await updateMinLucks(false);
    minluckList.classList.remove('cre-loading');
    minluckList.classList.remove('cre-loading-refresh');
  });

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
      trapPowerBoost,
      trapLuck,
      trapPowerBonus,
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

    // Ultimate charm.
    if (1075 == user.trinket_item_id) { // eslint-disable-line eqeqeq
      crClass.push('mh-improved-cre-data-ultimate');
      minluckClass.push('mh-improved-cre-data-ultimate');
      catchRate.rate = 1;
      catchRate.percent = '100%';
    } else {
      if (catchRate.rate * 100 >= 100) {
        crClass.push('mh-improved-cre-data-good');
        minluckClass.push('mh-improved-cre-data-good');
      } else if (catchRate.rate * 100 >= 85) {
        crClass.push('mh-improved-cre-data-goodish');
        minluckClass.push('mh-improved-cre-data-goodish');
      } else if (catchRate.rate * 100 <= 60) {
        crClass.push('mh-improved-cre-data-bad');
        minluckClass.push('mh-improved-cre-data-bad');
      }

      if (user.trap_luck >= minluck) {
        crClass.push('mh-improved-cre-data-minlucked');
        minluckClass.push('mh-improved-cre-data-minlucked');
      }
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

  updateTrapView(rows);
};

/**
 * Main function.
 */
const main = async () => {
  onNavigation(() => {
    updateMinLucks(true);
  }, {
    page: 'camp',
  });

  if (getFlag('catch-rate-estimate-more-refresh')) {
    onRequest('*', updateMinLucks, true, ['users/getmiceeffectiveness.php']);
  } else {
    onRequest('users/changetrap.php', updateMinLucks);
    onTravel(null, { callback: updateMinLucks });
  }
};

/**
 * Initialize the module.
 */
const init = () => {
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
