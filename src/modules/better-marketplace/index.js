import {
  addStyles,
  getData,
  getSetting,
  makeElement,
  makeLink,
  onOverlayChange,
  onRequest
} from '@utils';

import settings from './settings';

import smallImageStyles from './styles/small-images.css';
import styles from './styles/styles.css';

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

const modifySearch = async (opts) => {
  const searchContainer = document.querySelector('.marketplaceView-header-searchContainer');
  if (! searchContainer) {
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
    if (! opt.value || opt.value === '' || itemsToRemove.some((item) => item.id === opt.value || item.name === opt.text)) {
      opt.remove();
    }
  });

  initSearch(searchInputDOM);

  newSelect = document.querySelector('select.marketplaceView-header-search');

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

const waitForSearchReady = (attempts = 0) => {
  const opts = document.querySelectorAll('.marketplaceView-header-search option');
  let timeoutPending = false;

  // if there are no options, try again
  if (opts.length === 0) {
    if (attempts < 10) {
      timeoutPending = setTimeout(() => waitForSearchReady(attempts + 1), 300);
    }
    return;
  }

  // if we have a timeout pending, clear it
  if (timeoutPending) {
    clearTimeout(timeoutPending);
  }

  // wait another 300ms to make sure it's ready
  setTimeout(() => {
    modifySearch(opts);
  }, 300);
};

const autocloseClaim = (resp) => {
  if (! (resp && resp.success)) {
    return;
  }

  const journalEntry = resp?.journal_markup[0]?.render_data?.css_class;
  if (! journalEntry || journalEntry === '') {
    return;
  }

  if (journalEntry.includes('marketplace_claim_listing') || journalEntry.includes('marketplace_complete_listing')) {
    setTimeout(() => hg.views.MarketplaceView.hideDialog(), 250);
  }
};

/**
 * Get the markup for the mouse links.
 *
 * @param {string} name The name of the mouse.
 * @param {string} id   The ID of the mouse.
 *
 * @return {string} The markup for the mouse links.
 */
const getLinkMarkup = (name, id) => {
  return makeLink('MHCT', `https://www.mhct.win/loot.php?item=${id}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}`);
};

const overloadShowItem = () => {
  const originalShowItem = hg.views.MarketplaceView.showItem;

  hg.views.MarketplaceView.showItem = (itemId, action, defaultQuantity, defaultUnitPriceWithTariff, force) => {
    // allow toggling of buy/sell
    const actionButton = document.querySelector('.marketplaceView-item-actionType .marketplaceView-listingType');
    if (actionButton) {
      actionButton.addEventListener('click', () => {
        const actionType = actionButton.classList.contains('buy') ? 'sell' : 'buy';
        originalShowItem(itemId, actionType, defaultQuantity, defaultUnitPriceWithTariff, force);
      });
    }

    originalShowItem(itemId, action, defaultQuantity, defaultUnitPriceWithTariff, force);

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

    const buttons = makeElement('div', 'mh-improved-marketplace-item-title-actions', getLinkMarkup(itemName, itemId));
    actions.insertBefore(buttons, actions.firstChild);
  };
};

const waitForFooterReady = (attempts = 0) => {
  const opts = document.querySelectorAll('.marketplaceView-table-listing-quantity');
  let timeoutPending = false;

  // if there are no options, try again
  if (! (opts && opts.length > 0)) {
    if (attempts < 10) {
      timeoutPending = setTimeout(() => updateQuantityButtons(attempts + 1), 300);
    }
    return;
  }

  // if we have a timeout pending, clear it
  if (timeoutPending) {
    clearTimeout(timeoutPending);
  }

  // wait another 300ms to make sure it's ready
  setTimeout(() => {
    opts.forEach((order) => {
      order.addEventListener('click', () => {
        const quantity = order.textContent.trim();
        hg.views.MarketplaceView.setOrderQuantity(quantity);
      });
    });
  }, 300);
};

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
    chartImage.src = `https://markethunt-chart.mouse.rip/${itemId}.png?small`;
    name.append(chartImage);
  });
};

let _showBrowseCategory = null;
let _showBrowser = null;
const replaceShowBrowseCategory = () => {
  if (_showBrowseCategory) {
    return;
  }

  _showBrowseCategory = hg.views.MarketplaceView.showBrowseCategory;
  hg.views.MarketplaceView.showBrowseCategory = (category) => {
    _showBrowseCategory(category);
    addChartToCategories();
  };

  _showBrowser = hg.views.MarketplaceView.showBrowser;
  hg.views.MarketplaceView.showBrowser = (category) => {
    _showBrowser(category);
    addChartToCategories();
  };
};

let originalSelect = null;
let newSelect = null;

/**
 * Initialize the module.
 */
const init = async () => {
  const stylesToUse = [styles];

  if (getSetting('better-marketplace.small-images')) {
    stylesToUse.push(smallImageStyles);
  }

  addStyles(stylesToUse, 'better-marketplace');

  onOverlayChange({
    marketplace: {
      show: () => {
        waitForSearchReady();
        overloadShowItem();

        if (getSetting('better-marketplace.show-chart-images')) {
          replaceShowBrowseCategory();
        }
      },
    },
  });

  onRequest('users/marketplace.php', autocloseClaim);
  onRequest('users/marketplace.php', waitForFooterReady, true);
};

export default {
  id: 'better-marketplace',
  name: 'Better Marketplace',
  type: 'better',
  default: true,
  description: 'Updates the marketplace layout and appearance and adds a variety of small features, like being able to click the "Buying" or "Selling" text to toggle between the two.',
  load: init,
  settings,
};
