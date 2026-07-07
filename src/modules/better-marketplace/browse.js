import {
  abbreviateNumber,
  formatGold,
  getData,
  getSetting,
  lsGet,
  lsSet,
  makeElement,
  parseGold,
  waitForElement
} from '@utils';

const LAST_VIEWED_KEY = 'mh-improved-marketplace-last-viewed';

/**
 * Get the classification of the currently active browse category (e.g.
 * 'skins', 'bait'), which is more stable than the localized display text.
 *
 * @return {string} The category classification, or an empty string if absent.
 */
const getActiveCategory = () => {
  const active = document.querySelector('.marketplaceView-browse-sidebar-link.active');
  return active?.dataset.classification || '';
};

/**
 * Get the header row of the browse table. The marketplace table has no
 * `<thead>` — the header is just the first `<tr>` that contains `<th>` cells.
 *
 * @param {Element} table The browse table.
 *
 * @return {Element|null} The header row, or null if not found.
 */
const getHeaderRow = (table) => {
  const headerCell = table.querySelector('th');
  return headerCell ? headerCell.closest('tr') : null;
};

/**
 * Get the owned quantity for a row.
 *
 * @param {Element} row The table row.
 *
 * @return {number} The owned quantity.
 */
const getOwnedQuantity = (row) => {
  const ownedText = row.querySelector('.marketplaceView-table-quantity')?.textContent?.trim();
  if (! ownedText || ownedText === '-') {
    return 0;
  }

  return parseGold(ownedText);
};

/**
 * Get the average price for a row.
 *
 * @param {Element} row The table row.
 *
 * @return {number} The average price, or 0 if unavailable.
 */
const getAveragePrice = (row) => {
  const priceEl = row.querySelector('.marketplaceView-table-averagePrice .marketplaceView-goldValue');
  if (! priceEl) {
    return 0;
  }

  // The gold value usually wraps the number in an <abbr> whose title holds the
  // full "12,345 Gold" string; fall back to the element's own text otherwise.
  if (priceEl.children.length > 0 && priceEl.children[0].title) {
    return parseGold(priceEl.children[0].title);
  }

  return parseGold(priceEl.textContent);
};

/**
 * Reorder the browse table rows based on a numeric data attribute.
 *
 * @param {Element} table     The browse table.
 * @param {Element} header    The header that was clicked.
 * @param {string}  attribute The data attribute to sort by.
 * @param {boolean} [numeric] Whether to compare values numerically.
 */
const sortTableByAttribute = (table, header, attribute, numeric = true) => {
  if (header.classList.contains('active')) {
    header.classList.toggle('reverse');
  } else {
    header.classList.add('active');
    table.querySelectorAll('.sortable.active').forEach((el) => {
      if (el !== header) {
        el.classList.remove('active', 'reverse');
      }
    });
  }

  const body = table.querySelector('tbody') || table;
  const reverse = header.classList.contains('reverse');
  const rows = [...body.querySelectorAll('tr[data-item-id]')];

  rows.sort((a, b) => {
    let aVal = a.dataset[attribute] || '';
    let bVal = b.dataset[attribute] || '';

    if (numeric) {
      aVal = Number.parseInt(aVal, 10) || 0;
      bVal = Number.parseInt(bVal, 10) || 0;
      return reverse ? aVal - bVal : bVal - aVal;
    }

    return reverse ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
  });

  rows.forEach((row) => body.append(row));

  // Keep any 'empty' filler row at the bottom.
  const empty = body.querySelector('tr.empty');
  if (empty) {
    body.append(empty);
  }
};

/**
 * Ensure a shared wrapper for our browse filters exists, placed after the
 * existing checkboxes, and return it.
 *
 * @return {Element|null} The wrapper, or null if the filter container is absent.
 */
