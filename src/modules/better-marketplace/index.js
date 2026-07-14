import {
  addOnboardingTip,
  addStyles,
  debounce,
  formatGold,
  formatNumber,
  getData,
  getItemLinks,
  getSetting,
  makeElement,
  makeMhButton,
  onOverlayChange,
  onRequest,
  parseNumber,
  saveOnboardingStep,
  waitForElement
} from '@utils';

import { enhanceBrowseTable, ensureFilterWrapper } from './browse';
import { addPriceChart } from './price-chart';
import { calculateQuickSell } from './pricing';
import { createMarketplaceRuntime } from './runtime';
import { enhanceItemView } from './listing';
import settings from './settings';

import extras from './styles/extras.css';
import priceChartStyles from './styles/price-chart.css';
import quickSellStyles from './styles/quick-sell.css';
import smallImages from './styles/small-images.css';
import styles from './styles/styles.css';
import trendNumbers from './styles/trend-numbers.css';

const BUY_SELL_TOGGLE_STEP = 'better-marketplace-buy-sell-toggle';
const marketplaceRuntime = createMarketplaceRuntime();

/**
 * Update the quantity buttons.
 *
 * @param {Element} searchInputDOM The search input DOM element.
 */
const initSearch = (searchInputDOM) => {
  // add one blank one to the start
  const blankOpt = document.createElement('option');
  blankOpt.value = '';
  blankOpt.text = '';
  blankOpt.disabled = true;
  blankOpt.selected = true;
  blankOpt.hidden = true;
  searchInputDOM.prepend(blankOpt);

  searchInputDOM = $('.marketplaceView-header-search');
  searchInputDOM
    .select2({
      formatResult: hg.views.MarketplaceView.formatSelect2Result,
      formatSelection: hg.views.MarketplaceView.formatSelect2Result,
      dropdownAutoWidth: false,
      placeholder: 'Search for items…',
      minimumInputLength: 0,
      dropdownCssClass: 'marketplaceView-header-search-dropdown',
      width: 'resolve',
    })
    .on('change', () => {
      if (! searchInputDOM.prop('disabled') && searchInputDOM.val()) {
        hg.views.MarketplaceView.showItem(
          searchInputDOM.val(),
          'view',
          false,
          false,
          true
        );
      }
    });
};

let originalSelect = null;
let newSelect = null;
let searchRoot = null;
let searchTimeout = null;

/**
 * Modify the search options.
 *
 * @param {Array} opts The options to modify.
 */
const modifySearch = async (opts) => {
  const searchContainer = document.querySelector('.marketplaceView-header-searchContainer');
  if (! searchContainer) {
    return;
  }

  if (searchContainer.querySelector('label.mhui-marketplace-search-toggle')) {
    return;
  }

  let searchInputDOM = $('.marketplaceView-header-search'); // only place we use jquery because select2 is weird.
  searchInputDOM.select2('destroy');

  if (originalSelect === null) {
    // save the original options
    const originalSelectNode = document.querySelector('.marketplaceView-header-search');
    originalSelect = originalSelectNode.cloneNode(true);
    originalSelect.classList.remove('marketplaceView-header-search');
  }

  const itemsToRemove = await getData('marketplace-hidden-items');

  opts.forEach((opt) => {
    if (! opt.value || opt.value === '' || (itemsToRemove && itemsToRemove.some((item) => item.id === opt.value || item.name === opt.text))) {
      opt.remove();
    }
  });

  initSearch(searchInputDOM);

  newSelect = document.querySelector('select.marketplaceView-header-search');
  if (! newSelect) {
    return;
  }

  // make a checkbox to toggle the search
  const toggleSearch = makeElement('input', 'mhui-marketplace-search-toggle');
  toggleSearch.setAttribute('type', 'checkbox');

  const label = makeElement('label', 'mhui-marketplace-search-toggle');
  label.setAttribute('for', 'mhui-marketplace-search-toggle');

  label.append(toggleSearch);
  label.append(document.createTextNode('Search all items'));

  const defaultToAll = getSetting('better-marketplace.search-all');
  toggleSearch.checked = defaultToAll;

  // if we default to all, then we want to show the original options but still have the new ones available.
  if (defaultToAll) {
    newSelect.innerHTML = originalSelect.innerHTML;
    newSelect.value = originalSelect.value;
  }

  // toggle the checkbox when the label is clicked
  label.addEventListener('click', () => {
    toggleSearch.checked = ! toggleSearch.checked;
    toggleSearch.dispatchEvent(new Event('change'));
  });

  toggleSearch.addEventListener('change', () => {
    // destroy the select2, then add the original options back
    searchInputDOM = $('.marketplaceView-header-search'); // only place we use jquery because select2 is weird.
    searchInputDOM.select2('destroy');

    const currentOpts = document.querySelector('.marketplaceView-header-search');

    if (toggleSearch.checked) {
      currentOpts.innerHTML = originalSelect.innerHTML;
      currentOpts.value = originalSelect.value;
    } else {
      currentOpts.innerHTML = newSelect.innerHTML;
      currentOpts.value = newSelect.value;
    }

    initSearch(searchInputDOM);
  });

  searchContainer.append(label);
};

