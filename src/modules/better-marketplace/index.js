import {
  addUIStyles,
  getMhuiSetting,
  makeElement,
  onOverlayChange,
  onRequest
} from '@/utils';

import styles from './styles.css';

import itemsToRemove from '@data/marketplace-items-to-remove.json';

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
  searchInputDOM.select2({
    formatResult: hg.views.MarketplaceView.formatSelect2Result,
    formatSelection: hg.views.MarketplaceView.formatSelect2Result,
    dropdownAutoWidth: false,
    placeholder: 'Search for items...',
    minimumInputLength: 0,
    dropdownCssClass: 'marketplaceView-header-search-dropdown',
    width: 'resolve',
  }).on('change', function () {
    if (! searchInputDOM.prop('disabled') && searchInputDOM.val()) {
      hg.views.MarketplaceView.showItem(searchInputDOM.val(), 'view', false, false, true);
    }
  });
};

const modifySearch = (opts) => {
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

  label.appendChild(toggleSearch);
  label.appendChild(document.createTextNode('Search all items'));

  const defaultToAll = getMhuiSetting('better-marketplace-search-all');
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

  searchContainer.appendChild(label);
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
  };
};

let originalSelect = null;
let newSelect = null;

export default () => {
  addUIStyles(styles);
  onOverlayChange({ marketplace: { show: () => {
    waitForSearchReady();

    overloadShowItem();
  } } });

  onRequest(autocloseClaim, 'managers/ajax/users/marketplace.php');
};