const ensureFilterWrapper = () => {
  const filterContainer = document.querySelector('.marketplaceView-browse-filterContainer');
  if (! filterContainer) {
    return null;
  }

  let wrapper = filterContainer.querySelector('.mhui-marketplace-filters');
  if (! wrapper) {
    wrapper = makeElement('div', 'mhui-marketplace-filters');

    // Keep the filters inline with the checkboxes, above the (block) totals
    // readout, so they don't get pushed onto their own line.
    const total = filterContainer.querySelector('.mhui-marketplace-total-value');
    if (total) {
      total.before(wrapper);
    } else {
      filterContainer.append(wrapper);
    }
  }

  return wrapper;
};

/**
 * Show the total estimated value of the current tab in the filter container.
 * The element is always kept in the DOM (hidden when there's nothing to show)
 * so switching between tabs with and without a value doesn't shift the layout.
 *
 * @param {number} totalBuy  The total buy value.
 * @param {number} totalSell The total sell value.
 */
const addTotalsReadout = (totalBuy, totalSell) => {
  const filterContainer = document.querySelector('.marketplaceView-browse-filterContainer');
  if (! filterContainer) {
    return;
  }

  let total = filterContainer.querySelector('.mhui-marketplace-total-value');
  if (! total) {
    total = makeElement('div', 'mhui-marketplace-total-value');
    filterContainer.append(total);
  }

  if (totalBuy > 0) {
    total.title = `${formatGold(totalBuy)} (Buy)\n${formatGold(totalSell)} (Sell)`;
    total.textContent = `Estimated value of owned items: ${formatGold(totalBuy)}`;
    total.classList.remove('mhui-hidden');
  } else {
    total.classList.add('mhui-hidden');
    if (! total.textContent) {
      total.textContent = 'Estimated value of owned items: 0 gold';
    }
  }
};

/**
 * Add a sortable 'Value' column (owned × average price) to the browse table.
 *
 * @param {Element}  table The browse table.
 * @param {NodeList} rows  The table rows.
 */
const addValueColumn = (table, rows) => {
  if (table.querySelector('.marketplaceView-table-estvalue')) {
    return;
  }

  const headerRow = getHeaderRow(table);
  if (! headerRow) {
    return;
  }

  // Append the new column at the end of the table so we don't shift the
  // existing columns (which other styles target by position).
  const valueHeader = makeElement('th', ['marketplaceView-table-estvalue', 'marketplaceView-table-numeric', 'sortable']);
  valueHeader.textContent = 'Value';
  valueHeader.addEventListener('click', () => sortTableByAttribute(table, valueHeader, 'mhuiValue'));
  headerRow.append(valueHeader);

  let totalBuy = 0;
  let totalSell = 0;

  rows.forEach((row) => {
    const owned = getOwnedQuantity(row);
    const price = getAveragePrice(row);
    const buyValue = owned * price;

    let display = abbreviateNumber(buyValue);
    if (price === 0) {
      // Average price is unavailable, but the value isn't necessarily 0.
      display = 'N/A';
    }

    if (buyValue > 0) {
      const sellValue = (price - Math.ceil(price / 11)) * owned;
      totalBuy += buyValue;
      totalSell += sellValue;
      row.dataset.mhuiValue = String(buyValue);
      row.title = `${formatGold(buyValue)} (Buy)\n${formatGold(sellValue)} (Sell)`;
    } else {
      row.dataset.mhuiValue = '0';
    }

    const cell = makeElement('td', ['marketplaceView-table-numeric', 'marketplaceView-table-estvalue-cell']);
    cell.textContent = display;
    row.append(cell);
  });

  addTotalsReadout(totalBuy, totalSell);
};

/**
 * Add a 'Filter by trap' dropdown to the Skins category so skins can be
 * narrowed to a single base trap. Only added on the Skins tab.
 *
 * @param {NodeList} rows The table rows.
 */