/**
 * Wait for the search to be ready before modifying it.
 *
 * @param {number} attempts The number of attempts made.
 */
const waitForSearchReady = (attempts = 0) => {
  const opts = document.querySelectorAll('.marketplaceView-header-search option');

  // if there are no options, try again
  if (opts.length === 0) {
    if (attempts < 10) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => waitForSearchReady(attempts + 1), 300);
    }
    return;
  }

  clearTimeout(searchTimeout);

  // wait another 300ms to make sure it's ready
  searchTimeout = setTimeout(modifySearch, 300, opts);
};

const initializeSearchSession = () => {
  const root = document.querySelector('.marketplaceView');
  if (searchRoot !== root) {
    searchRoot = root;
    originalSelect = null;
    newSelect = null;
  }

  waitForSearchReady();
};

/**
 * Close the claim dialog after a successful claim.
 *
 * @param {Object} resp The response from the claim request.
 */
const autocloseClaim = (resp) => {
  if (! (resp && resp.success)) {
    return;
  }

  const journalEntry = resp?.journal_markup?.[0]?.render_data?.css_class;
  if (! journalEntry || journalEntry === '') {
    return;
  }

  if (
    journalEntry.includes('marketplace_claim_listing') ||
    journalEntry.includes('marketplace_complete_listing') ||
    journalEntry.includes('marketplace_cancel_listing')
  ) {
    setTimeout(() => hg.views.MarketplaceView.hideDialog(), 0);
  }
};

/**
 * Decorate the current item view.
 *
 * @param {Object}        session        The item view session.
 * @param {string|number} session.itemId The item ID.
 */
