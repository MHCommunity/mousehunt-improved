import {
  addStyles,
  cacheGet,
  cacheSet,
  debuglog,
  doEvent,
  getCurrentLocation,
  getCurrentPage,
  getFlag,
  make,
  makeElement,
  onNavigation,
  onRequest,
  onTravel,
  parseNumber,
} from '@utils';
import { getStage } from '@utils/shared/stages';

import { getAttractionRates } from './attraction-rates';
import { getCatchRate, getMiceEffectiveness, getMinluck, getMouseEffectiveness, getMousePower } from './data';
import { addRefreshTriggers, saveRenderedStage } from './refresh-triggers';
import { updateTrapEffectivenessText } from './trap-effectiveness';

import styles from './styles.css';

let lastStats = '';
let sortState = { key: null, direction: 'asc' };
let effectiveness = null;
let isUpdating = false;

let trapPower;
let trapPowerBoost;
let trapPowerBonus;
let trapLuck;
let trapAuras = [];

const updateStats = () => {
  trapPower = 0;
  trapPowerBoost = 0;
  trapPowerBonus = 0;
  trapLuck = user.trap_luck;

  const trapMath = document.querySelectorAll('.campPage-trap-trapStat.power .campPage-trap-trapStat-mathRow');

  trapMath.forEach((mathRow) => {
    const row = mathRow.querySelector('.campPage-trap-trapStat-mathRow-value');
    if (!row?.textContent) {
      return;
    }

    const value = parseNumber(row.textContent.replace('%', ''));
    if (!value) {
      return;
    }

    const label = mathRow.querySelector('.campPage-trap-trapStat-mathRow-name');
    // "Your trap is weakened!", "Your trap is receiving a boost!"
    if (label && label.textContent.includes('Your trap is')) {
      // Skip Zugzwang's Tower effects. Calc'd later.
      if (user.environment_name !== "Zugzwang's Tower") {
        const sign = label.textContent.includes('weakened') ? -1 : 1;
        trapPowerBoost += sign * value;
      }
      return;
    }

    if (row.textContent.includes('%')) {
      trapPowerBonus += value;
    } else {
      trapPower += value;
    }
  });

  const trapAurasList = document.querySelectorAll('.trapImageView-trapAura.mousehuntTooltipParent.active');
  if (trapAurasList && trapAurasList.length > 0) {
    trapAuras = [...trapAurasList].map((aura) => [...aura.classList].find((cls) => cls.startsWith('Quest')));
  }
};

/**
 * Update the mice effectiveness and cache the results.
 *
 * @param {string}         location     The current location.
 * @param {string|boolean} currentStats The current stats string or false to skip caching.
 *
 * @return {Promise<Object>} The mice effectiveness.
 */
