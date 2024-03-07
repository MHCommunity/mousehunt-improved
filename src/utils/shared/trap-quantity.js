import {
  cacheGet,
  cacheSet,
  getCurrentPage,
  getUserItems,
  makeElement,
  onEvent,
  onRequest,
  onTurn
} from '@utils';

const getIdSelector = (itemId, bases) => {
  if (Array.isArray(bases)) {
    bases = bases.join('-');
  }
  return `mh-improved-${itemId}-${bases}-counter`;
};

const addQuantityToDisplay = async (itemId, bases) => {
  if ('camp' !== getCurrentPage() || ! itemId || ! bases) {
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

  const newCounter = makeElement('div', ['trapSelectorView__armedItemQuantity', selector]);
  makeElement('span', `${selector}-text`, amount.toLocaleString(), newCounter);

  trapContainer.append(newCounter);
};

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

const addQtyToTrapBrowser = async (tab, opts) => {
  if ('item_browser' !== tab || ! opts.itemId || ! opts.baseSlugs) {
    return;
  }

  opts.baseSlugs.forEach(async (base) => {
    const el = document.querySelector(`.campPage-trap-itemBrowser-item-image[data-item-type="${base}"]`);
    if (! el) {
      return;
    }

    addQuantityToTrapBrowserItem(el, opts.itemId, base);
  });

  opts.baseIds.forEach(async (base) => {
    const faveEl = document.querySelector(`.campPage-trap-itemBrowser-favorite-item-image[data-item-id="${base}"]`);
    if (! faveEl) {
      return;
    }

    addQuantityToTrapBrowserItem(faveEl, opts.itemId, base);
  });
};

const addTrapQuantity = async (opts) => {
  const run = () => {
    addQuantityToDisplay(opts.itemId, opts.baseIds);
  };

  run();
  onRequest('users/changetrap.php', () => {
    run();
    setTimeout(run, 500);

    const trapSelector = document.querySelector('.trapSelectorView__blueprint.trapSelectorView__blueprint--active .trapSelectorView__browserStateParent--items[data-blueprint-type="base"]');
    if (trapSelector) {
      addQtyToTrapBrowser('item_browser', opts);
    }
  });

  onTurn(run, 150);

  onEvent('camp_page_toggle_blueprint', async (tab) => addQtyToTrapBrowser(tab, opts));
};

export {
  addTrapQuantity
};