const enhanceItemSession = async ({ itemId }) => {
  // Allow toggling buy/sell by clicking the type indicator. The game reuses
  // this element while changing action states, so refresh its metadata on
  // every showItem call and bind the generic handlers only once.
  const actionButton = document.querySelector('.marketplaceView-item-actionType .marketplaceView-listingType');
  const currentAction = actionButton?.classList.contains('buy')
    ? 'buy'
    : (actionButton?.classList.contains('sell') ? 'sell' : null);
  const targetAction = 'buy' === currentAction ? 'sell' : 'buy';
  const targetLabel = 'sell' === targetAction ? 'Selling' : 'Buying';
  const targetAllowed = [...document.querySelectorAll('.marketplaceView-item-viewActions > a.mousehuntActionButton:not(.disabled)')]
    .some((button) => button.textContent.trim().toLowerCase() === targetAction);

  if (actionButton && currentAction && targetAllowed) {
    actionButton.dataset.mhuiTargetAction = targetAction;
    actionButton.dataset.mhuiItemId = itemId;
    actionButton.title = `Click to switch to ${targetLabel}`;
    actionButton.tabIndex = 0;
    actionButton.setAttribute('role', 'button');
    actionButton.setAttribute('aria-label', `Switch to ${targetLabel}`);

    if (! actionButton.dataset.mhuiToggleBound) {
      actionButton.dataset.mhuiToggleBound = 'true';

      const toggleActionType = () => {
        const nextAction = actionButton.dataset.mhuiTargetAction;
        const nextItemId = actionButton.dataset.mhuiItemId;
        if (! nextAction || ! nextItemId) {
          return;
        }

        saveOnboardingStep(BUY_SELL_TOGGLE_STEP);
        const quantityInput = document.querySelector('.marketplaceView-item-quantity');
        const priceInput = document.querySelector('.marketplaceView-item-unitPriceWithTariff');
        const quantity = quantityInput?.value ? parseNumber(quantityInput.value) : 0;
        const unitPrice = priceInput?.value ? parseNumber(priceInput.value) : 0;
        hg.views.MarketplaceView.showItem(nextItemId, nextAction, quantity, unitPrice, true);
      };

      actionButton.addEventListener('click', toggleActionType);
      actionButton.addEventListener('keydown', (event) => {
        if ('Enter' !== event.key && ' ' !== event.key) {
          return;
        }

        event.preventDefault();
        toggleActionType();
      });
    }

    addOnboardingTip({
      step: BUY_SELL_TOGGLE_STEP,
      anchor: actionButton,
      title: 'Quickly switch order type',
      content: `Click ${actionButton.classList.contains('buy') ? 'Buying' : 'Selling'} to switch to ${targetLabel} without going back.`,
    });
  } else if (actionButton) {
    delete actionButton.dataset.mhuiTargetAction;
    delete actionButton.dataset.mhuiItemId;
    actionButton.removeAttribute('title');
    actionButton.removeAttribute('tabindex');
    actionButton.removeAttribute('role');
    actionButton.removeAttribute('aria-label');
  }

  const actions = document.querySelector('.marketplaceView-item-titleActions');
  if (! actions) {
    return;
  }

  const existing = document.querySelector('.mh-improved-marketplace-item-title-actions');
  if (existing) {
    existing.remove();
  }

  let itemName = document.querySelector('.marketplaceView-item-titleName');
  itemName = itemName ? itemName.textContent.trim() : '';

  const buttons = makeElement('div', 'mh-improved-marketplace-item-title-actions', getItemLinks(itemName, itemId));
  actions.insertBefore(buttons, actions.firstChild);

  const decorations = [enhanceItemView(itemId)];

  if (getSetting('better-marketplace.price-history-chart', false)) {
    decorations.push(addPriceChart(itemId));
  }

  if (getSetting('better-marketplace.quick-sell')) {
    decorations.push(addQuickSellButton(itemId));
  }

  await Promise.all(decorations);
};

/**
 * Make each listing's quantity cell set the order quantity when clicked.
 */
const addListingQuantityClicks = async () => {
  const cells = await waitForElement('.marketplaceView-table-listing-quantity', { single: false });
  if (! cells) {
    return;
  }

  cells.forEach((order) => {
    if (order.dataset.mhuiQuantityClick) {
      return;
    }
    order.dataset.mhuiQuantityClick = 'true';

    order.addEventListener('click', () => {
      // Other features may append extra lines to the cell; use the first one.
      const [first] = order.textContent.split('\n');
      const quantity = parseNumber(first);
      if (! quantity) {
        return;
      }

      hg.views.MarketplaceView.setOrderQuantity(quantity);
    });
  });
};

/**
 * Add chart images to the categories.
 */
const addChartToCategories = async () => {
  const items = document.querySelectorAll('.marketplaceView-table tr');
  items.forEach((item) => {
    const itemId = item.getAttribute('data-item-id');
    if (! itemId) {
      return;
    }

    const name = item.querySelector('.marketplaceView-table-name');
    if (! name) {
      return;
    }

    const hasChartImage = item.querySelector('.marketplaceView-table-chartImage');
    if (hasChartImage) {
      return;
    }

    const chartImage = makeElement('img', 'marketplaceView-table-chartImage');
    chartImage.src = `https://api.mouse.rip/markethunt-chart/${itemId}-small.png`;
    name.append(chartImage);
  });
};

/**
 * Decorate the current browse view.
 */
const enhanceBrowseSession = async () => {
  if (getSetting('better-marketplace.show-chart-images')) {
    await addChartToCategories();
  }

  await enhanceBrowseTable();
  await filterListings();
};