const updateMiceEffectiveness = async (location, currentStats = false) => {
  effectiveness = await getMiceEffectiveness();
  cacheSet('cre-location', location, 24 * 60 * 60 * 1000); // Cache for 24 hours.
  cacheSet('cre-stats', currentStats, 24 * 60 * 60 * 1000); // Cache for 24 hours.
  cacheSet('cre-effectiveness', effectiveness, 24 * 60 * 60 * 1000); // Cache for 24 hours.

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
    if (!statsContainer) {
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

    if (!effectiveness) {
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

const updateTrapView = (rows, overallCatchRate = null) => {
  if (!getFlag('cre-show-trap-highlight')) {
    return;
  }

  const trapView = document.querySelector('.trapImageView');
  if (!trapView) {
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

  if (hasUltimateCharm()) {
    trapView.classList.add('mh-improved-cre-highlight-ultimate');
  } else if (rows.every((row) => user.trap_luck >= row.minluck)) {
    trapView.classList.add('mh-improved-cre-highlight-minlucked');
  } else {
    const averageCatchRate = overallCatchRate ?? rows.reduce((acc, row) => acc + row.catchRateValue, 0) / rows.length;
    if (averageCatchRate >= 0.75) {
      trapView.classList.add('mh-improved-cre-highlight-good');
    } else if (averageCatchRate <= 0.4) {
      trapView.classList.add('mh-improved-cre-highlight-bad');
    }
  }
};

/**
 * Check whether the Ultimate Charm is equipped, which catches everything.
 *
 * @return {boolean} Whether it is.
 */
// eslint-disable-next-line eqeqeq
const hasUltimateCharm = () => 1075 == user.trinket_item_id;

/**
 * Get the classes that color a catch rate or minluck cell.
 *
 * @param {number} rate    The catch rate (0-1).
 * @param {number} minluck The minluck.
 *
 * @return {Array} The classes.
 */
const getRateClasses = (rate, minluck) => {
  const classes = ['mh-improved-cre-data'];
  if (hasUltimateCharm()) {
    classes.push('mh-improved-cre-data-ultimate');
    return classes;
  }

  // The same colors as the Trap Effectiveness bar's tiers.
  if (rate >= 0.8) {
    classes.push('mh-improved-cre-data-good');
  } else if (rate >= 0.4) {
    classes.push('mh-improved-cre-data-okay');
  } else {
    classes.push('mh-improved-cre-data-bad');
  }

  if (user.trap_luck >= minluck) {
    classes.push('mh-improved-cre-data-minlucked');
  }

  return classes;
};

/**
 * Format an attraction rate as a percentage.
 *
 * @param {number} rate The attraction rate (0-1).
 *
 * @return {string} The formatted rate.
 */
const formatAttractionRate = (rate) => {
  const percent = rate * 100;
  if (percent > 0 && percent < 0.1) {
    return '<0.1%';
  }

  return `${percent.toFixed(percent < 10 ? 1 : 0)}%`;
};

/**
 * Get the chance of catching whichever mouse is attracted: each mouse's catch rate weighted
 * by its attraction rate. Attraction rates are already normalized across the mice that have one.
 *
 * @param {Array} rows The mouse rows.
 *
 * @return {number|null} The overall catch rate (0-1), or null without attraction rates.
 */
const getOverallCatchRate = (rows) => {
  const weighted = rows.filter((row) => undefined !== row.attractionRate);
  if (weighted.length === 0) {
    return null;
  }

  const overall = weighted.reduce((total, row) => total + row.attractionRate * row.catchRateValue, 0);

  // Round off floating point error, so all guaranteed catches add up to exactly 100%.
  return Math.min(1, Math.round(overall * 1_000_000) / 1_000_000);
};

/**
 * Make the overall row shown below the mice.
 *
 * @param {Array}  rows             The mouse rows.
 * @param {number} overallCatchRate The overall catch rate (0-1).
 *
 * @return {HTMLElement} The row.
 */
const makeOverallRow = (rows, overallCatchRate) => {
  const row = makeElement('tr', ['mh-improved-cre-row', 'mh-improved-cre-overall']);
  row.title = 'Catch rates weighted by attraction rate';

  makeElement('td', 'mh-improved-cre-name', 'Overall', row);

  // Attraction rates are normalized, so they always add up to 100%.
  makeElement('td', ['mh-improved-cre-data', 'mh-improved-cre-ar'], '', row);

  const maxMinluck = Math.max(...rows.map((mouseRow) => Number(mouseRow.minluck) || 0));
  makeElement('td', getRateClasses(overallCatchRate, maxMinluck), maxMinluck, row);

  // Up to 2 decimals, without trailing zeros.
  makeElement('td', getRateClasses(overallCatchRate, maxMinluck), `${Number((overallCatchRate * 100).toFixed(2))}%`, row);

  return row;
};

// The direction a column sorts in when it's first clicked.
const defaultSortDirections = {
  mouse: 'asc',
  attractionRate: 'desc',
  minluck: 'desc',
  catchRate: 'asc',
};

/**
 * Compare rows in the default order: lowest catch rate first, then highest minluck.
 *
 * @param {Object} a A mouse row.
 * @param {Object} b Another mouse row.
 *
 * @return {number} The sort order.
 */
const byDefault = (a, b) => a.catchRateValue - b.catchRateValue || b.minluck - a.minluck;

/**
 * Sort the mouse rows by the current sort column. Without one, the lowest catch rates come first.
 *
 * @param {Array} rows The mouse rows.
 *
 * @return {Array} The sorted rows.
 */
const sortRows = (rows) => {
  if (!sortState.key) {
    return [...rows].sort(byDefault);
  }

  const direction = 'asc' === sortState.direction ? 1 : -1;
  const compare = {
    mouse: (a, b) => a.mouse.localeCompare(b.mouse),
    attractionRate: (a, b) => a.attractionRate - b.attractionRate,
    minluck: (a, b) => a.minluck - b.minluck,
    catchRate: (a, b) => a.catchRateValue - b.catchRateValue,
  }[sortState.key];

  return [...rows].sort((a, b) => {
    // Mice without an attraction rate stay at the bottom either way.
    if ('attractionRate' === sortState.key && (undefined === a.attractionRate || undefined === b.attractionRate)) {
      return (undefined === a.attractionRate) - (undefined === b.attractionRate) || byDefault(a, b);
    }

    return direction * compare(a, b) || byDefault(a, b);
  });
};

/**
 * Mark the header of the current sort column.
 *
 * @param {Array<HTMLElement>} headers The column headers.
 */
const updateSortIndicators = (headers) => {
  for (const header of headers) {
    const isSorted = header.dataset.sort === sortState.key;
    header.classList.toggle('mh-improved-cre-sorted-asc', isSorted && 'asc' === sortState.direction);
    header.classList.toggle('mh-improved-cre-sorted-desc', isSorted && 'desc' === sortState.direction);

    let ariaSort = 'none';
    if (isSorted) {
      ariaSort = 'asc' === sortState.direction ? 'ascending' : 'descending';
    }
    header.setAttribute('aria-sort', ariaSort);
  }
};

/**
 * Render the mouse rows, sorted by the current sort column.
 *
 * @param {HTMLElement} tbody              The table body.
 * @param {Array}       rows               The mouse rows.
 * @param {boolean}     hasAttractionRates Whether to show the attraction rate column.
 */
const renderRows = (tbody, rows, hasAttractionRates) => {
  tbody.replaceChildren();

  for (const { mouse, type, attractionRate, minluck, catchRate, crClass, minluckClass } of sortRows(rows)) {
    const row = makeElement('tr', 'mh-improved-cre-row');
    const name = makeElement('td', 'mh-improved-cre-name');
    const nameLink = makeElement('a', '', mouse);
    nameLink.setAttribute('onclick', `return hg.views.MouseView.show('${type}');`);
    nameLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hg.views.MouseView.show(type);
    });
    name.append(nameLink);
    name.addEventListener('mouseenter', () => {
      name.classList.toggle('mh-improved-cre-name-truncated', name.scrollWidth > name.clientWidth);
    });
    row.append(name);

    if (hasAttractionRates) {
      makeElement('td', ['mh-improved-cre-data', 'mh-improved-cre-ar'], undefined === attractionRate ? '–' : formatAttractionRate(attractionRate), row);
    }

    makeElement('td', minluckClass, minluck, row);
    makeElement('td', crClass, catchRate, row);

    tbody.append(row);
  }
};

/**
 * Render the minluck list.
 *
 * @param {Promise<Array>} list The list of mice.
 */
const renderList = async (list) => {
  let minluckList = document.querySelector('#mh-improved-cre');
  if (!minluckList) {
    minluckList = makeElement('div', 'campPage-trap-trapEffectiveness');
    minluckList.id = 'mh-improved-cre';

    const statsContainer = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
    if (!statsContainer) {
      return;
    }

    statsContainer.append(minluckList);
  }

  const attractionRates = await getAttractionRates(list);
  const hasAttractionRates = attractionRates.size > 0;
  const stageLabel = getStage().label;

  const existing = document.querySelector('#mh-improved-cre-table');
  if (existing) {
    existing.remove();
  }

  minluckList.classList.remove('cre-loading');

  const table = makeElement('table');
  table.id = 'mh-improved-cre-table';

  const tableheader = makeElement('thead');
  const tbody = makeElement('tbody');

  const columns = [
    { key: 'mouse', label: 'Mouse', className: 'name' },
    hasAttractionRates && {
      key: 'attractionRate',
      label: 'AR',
      className: 'mh-improved-cre-ar',
      title: `Attraction rate${stageLabel ? ` at ${stageLabel}` : ''}: the share of attractions that are this mouse`,
    },
    { key: 'minluck', label: 'Minluck' },
    { key: 'catchRate', label: 'Catch Rate' },
  ].filter(Boolean);

  const headers = columns.map((column) => {
    const header = make('th', ['mh-improved-cre-sortable', column.className], column.label, tableheader);
    header.dataset.sort = column.key;
    if (column.title) {
      header.title = column.title;
    }

    header.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (sortState.key === column.key) {
        sortState = { key: column.key, direction: 'asc' === sortState.direction ? 'desc' : 'asc' };
      } else {
        sortState = { key: column.key, direction: defaultSortDirections[column.key] };
      }

      renderRows(tbody, rows, hasAttractionRates);
      updateSortIndicators(headers);
    });

    return header;
  });

  const refreshButton = makeElement('button', 'mh-improved-cre-refresh');
  refreshButton.type = 'button';
  refreshButton.title = 'Refresh';
  refreshButton.setAttribute('aria-label', 'Refresh catch rates');
  refreshButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    minluckList.classList.add('cre-loading-refresh');
    minluckList.classList.add('cre-loading');
    await updateMinLucks(false);
    minluckList.classList.remove('cre-loading');
    minluckList.classList.remove('cre-loading-refresh');
  });
  headers[0].append(refreshButton);

  updateSortIndicators(headers);
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
      trapAuras,
    };

    const minluck = await getMinluck(options);
    let catchRate = await getCatchRate(options);
    if (Number.isNaN(catchRate.rate)) {
      catchRate = {
        rate: 0,
        percent: '0%',
      };
    }

    if (hasUltimateCharm()) {
      catchRate.rate = 1;
      catchRate.percent = '100%';
    }

    const crClass = getRateClasses(catchRate.rate, minluck);
    const minluckClass = getRateClasses(catchRate.rate, minluck);

    rows.push({
      mouse: mouse.name,
      type: mouse.type,
      attractionRate: attractionRates.get(mouse.type),
      minluck,
      catchRateValue: catchRate.rate,
      catchRate: catchRate.percent,
      crClass,
      minluckClass,
    });
  }

  if (rows.length === 0) {
    makeElement('span', 'mh-improved-cre-no-mice', 'No mice found.', table);
    minluckList.append(table);
    doEvent('mh-improved-cre-list-rendered');
    return;
  }

  renderRows(tbody, rows, hasAttractionRates);
  table.append(tbody);

  const overallCatchRate = hasAttractionRates ? getOverallCatchRate(rows) : null;
  if (null !== overallCatchRate) {
    const tfoot = makeElement('tfoot');
    tfoot.append(makeOverallRow(rows, overallCatchRate));
    table.append(tfoot);
  }

  minluckList.append(table);

  updateTrapView(rows, overallCatchRate);
  updateTrapEffectivenessText(overallCatchRate);
  saveRenderedStage();

  doEvent('mh-improved-cre-list-rendered');
};

/**
 * Main function.
 */
const main = async () => {
  onNavigation(
    () => {
      updateMinLucks(true);
    },
    {
      page: 'camp',
    }
  );

  if (getFlag('catch-rate-estimate-more-refresh')) {
    onRequest('*', updateMinLucks, true, ['users/getmiceeffectiveness.php']);
  } else {
    onRequest('users/changetrap.php', updateMinLucks);
    onTravel(null, { callback: updateMinLucks });
    addRefreshTriggers(() => updateMinLucks(false));
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
  name: 'Catch Rate & Minluck',
  type: 'hunting-traps',
  default: true,
  description: 'Show minluck and catch rate estimates on the Camp page.',
  load: init,
};
