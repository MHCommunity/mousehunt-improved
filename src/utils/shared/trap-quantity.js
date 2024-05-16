import {
  cacheGet,
  cacheSet,
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

/**
 * Add the quantity to the display.
 */
const addQuantityToDisplay = async () => {
  options.forEach(async (opts) => {
    let bases = opts.baseIds;
    const itemId = opts.itemId;

    if ('camp' !== getCurrentPage()) {
      return;
    }

    const selector = getIdSelector(itemId, bases);

    const existingCounter = document.querySelector(`.${selector}`);
    if (existingCounter) {
      existingCounter.remove();
    }

    bases = bases.map((base) => Number.parseInt(base, 10));
    const userBase = Number.parseInt(user.base_item_id, 10);

    if (! bases.includes(userBase)) {
      return;
    }

    const details = await getUserItems([itemId], true);
    const amount = details[0]?.quantity || 0;

    cacheSet(`${itemId}-quantity`, amount);

    const counter = document.querySelector(`.${selector}-text`);
    if (counter) {
      counter.textContent = amount;
      return;
    }

    const trapContainer = document.querySelector('.trapSelectorView__armedItem[data-item-classification="base"] .trapSelectorView__armedItemImage');
    if (! trapContainer) {
      return;
    }

    const newCounter = makeElement('div', ['trapSelectorView__armedItemQuantity', selector, 'mh-improved-trap-quantity']);
    makeElement('span', `${selector}-text`, amount.toLocaleString(), newCounter);

    trapContainer.append(newCounter);
  });
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

  let qty = await cacheGet(`${itemId}-quantity`, 0);
  qty = Number.parseInt(qty, 10);

  const exists = document.querySelector(`.${selector}-blueprint`);
  if (exists) {
    exists.textContent = qty.toLocaleString();
    return;
  }

  const counter = makeElement('div', 'campPage-trap-itemBrowser-favorite-item-quantity');
  makeElement('span', ['campPage-trap-baitQuantity', `${selector}-blueprint`], qty.toLocaleString(), counter);

  el.append(counter);
};

/**
 * Add the quantity to the trap browser for slugs.
 */
const addToTrapBrowserForSlugs = async () => {
  options.forEach(async (opts) => {
    opts.baseSlugs.forEach(async (base) => {
      const el = document.querySelector(`.campPage-trap-itemBrowser-item-image[data-item-type="${base}"]`);
      if (! el) {
        return;
      }

      addQuantityToTrapBrowserItem(el, opts.itemId, base);
    });
  });
};

/**
 * Add the quantity to the trap browser for IDs.
 */
const addToTrapBrowserForIds = async () => {
  options.forEach(async (opts) => {
    opts.baseIds.forEach(async (base) => {
      const faveEl = document.querySelector(`.campPage-trap-itemBrowser-favorite-item-image[data-item-id="${base}"]`);
      if (! faveEl) {
        return;
      }

      addQuantityToTrapBrowserItem(faveEl, opts.itemId, base);
    });
  });
};

/**
 * Add the quantity to the trap browser for bases.
 */
const addToTrapBrowserForBases = async () => {
  addToTrapBrowserForSlugs();
  addToTrapBrowserForIds();
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

  onRequest('users/gettrapcomponents.php', addToTrapBrowserForBases);

  await sleep(1000);

  addToTrapBrowserForBases();

  // add a listener for changes to campPage-trap-itemBrowser-items to re-run when a search or filter is applied. remove the listener when the element is removed
  const trapItems = document.querySelector('.campPage-trap-itemBrowser-items');
  if (! trapItems) {
    return;
  }

  const observer = new MutationObserver(addToTrapBrowserForBases);
  observer.observe(trapItems, { childList: true, attributes: true, subtree: true });
};

/**
 * Handle change trap events.
 */
const onChangeTrap = () => {
  const trapSelector = document.querySelector('.trapSelectorView__blueprint.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent--items[data-blueprint-type="base"]');
  if (trapSelector) {
    options.forEach(async (opts) => {
      addQtyToTrapBrowser('item_browser', opts);
    });
  }
};

const options = [];
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

  onRequest('users/changetrap.php', onChangeTrap);
  onEvent('camp_page_toggle_blueprint', async (tab) => addQtyToTrapBrowser(tab));

  addQuantityToDisplay();
  onNavigation(addQuantityToDisplay, { page: 'camp' });
  onTurn(addQuantityToDisplay, 150);
};

export {
  addTrapQuantity
};