const filterListings = async () => {
  const wrapper = ensureFilterWrapper();
  if (! wrapper) {
    return;
  }

  const existing = document.querySelector('.mhui-marketplace-filter');
  if (existing) {
    return;
  }

  const filter = makeElement('input', 'mhui-marketplace-filter');
  filter.setAttribute('type', 'text');
  filter.setAttribute('placeholder', 'Filter listings…');

  filter.addEventListener('input', debounce(() => {
    const filterValue = filter.value.toLowerCase();
    const filterItems = document.querySelectorAll('.marketplaceView-table tr');
    filterItems.forEach((item) => {
      const itemId = item.getAttribute('data-item-id');
      if (! itemId) {
        return;
      }

      const name = item.querySelector('.marketplaceView-table-name');
      if (! name) {
        return;
      }

      let nameText = name.textContent.replace('SUPER|brie+', 'sb SUPER|brie+').toLowerCase();

      // Include the base trap name so skins can be filtered by their trap.
      if (item.dataset.mhuiTrap) {
        nameText += ` ${item.dataset.mhuiTrap}`;
      }

      if (nameText.includes(filterValue)) {
        item.classList.remove('hidden');
        item.classList.add('filter-visible');
      } else {
        item.classList.add('hidden');
        item.classList.remove('filter-visible');
      }
    });
  }, 300));

  wrapper.append(filter);
};

const getBestSellPrice = () => {
  const buyRow = document.querySelector('.marketplaceView-item-quickListings.buy .bestPrice');
  if (! buyRow) {
    return 0;
  }

  const priceEl = buyRow.querySelector('.marketplaceView-table-numeric.marketplaceView-table-listing-unitPrice a');
  if (! priceEl) {
    return 0;
  }

  return parseNumber(priceEl.textContent);
};

const getBestSellQuantity = () => {
  const buyRow = document.querySelector('.marketplaceView-item-quickListings.buy .bestPrice');
  if (! buyRow) {
    return 0;
  }

  const quantityEl = buyRow.querySelector('.marketplaceView-table-numeric.marketplaceView-table-listing-quantity');
  if (! quantityEl) {
    return 0;
  }

  return parseNumber(quantityEl.textContent);
};

const addQuickSellButton = async (itemId) => {
  const actions = document.querySelector('.marketplaceView-item-table .marketplaceView-item-viewActions');
  if (! actions) {
    return;
  }

  const existing = actions.querySelector('.mhui-marketplace-quick-sell');
  if (existing) {
    existing.remove();
  }

  await waitForElement('.marketplaceView-table .bestPrice');

  const currentItem = document.querySelector('.marketplaceView-item[data-item-id]');
  if (currentItem?.dataset.itemId !== String(itemId)) {
    return;
  }

  // The left block has an "Average price:" and a "You own:" block; find the
  // latter by its label rather than a positional selector (which breaks when
  // the markethunt userscript injects extra nodes).
  const ownBlock = [...document.querySelectorAll('.marketplaceView-item-leftBlock .marketplaceView-item-averagePrice')]
    .find((el) => el.textContent.includes('You own'));

  const maxQuantityEl = ownBlock?.querySelector('span');
  if (! maxQuantityEl) {
    return;
  }

  if (maxQuantityEl.textContent === '-') {
    return;
  }

  const bestSellQuantity = getBestSellQuantity();
  const bestSellPrice = getBestSellPrice();

  const quickSell = calculateQuickSell({
    owned: maxQuantityEl ? parseNumber(maxQuantityEl.textContent) : 0,
    available: bestSellQuantity,
    unitPrice: bestSellPrice,
  });
  const maxQuantity = quickSell.quantity;

  const quickSellWrapper = makeElement('div', 'mhui-marketplace-quick-sell-wrapper');

  const quickSellInput = makeElement('input', 'mhui-marketplace-quick-sell-quantity');
  quickSellInput.setAttribute('id', 'mhui-marketplace-quick-sell-quantity');
  quickSellInput.setAttribute('type', 'number');
  quickSellInput.setAttribute('min', '1');
  quickSellInput.setAttribute('max', String(maxQuantity));
  quickSellInput.setAttribute('value', String(maxQuantity));

  quickSellWrapper.append(quickSellInput);

  makeMhButton({
    text: 'Quick Sell',
    className: 'mhui-marketplace-quick-sell',
    appendTo: quickSellWrapper,
    callback: async (event) => {
      const button = event.currentTarget;
      button.classList.add('disabled');

      const quantity = Math.min(Number.parseInt(quickSellInput.value, 10) || 0, bestSellQuantity);
      if (quantity <= 0) {
        return;
      }

      const price = getBestSellPrice();
      if (price <= 0) {
        return;
      }

      hg.utils.Marketplace.createListing(itemId, price, quantity, 'sell',
        (data) => {
          hg.views.MarketplaceView.showMyListings(data.marketplace_new_listing.listing_id);
        },
        (err) => {
          console.log('Error quick selling item', err); // eslint-disable-line no-console
        }
      );

      button.classList.remove('disabled');
    },
  });

  const infoRow = makeElement('div', 'mhui-marketplace-quick-sell-info');
  infoRow.textContent = `${formatNumber(maxQuantity)} at ${formatGold(bestSellPrice)}, ${formatNumber(quickSell.total)} total`;
  quickSellWrapper.append(infoRow);

  quickSellInput.addEventListener('input', () => {
    const quantity = Math.min(Number.parseInt(quickSellInput.value, 10) || 0, bestSellQuantity);

    infoRow.textContent = `${formatNumber(quantity)} at ${formatGold(bestSellPrice)}, ${formatNumber(bestSellPrice * quantity)} total`;
  });

  actions.append(quickSellWrapper);
};

