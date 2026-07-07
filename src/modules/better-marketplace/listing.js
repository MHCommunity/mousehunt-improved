import {
  abbreviateNumber,
  formatGold,
  formatNumber,
  getSetting,
  makeElement,
  makeMathButtons,
  makeMhButton,
  parseGold,
  parseNumber,
  waitForElement
} from '@utils';

/**
 * Maximum number of quick price links to show, to avoid clutter.
 */
const MAX_PRICE_LINKS = 6;

/**
 * Round a number to a given number of significant figures, so derived steps
 * (like 1% of the price) land on tidy values instead of e.g. 5,234.
 *
 * @param {number} num   The number to round.
 * @param {number} [sig] The number of significant figures.
 *
 * @return {number} The rounded number.
 */
const roundToSignificant = (num, sig = 2) => {
  if (num <= 0) {
    return 0;
  }

  const magnitude = Math.floor(Math.log10(num));
  const factor = 10 ** (magnitude - sig + 1);
  return Math.round(num / factor) * factor;
};

/**
 * Set the order price via the game, if available.
 *
 * @param {number} price The price to set.
 */
const setOrderPrice = (price) => {
  if (hg?.views?.MarketplaceView?.setOrderPrice) {
    hg.views.MarketplaceView.setOrderPrice(price);
  }
};

/**
 * Set the order quantity via the game, if available.
 *
 * @param {number} quantity The quantity to set.
 */
const setOrderQuantity = (quantity) => {
  if (hg?.views?.MarketplaceView?.setOrderQuantity) {
    hg.views.MarketplaceView.setOrderQuantity(quantity);
  }
};

/**
 * Get the current listing action type (buy or sell).
 *
 * @return {string} 'buy' or 'sell'.
 */
const getActionType = () => {
  const actionType = document.querySelector('.marketplaceView-item-actionType .marketplaceView-listingType');
  if (! actionType) {
    return '';
  }

  return actionType.classList.contains('buy') ? 'buy' : 'sell';
};

/**
 * Get the most competitive existing price to base undercut/overbid links on,
 * using the game's own helpers.
 *
 * When selling, we undercut the lowest existing sell listing (the price buyers
 * pay), which the game exposes as getBestBuyPrice. When buying, we overbid the
 * highest existing buy order, exposed as getBestSalePrice.
 *
 * @param {string}        type   The current action type.
 * @param {string|number} itemId The item ID.
 *
 * @return {number} The base price, or 0 if unavailable.
 */
const getBasePrice = (type, itemId) => {
  const view = hg?.views?.MarketplaceView;
  if (! view) {
    return 0;
  }

  const price = type === 'sell'
    ? view.getBestBuyPrice?.(itemId)
    : view.getBestSalePrice?.(itemId);

  return price || 0;
};

/**
 * Read the competing listing prices (in display order, best first) for a type.
 * Selling reads the sell listings; buying reads the buy orders.
 *
 * @param {string} type The action type.
 *
 * @return {Array<number>} The listing unit prices.
 */
const getListingPrices = (type) => {
  const links = document.querySelectorAll(`.marketplaceView-item-quickListings.${type} .marketplaceView-table-listing-unitPrice a`);
  return [...links].map((el) => parseGold(el.textContent)).filter((price) => price > 0);
};

/**
 * Build a sensible, non-hardcoded set of step amounts for the quick links,
 * based on the best competing price (and the second-best where useful): a flat
 * 100 gold, 1%, 10%, the nearest round "place value" step (52,000 -> 1,000,
 * 2,000,000 -> 100,000), and the gap to the second-best listing when that gap
 * is a reasonable (not huge) increment.
 *
 * @param {number} best   The best competing price.
 * @param {number} second The second-best competing price, if any.
 *
 * @return {Array<Object>} Sorted, de-duplicated steps as `{ amount, note }`.
 */
