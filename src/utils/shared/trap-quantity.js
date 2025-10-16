import {
  dataGet,
  dataSet,
  getCurrentPage,
  getUserItems,
  makeElement,
  onEvent,
  onNavigation,
  onRequest,
  onTurn,
  sleep
} from '@utils';

/**
 * Get the selector for the item.
 *
 * @param {string} itemId The item ID.
 * @param {Array}  bases  The base IDs.
 *
 * @return {string} The selector.
 */
const getIdSelector = (itemId, bases) => {
  if (Array.isArray(bases)) {
    bases = bases.join('-');
  }
  return `mh-improved-${itemId}-${bases}-counter`;
};

const getQuantity = async (itemId) => {
  return await dataGet(`${itemId}-quantity`, 0);
};

/**
 * Add the quantity to the display.
 */
const addQuantityToDisplay = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  for (const opts of options) {
    let bases = opts.baseIds;
    const itemId = opts.itemId;

    const selector = getIdSelector(itemId, bases);

    const existingCounter = document.querySelector(`.${selector}`);
    if (existingCounter) {
      existingCounter.remove();
    }

    bases = bases.map((base) => Number.parseInt(base, 10));
    const userBase = Number.parseInt(user.base_item_id, 10);

    if (! bases.includes(userBase)) {
      continue;
    }

    const amount = await getQuantity(itemId);

    const counter = document.querySelector(`.${selector}-text`);
    if (counter) {
      counter.textContent = amount;
      continue;
    }

    const trapContainer = document.querySelector('.trapSelectorView__armedItem[data-item-classification="base"] .trapSelectorView__armedItemImage');
    if (! trapContainer) {
      continue;
    }

    const newCounter = makeElement('div', ['trapSelectorView__armedItemQuantity', selector, 'mh-improved-trap-quantity']);
    makeElement('span', `${selector}-text`, amount.toLocaleString(), newCounter);

    trapContainer.append(newCounter);
  }
};

/**
 * Add the quantity to the trap browser.
 *
 * @param {Element} el     The element to add the quantity to.
 * @param {string}  itemId The item ID.
 * @param {string}  base   The base ID.
 */
const addQuantityToTrapBrowserItem = async (el, itemId, base) => {
  if (! el || ! itemId || ! base) {
    return;
  }

  const selector = getIdSelector(itemId, base);

  const exists = document.querySelector(`.campPage-trap-itemBrowser-favorite-item-quantity .quantity-${itemId}-wrapper .${selector}-blueprint`);
  if (exists) {
    const qty = await getQuantity(itemId);

    exists.textContent = qty.toLocaleString();
    return;
  }

  const qty = await getQuantity(itemId);

  const counter = makeElement('div', ['campPage-trap-itemBrowser-favorite-item-quantity', `quantity-${itemId}-wrapper`]);
  makeElement('span', ['campPage-trap-itemBrowser-favorite-item-image-quantity', 'base-quantity', `${selector}-blueprint`], qty.toLocaleString(), counter);

  el.append(counter);
};

/**
 * Add the quantity to the trap browser for slugs.
 */
const addToTrapBrowserForSlugs = async () => {
  options.forEach(async (opts) => {
    for (const base of opts.baseSlugs) {
      const el = document.querySelector(`.campPage-trap-itemBrowser-item-image[data-item-type="${base}"]`);
      if (el) {
        await addQuantityToTrapBrowserItem(el, opts.itemId, base);
      }
    }

    for (const base of opts.baseIds) {
      const favoriteEl = document.querySelector(`.campPage-trap-itemBrowser-favorite-item-image[data-item-id="${base}"]`);
      if (favoriteEl) {
        await addQuantityToTrapBrowserItem(favoriteEl, opts.itemId, base);
      }
    }
  });
};

/**
 * Add the quantity to the trap browser.
 *
 * @param {string} tab The tab to add the quantity to.
 */
const addQtyToTrapBrowser = async (tab) => {
  if ('item_browser' !== tab) {
    return;
  }

  await addToTrapBrowserForSlugs();
};

/**
 * Handle change trap events.
 */
const onChangeTrap = async () => {
  const trapSelector = document.querySelector('.trapSelectorView__blueprint.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent--items[data-blueprint-type="base"]');
  if (trapSelector) {
    for (const opts of options) {
      await addQtyToTrapBrowser('item_browser', opts);
    }
  }
};

let allItems = [];
const maybeClearCache = async (response) => {
  sleep(250);

  const currentBase = Number.parseInt(user.base_item_id, 10);

  for (const opts of options) {
    if (opts.baseIds.includes(currentBase)) {
      allItems.push(opts.itemId);
    }
  }

  allItems = [...new Set(allItems)];

  if (! allItems.length) {
    return;
  }

  const hasItemsInResponse = allItems.every((itemId) => Object.prototype.hasOwnProperty.call(response?.inventory ?? {}, itemId));
  const details = hasItemsInResponse
    ? response.inventory
    : await getUserItems(allItems, true);
  for (const itemId in details) {
    const qty = Number.parseInt(details[itemId]?.quantity) || 0;

    dataSet(`${details[itemId].type}-quantity`, qty);
  }
};

const addEvents = () => {
  setTimeout(async () => {
    await maybeClearCache();
    addQuantityToDisplay();
  }, 250);
  onNavigation(addQuantityToDisplay, { page: 'camp' });

  onRequest('users/changetrap.php', async () => {
    await maybeClearCache();
    await onChangeTrap();
    addQuantityToDisplay();
  });

  onEvent('camp_page_toggle_blueprint', async (tab) => {
    await addQtyToTrapBrowser(tab);
  });

  onTurn(async (response) => {
    await maybeClearCache(response);
    setTimeout(addQuantityToDisplay, 250);
  }, 250);
};

const options = [];
let hasAddedEvents = false;

/**
 * Add the quantity to the trap.
 *
 * @param {Object} opts         The options for the trap.
 * @param {string} opts.itemId  The item ID.
 * @param {Array}  opts.baseIds The base IDs.
 */
const addTrapQuantity = async (opts) => {
  if (! opts.itemId || ! opts.baseIds) {
    return;
  }

  options.push(opts);

  if (! hasAddedEvents) {
    hasAddedEvents = true;
    addEvents();
  }
};

export {
  addTrapQuantity
};