const addRelistButtonToCancelled = async () => {
  const listings = document.querySelectorAll('.marketplaceView-table tr');
  if (! listings || listings.length === 0) {
    return;
  }

  listings.forEach((listing) => {
    const listingId = listing.getAttribute('data-listing-id');
    if (! listingId) {
      return;
    }

    const listingData = marketplaceData?.marketplace_my_listings?.find((listingListingData) => listingListingData.listing_id == listingId); // eslint-disable-line eqeqeq
    if (! listingData) {
      return;
    }

    // Bail if the listing is active.
    if (listingData.is_active) {
      return;
    }

    // add a relist button
    const actions = listing.querySelector('.marketplaceView-table-actions');
    if (! actions) {
      return;
    }

    const existing = listing.querySelector('.mhui-marketplace-relist');
    if (existing) {
      return;
    }

    actions.classList.add('mhui-marketplace-relist-actions');

    makeMhButton({
      text: 'Relist',
      className: 'mhui-marketplace-relist',
      size: 'small',
      callback: () => {
        hg.utils.Marketplace.createListing(
          listingData.item_id,
          listingData.unit_price,
          listingData.remaining_quantity,
          listingData.listing_type,
          () => {
            hg.views.MarketplaceView.showMyListings();
          },
          (err) => {
            console.log('Error creating listing', err); // eslint-disable-line no-console
          }
        );
      },
      appendTo: actions,
    });
  });
};

let marketplaceData;

/**
 * Initialize the module.
 */
const init = () => {
  addStyles([
    styles,
    extras,
    getSetting('better-marketplace.small-images') ? smallImages : '',
    getSetting('better-marketplace.trend-numbers', true) ? trendNumbers : '',
    getSetting('better-marketplace.quick-sell') ? quickSellStyles : '',
    getSetting('better-marketplace.price-history-chart', true) ? priceChartStyles : '',
  ], 'better-marketplace');

  marketplaceRuntime.register('item', enhanceItemSession);
  marketplaceRuntime.register('browse', enhanceBrowseSession);
  marketplaceRuntime.register('listings', addRelistButtonToCancelled);
  marketplaceRuntime.install(hg?.views?.MarketplaceView);

  onOverlayChange({
    marketplace: {
      /**
       * Run when the marketplace is shown.
       */
      show: () => {
        initializeSearchSession();
        marketplaceRuntime.install(hg.views.MarketplaceView);
        marketplaceRuntime.refresh();
      },
      hide: () => {
        clearTimeout(searchTimeout);
        searchTimeout = null;
        searchRoot = null;
        marketplaceRuntime.reset();
      },
    },
  });

  onRequest('users/marketplace.php', (resp, data) => {
    if ('marketplace_info' === data.action) {
      marketplaceData = resp;
    }
  });
  onRequest('users/marketplace.php', autocloseClaim);
  onRequest('users/marketplace.php', () => addListingQuantityClicks(), true);
  onRequest('users/marketplace.php', () => marketplaceRuntime.refresh(), true);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-marketplace',
  name: 'Better Marketplace',
  type: 'inventory-economy',
  default: true,
  description: 'Update the styles, and add small features like toggling between "Buying" and "Selling" by clicking the text.',
  load: init,
  settings,
};