const computeSteps = (best, second) => {
  const notes = new Map();

  const add = (amount, note = '') => {
    if (amount <= 0) {
      return;
    }

    // Keep the first note set for an amount, but let a note fill a blank one.
    if (! notes.has(amount) || (note && ! notes.get(amount))) {
      notes.set(amount, note);
    }
  };

  // Percentages first so they keep their annotation if another step collides.
  add(roundToSignificant(best * 0.01), '1%');
  add(roundToSignificant(best * 0.1), '10%');

  if (best > 100) {
    add(100);
  }

  // Nearest round "place value" step, one order of magnitude below the price.
  add(10 ** Math.max(0, Math.floor(Math.log10(best)) - 1));

  // The gap to the second-best listing, when it's a meaningful (not huge) step.
  if (second && second !== best) {
    const gap = Math.abs(second - best);
    if (gap > 0 && gap <= best * 0.5) {
      add(gap);
    }
  }

  return [...notes.entries()]
    .map(([amount, note]) => ({ amount, note }))
    .sort((a, b) => a.amount - b.amount)
    .slice(0, MAX_PRICE_LINKS);
};

/**
 * Build a price link that sets the order price when clicked. The step and price
 * are separate spans so they can be aligned into columns.
 *
 * @param {string} stepLabel The step text (e.g. "+100 (1%):").
 * @param {number} price     The price to set.
 *
 * @return {Element} The link element.
 */
const makePriceLink = (stepLabel, price) => {
  // Intentionally not using `marketplaceView-goldValue`: it appends a gold-coin
  // pseudo-element (which broke the column layout) and sets pointer-events:none
  // (which stopped the click from registering).
  const link = makeElement('a', 'mhui-marketplace-price-link');
  link.href = '#';
  link.title = `Set price to ${formatGold(price)}`;
  makeElement('span', 'mhui-marketplace-price-step', stepLabel, link);
  makeElement('span', 'mhui-marketplace-price-value', formatNumber(price), link);
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setOrderPrice(price);
  });

  return link;
};

/**
 * Build a quantity link that sets the order quantity when clicked.
 *
 * @param {string} label    The link text.
 * @param {number} quantity The quantity to set.
 *
 * @return {Element} The link element.
 */
const makeQuantityLink = (label, quantity) => {
  return makeMhButton({
    text: label,
    size: 'tiny',
    className: ['mhui-marketplace-quantity-link', 'lightBlue'],
    title: `Set quantity to ${formatNumber(quantity)}`,
    callback: (event) => {
      event.preventDefault();
      setOrderQuantity(quantity);
    },
  });
};

/**
 * Add quick undercut/overbid links to the price input's suggested area.
 *
 * @param {string}        type   The current action type.
 * @param {string|number} itemId The item ID.
 */
const addQuickPriceLinks = (type, itemId) => {
  // The unit price suggestions live in a per-state container so they only show
  // for the active buy/sell state.
  const container = document.querySelector(`.marketplaceView-item-input.unitPrice .marketplaceView-item-input-suggested .marketplaceView-item-state.${type}`);
  if (! container) {
    return;
  }

  const existing = container.querySelector('.mhui-marketplace-price-links');
  if (existing) {
    existing.remove();
  }

  const prices = getListingPrices(type);
  const best = prices[0] || getBasePrice(type, itemId);
  if (! best || best <= 0) {
    return;
  }

  const steps = computeSteps(best, prices[1]);
  if (steps.length === 0) {
    return;
  }

  const verb = type === 'sell' ? 'Undercut' : 'Overbid';
  const sign = type === 'sell' ? '-' : '+';
  const wrapper = makeElement('div', 'mhui-marketplace-price-links');

  // A single leading label, on its own line above the list, keeps each chip
  // compact (no repeated "Overbid by").
  makeElement('span', 'mhui-marketplace-price-links-label', `${verb}:`, wrapper);

  steps.forEach(({ amount, note }) => {
    const price = type === 'sell' ? best - amount : best + amount;

    // Sell prices must stay positive; buy prices must stay under the tx cap.
    if (type === 'sell' && price < 1) {
      return;
    }

    if (type === 'buy' && price >= 4294967293) {
      return;
    }

    // e.g. "+840k (10%):" in one column, the price (tabular) in the next.
    const noteText = note ? ` (${note})` : '';
    wrapper.append(makePriceLink(`${sign}${abbreviateNumber(amount)}${noteText}:`, price));
  });

  // Only show the group if at least one price link was added (label + 1+).
  if (wrapper.children.length > 1) {
    container.append(wrapper);
  }
};

/**
 * Get the quantity of this item you own, read from the 'Sell All' suggestion
 * (only present when selling).
 *
 * @return {number} The owned quantity, or 0 if not found.
 */
