import {
  addStyles,
  getSetting,
  makeElement,
  makeMathButtons,
  onNavigation
} from '@utils';

import settings from './settings';
import styles from './styles.css';

/**
 * Process the search input.
 */
const processSearch = () => {
  const currentValue = document.querySelector('#mhui-supply-search-input');
  if (! currentValue.value) {
    // remove the hidden class from all items
    items.forEach((item) => {
      item.classList.remove('hidden');
    });
  }

  // filter the inner text of the items and hide the ones that don't match
  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(currentValue.value.toLowerCase())) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
};

/**
 * Add the search input to the page.
 */
const addSearch = () => {
  const existing = document.querySelector('.mhui-supply-search-wrapper');
  if (existing) {
    return;
  }

  const container = document.querySelector('#supplytransfer .tabContent.item');
  if (! container) {
    return;
  }

  const form = makeElement('form', 'mhui-supply-search-form');
  const label = makeElement('label', ['mhui-supply-search-label']);
  label.setAttribute('for', 'mhui-supply-search-input');
  makeElement('span', '', 'Search: ', label);

  const input = makeElement('input', 'mhui-supply-search-input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'mhui-supply-search-input');
  input.setAttribute('autocomplete', 'off');

  input.addEventListener('keyup', processSearch);

  label.append(input);
  form.append(label);

  // Convert the title into a wrapper that has the title and our form
  const titleWrapper = makeElement('div', 'mhui-supply-search');
  const title = container.querySelector('h2');
  title.textContent = 'Send Supplies';
  titleWrapper.append(title);

  titleWrapper.append(form);

  container.insertBefore(titleWrapper, container.firstChild);

  setTimeout(() => {
    input.focus();
  }, 100);
};

/**
 * Convert a string to a number.
 *
 * @param {string} number The number to convert.
 *
 * @return {number} The number.
 */
const asNum = (number) => {
  // remove any commas, parse as int
  return Number.parseInt(number.replace(',', ''));
};

/**
 * Resort the items based on the sort type.
 *
 * @param {string} sortType The type of sort to apply.
 */
const resortItems = (sortType = 'alpha') => {
  // sort items by the text in the details element
  const container = document.querySelector('#supplytransfer .tabContent.item .listContainer');
  const items = container.querySelectorAll('.item');

  let sortSelector = '.quantity';
  if ('alpha' === sortType || 'alpha-reverse' === sortType) {
    sortSelector = '.details';
  }

  const sorted = [...items].sort((a, b) => {
    const aText = a.querySelector(sortSelector).textContent;
    const bText = b.querySelector(sortSelector).textContent;

    switch (sortType) {
    case 'alpha':
      return aText.localeCompare(bText);

    case 'alpha-reverse':
      return bText.localeCompare(aText);

    case 'qty':
      return asNum(bText) - asNum(aText);

    case 'qty-reverse':
      return asNum(aText) - asNum(bText);

    // No default
    }

    return 0;
  });

  for (const item of sorted) {
    // if it has a class of pinned, make sure it's the first item
    if (item.classList.contains('pinned')) {
      continue;
    }

    container.append(item);
  }

  currentSort = sortType;
};

/**
 * Add the sort buttons to the page.
 */
const addSortButtons = () => {
  const existing = document.querySelector('.mhui-supply-sort-wrapper');
  if (existing) {
    return;
  }

  const container = document.querySelector('.mhui-supply-search');
  if (! container) {
    return;
  }

  const sortWrapper = makeElement('div', 'mhui-supply-sort-wrapper');
  makeElement('span', 'mhui-supply-sort-label', 'Sort by:', sortWrapper);

  const alphaSortButton = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-supply-sort-alphabetic']);
  makeElement('span', 'mousehuntActionButton-text', 'Name', alphaSortButton);

  alphaSortButton.addEventListener('click', () => {
    resortItems(currentSort === 'alpha' ? 'alpha-reverse' : 'alpha');
  });

  sortWrapper.append(alphaSortButton);

  const sortQtyButton = makeElement('div', ['mousehuntActionButton', 'tiny', 'mhui-supply-sort-quantity']);
  makeElement('span', 'mousehuntActionButton-text', 'Quantity', sortQtyButton);
  sortQtyButton.addEventListener('click', () => {
    resortItems(currentSort === 'qty' ? 'qty-reverse' : 'qty');
  });

  sortWrapper.append(sortQtyButton);

  // append as the 2nd child so it's after the title
  container.insertBefore(sortWrapper, container.childNodes[1]);
};

/**
 * Highlight the favorited items.
 */
const highlightFavoritedItems = () => {
  const itemsToPin = new Set([
    getSetting('better-send-supplies.pinned-items-0', 'SUPER|brie+'),
    getSetting('better-send-supplies.pinned-items-1', 'Empowered SUPER|b...'),
    getSetting('better-send-supplies.pinned-items-2', 'Rift Cherries'),
    getSetting('better-send-supplies.pinned-items-3', 'Rift-torn Roots'),
    getSetting('better-send-supplies.pinned-items-4', 'Sap-filled Thorns'),
  ]);

  for (const item of items) {
    // if the details text content is in the array, then pin it
    const details = item.querySelector('.details');
    if (itemsToPin.has(details.textContent)) {
      item.classList.add('pinned');
    }
  }
};

/**
 * Add the quick quantity buttons to the page.
 */
const addQuickQuantityButtons = () => {
  const input = document.querySelector('#supplytransfer-confirm-text input');
  if (! input) {
    return;
  }

  const maxquantity = document.querySelector('#supplytransfer-confirm-text .userQuantity');
  if (! maxquantity) {
    return;
  }

  const existing = document.querySelector('.mhui-supply-quick-quantity-wrapper');
  if (existing) {
    existing.remove();
  }

  // parse out the max quantity by getting the text between 'you can send up to: ' and the first space after the number
  const maxQty = Number.parseInt(maxquantity.textContent.split('You can send up to: ')[1].split(' ')[0].replace(',', ''));

  const wrapper = makeElement('div', 'mhui-supply-quick-quantity-wrapper');

  makeMathButtons([1, 5, 10, 100], {
    appendTo: wrapper,
    input,
    maxQty,
    classNames: ['mhui-supply-quick-quantity', 'gray', 'small'],
  });

  const max = makeElement('button', ['mousehuntActionButton', 'lightBlue', 'small', 'mhui-supply-quick-quantity', 'mhui-supply-quick-quantity-max']);
  const maxText = makeElement('span', '', 'Max');

  max.addEventListener('click', () => {
    if (maxText.textContent === 'Reset') {
      input.value = 0;
      maxText.textContent = 'Max';
    } else {
      input.value = maxQty;
      maxText.textContent = 'Reset';
    }
  });

  max.append(maxText);

  wrapper.append(max);

  // append the wrapper after the input
  input.parentNode.insertBefore(wrapper, input.nextSibling);
};

let items = [];
let currentSort = null;

/**
 * Upgrade the Send Supplies page.
 *
 * @param {boolean} initial If this is the initial upgrade.
 */
const upgradeSendSupplies = (initial = false) => {
  const sendTo = document.querySelector('#supplytransfer .drawer .tabContent.recipient');
  const isChoosingUser = sendTo && sendTo.style.display !== 'none';

  const sending = document.querySelector('#supplytransfer .drawer .tabContent.item');
  const isChoosingItem = sending && sending.style.display !== 'none';

  if (isChoosingUser) {
    const users = document.querySelectorAll('#supplytransfer .friendList .element.recipient');
    for (const user of users) {
      // add an event listener to the click so we can apply the item changes
      user.addEventListener('click', () => {
        upgradeSendSupplies();
      }, { once: true });

      const search = document.querySelector('.searchContainer input');
      if (search) {
        search.focus();
      }
    }
  } else if (isChoosingItem) {
    items = document.querySelectorAll('#supplytransfer .tabContent.item .listContainer .item');
    highlightFavoritedItems();

    if (initial || ! hasSorted) {
      hasSorted = true;
      resortItems('alpha'); // default to alpha sort
    }
    addSortButtons();

    const itemSearch = document.querySelector('.mhui-supply-search-input');
    if (itemSearch) {
      itemSearch.focus();
    }
  } else {
    addQuickQuantityButtons();

    const inputVal = document.querySelector('#supplytransfer-confirm-text input');
    if (inputVal) {
      inputVal.focus();
    }
  }

  const categories = document.querySelectorAll('#supplytransfer .categoryMenu a');
  for (const category of categories) {
    category.addEventListener('click', () => {
      // re-sort the pinned items
      highlightFavoritedItems();
    }, { once: true });
  }

  sendTo.addEventListener('click', () => {
    upgradeSendSupplies();
  }, { once: true });

  sending.addEventListener('click', () => {
    upgradeSendSupplies();
  }, { once: true });
};

let hasSorted = false;

/**
 * The main function.
 */
const main = () => {
  addSearch();
  upgradeSendSupplies(true);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-send-supplies');
  onNavigation(main, {
    page: 'supplytransfer',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-send-supplies',
  name: 'Better Send Supplies',
  type: 'better',
  default: true,
  description: 'Adds pinned items, search, and sorting to the Send Supplies page.',
  load: init,
  settings,
};
