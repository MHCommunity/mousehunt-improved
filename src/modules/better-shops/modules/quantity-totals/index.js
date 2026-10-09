import { formatGold, formatNumber, makeElement } from '@utils';

/**
 * Parse a formatted number like "2,224".
 *
 * @param {string|number} value The value to parse.
 *
 * @return {number} The parsed number, or 0.
 */
const parseNumber = (value) => {
  return Number.parseInt(`${value}`.replaceAll(',', ''), 10) || 0;
};

/**
 * Update the gold cost, sell value, and item costs for the entered quantity.
 *
 * @param {Element} container The item purchase container.
 * @param {Element} input     The quantity input.
 */
const updateTotals = (container, input) => {
  const quantity = Math.max(parseNumber(input.value), 0);

  const goldCost = parseNumber(container.dataset.goldCost);
  const gold = container.querySelector('.itemPurchaseView-action-goldGost');
  if (gold && goldCost > 0) {
    if (!gold.dataset.mhiBaseText) {
      gold.dataset.mhiBaseText = gold.textContent;
    }

    if (quantity > 1) {
      gold.textContent = formatGold(goldCost * quantity);
      gold.append(makeElement('span', 'mh-improved-shop-each', `${formatNumber(goldCost)} each`));
    } else {
      gold.textContent = gold.dataset.mhiBaseText;
    }

    gold.classList.toggle('mh-improved-shop-not-enough-gold', goldCost * quantity > Number(user.gold || 0));
  }

  const refundValue = parseNumber(container.dataset.refundValue);
  if (refundValue > 0 && container.classList.contains('can_sell')) {
    let sell = container.querySelector('.mh-improved-shop-sell-value');
    if (!sell) {
      sell = makeElement('div', 'mh-improved-shop-sell-value');
      gold?.after(sell);
    }

    sell.textContent = quantity > 0 ? `Sells for ${formatGold(refundValue * quantity)}` : '';
  }

  container.querySelectorAll('.itemPurchaseView-action-itemCost-table-row').forEach((row) => {
    const cost = row.querySelector('.itemPurchaseView-action-itemCost-table-cell.cost');
    const owned = row.querySelector('.itemPurchaseView-action-itemCost-owned');
    if (!cost || !owned) {
      return;
    }

    if (!row.dataset.mhiBaseError) {
      row.dataset.mhiBaseError = row.classList.contains('error') ? 'true' : 'false';
    }

    const perItem = parseNumber(owned.dataset.itemQuantity || cost.textContent);
    const total = perItem * Math.max(quantity, 1);

    cost.textContent = formatNumber(total);
    row.classList.toggle('error', 'true' === row.dataset.mhiBaseError || total > parseNumber(owned.textContent));
  });
};

/**
 * Keep the shown costs in sync with the quantity input.
 *
 * @param {Element} block The shop block.
 * @param {Element} input The quantity input.
 */
export default (block, input) => {
  const container = block.closest('.itemPurchaseView-container');
  if (!container) {
    return;
  }

  if (input.dataset.mhiShopTotals !== 'true') {
    input.dataset.mhiShopTotals = 'true';

    // The quantity buttons fire keyup rather than input.
    const update = () => updateTotals(container, input);
    input.addEventListener('input', update);
    input.addEventListener('keyup', update);
  }

  updateTotals(container, input);
};