const getOwnedQuantity = () => {
  const sellAll = document.querySelector('.marketplaceView-item-input.quantity .marketplaceView-item-state.sell .marketplaceView-item-input-suggested a');
  const match = sellAll?.textContent.match(/([\d,]+)/);
  return match ? parseGold(match[1]) : 0;
};

/**
 * Get the current value of the order quantity input.
 *
 * @return {number} The current quantity, or 0.
 */
const getCurrentQuantity = () => {
  const input = document.querySelector('.marketplaceView-item-input.quantity input');
  return input ? parseNumber(input.value) : 0;
};

/**
 * Add quick quantity buttons under the quantity input: a row of +1/+10/+100
 * math buttons (hold Shift to subtract), and a second row with 10%-of-owned
 * and All when selling.
 *
 * @param {string} type The current action type.
 */
const addQuantityButtons = (type) => {
  const wrapper = document.querySelector('.marketplaceView-item-input.quantity');
  if (! wrapper || wrapper.querySelector('.mhui-marketplace-quantity-links')) {
    return;
  }

  // When selling, reuse the existing (visible) suggested area; when buying the
  // game doesn't add one, so create our own positioned container.
  let host = type === 'sell'
    ? wrapper.querySelector('.marketplaceView-item-state.sell .marketplaceView-item-input-suggested')
    : null;

  if (! host) {
    host = makeElement('div', ['marketplaceView-item-input-suggested', 'mhui-marketplace-quantity-suggested']);
    wrapper.append(host);
  }

  const owned = type === 'sell' ? getOwnedQuantity() : 0;

  const list = makeElement('div', 'mhui-marketplace-quantity-links');

  const numbersRow = makeElement('div', 'mhui-marketplace-quantity-row', '', list);
  makeMathButtons([1, 10, 100], {
    appendTo: numbersRow,
    maxQty: type === 'sell' && owned > 0 ? owned : Number.MAX_SAFE_INTEGER,
    classNames: ['tiny', 'lightBlue', 'mhui-marketplace-quantity-link'],
    getValue: getCurrentQuantity,
    setValue: setOrderQuantity,
  });

  if (type === 'sell' && owned > 0) {
    const percentsRow = makeElement('div', 'mhui-marketplace-quantity-row', '', list);
    percentsRow.append(makeQuantityLink('10%', Math.max(1, Math.round(owned * 0.1))));
    percentsRow.append(makeQuantityLink('All', owned));
  }

  host.append(list);
};

/**
 * Add raw/tax tariff information to each sell & buy order row, shown as a
 * hover tooltip on the row and its quantity cell.
 */
const addTariffInfo = () => {
  const rows = document.querySelectorAll('.marketplaceView-item-quickListings .marketplaceView-table tr');
  rows.forEach((row) => {
    const priceEl = row.querySelector('.marketplaceView-table-listing-unitPrice a');
    const quantityEl = row.querySelector('.marketplaceView-table-listing-quantity');
    if (! priceEl || ! quantityEl || quantityEl.dataset.mhuiTariff) {
      return;
    }

    const value = parseGold(priceEl.textContent);
    if (value <= 0) {
      return;
    }

    const tax = Math.ceil(value / 11);
    const raw = value - tax;
    const info = `${formatNumber(raw)} (Raw)\n${formatNumber(tax)} (Tax)`;

    quantityEl.dataset.mhuiTariff = 'true';
    row.title = info;
    quantityEl.title = info;
  });
};

/**
 * Enhance the item listing view with quick links and tariff info, based on the
 * enabled settings. Called after an item view is shown.
 *
 * @param {string|number} itemId The item ID being shown.
 */
const enhanceItemView = async (itemId) => {
  // Wait for the quick listings to load (the best-price row appears once they
  // have rendered), so the game's best-price helpers have data to work with.
  const listings = await waitForElement('.marketplaceView-item-quickListings .bestPrice');
  if (! listings) {
    return;
  }

  const type = getActionType();

  if (getSetting('better-marketplace.quick-price-links', true)) {
    addQuickPriceLinks(type, itemId);
  }

  if (getSetting('better-marketplace.quick-quantity-buttons', true)) {
    addQuantityButtons(type);
  }

  if (getSetting('better-marketplace.tariff-info', true)) {
    addTariffInfo();
  }
};

export {
  enhanceItemView
};