const addTrapFilter = async (rows) => {
  const wrapper = ensureFilterWrapper();
  if (! wrapper || wrapper.querySelector('.mhui-marketplace-trap-filter')) {
    return;
  }

  // Insert the select synchronously, before awaiting the item data, so a
  // second (concurrent) call sees it and bails instead of adding a duplicate.
  const select = makeElement('select', 'mhui-marketplace-trap-filter');
  const allOption = makeElement('option');
  allOption.value = '';
  allOption.textContent = 'Filter by trap…';
  select.append(allOption);
  wrapper.append(select);
  wrapper.classList.add('mhui-has-trap-filter');

  const items = await getData('items');
  const trapByItemId = new Map();
  items.forEach((item) => {
    if (item.skin_weapon_name) {
      trapByItemId.set(item.id, item.skin_weapon_name);
    }
  });

  const traps = new Set();
  rows.forEach((row) => {
    const itemId = Number.parseInt(row.getAttribute('data-item-id'), 10);
    const trapName = trapByItemId.get(itemId) || '';

    // Store on the row so we (and the listings text filter) can match it.
    row.dataset.mhuiTrap = trapName.toLowerCase();

    if (trapName) {
      traps.add(trapName);
    }
  });

  if (traps.size === 0) {
    select.remove();
    wrapper.classList.remove('mhui-has-trap-filter');
    return;
  }

  [...traps].sort().forEach((trap) => {
    const option = makeElement('option');
    option.value = trap.toLowerCase();
    option.textContent = trap;
    select.append(option);
  });

  select.addEventListener('change', () => {
    const value = select.value;
    rows.forEach((row) => {
      const matches = ! value || row.dataset.mhuiTrap === value;
      row.classList.toggle('mhui-trap-hidden', ! matches);
    });
  });
};

/**
 * Get the saved last-viewed item map.
 *
 * @return {Object} The map of category name to item ID.
 */
const getLastViewed = () => {
  return lsGet(LAST_VIEWED_KEY, {});
};

/**
 * Record the last-viewed item for a category.
 *
 * @param {string} category The category name.
 * @param {string} itemId   The item ID.
 */
const setLastViewed = (category, itemId) => {
  const map = getLastViewed();
  map[category] = itemId;
  lsSet(LAST_VIEWED_KEY, map);
};

/**
 * Track clicks on browse rows so we can remember the last item viewed per
 * category, and highlight & scroll to it when returning to the list.
 *
 * @param {Element}  table    The browse table.
 * @param {NodeList} rows     The table rows.
 * @param {string}   category The active category name.
 */
const trackAndHighlightLastViewed = (table, rows, category) => {
  if (! category) {
    return;
  }

  rows.forEach((row) => {
    if (row.dataset.mhuiTracked) {
      return;
    }
    row.dataset.mhuiTracked = 'true';

    row.addEventListener('click', () => {
      setLastViewed(category, row.getAttribute('data-item-id'));
    });
  });

  const lastId = getLastViewed()[category];
  if (! lastId) {
    return;
  }

  const lastRow = table.querySelector(`tr[data-item-id="${lastId}"]`);
  if (! lastRow) {
    return;
  }

  lastRow.classList.add('mhui-marketplace-last-viewed');
  lastRow.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
};

/**
 * Enhance the browse table with the value column, skins trap column, and
 * last-viewed highlighting, based on the enabled settings.
 */
const enhanceBrowseTable = async () => {
  const rows = await waitForElement('.marketplaceView-browse-content .marketplaceView-table tr[data-item-id]', { single: false });
  if (! rows || rows.length === 0) {
    return;
  }

  const table = rows[0].closest('table');
  if (! table) {
    return;
  }

  const category = getActiveCategory();

  // The filter container persists across category switches and the rows change
  // on each render, so always rebuild the trap filter from scratch.
  document.querySelector('.mhui-marketplace-trap-filter')?.remove();
  document.querySelector('.mhui-marketplace-filters')?.classList.remove('mhui-has-trap-filter');

  if (getSetting('better-marketplace.value-column', true)) {
    addValueColumn(table, rows);
  }

  if (getSetting('better-marketplace.skin-trap-filter', true) && category === 'skins') {
    await addTrapFilter(rows);
  }

  if (getSetting('better-marketplace.highlight-last-viewed', true)) {
    trackAndHighlightLastViewed(table, rows, category);
  }
};

export {
  enhanceBrowseTable,
  ensureFilterWrapper
};
