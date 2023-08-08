import { addUIStyles } from '../utils';
import styles from './styles.css';

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
  const label = makeElement('label', ['mhui-supply-search-label', 'screen-reader-only']);
  label.setAttribute('for', 'mhui-supply-search-input');
  makeElement('span', '', 'Search for an item', label);

  form.appendChild(label);

  const input = makeElement('input', 'mhui-supply-search-input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'mhui-supply-search-input');
  input.setAttribute('placeholder', 'Search for an item');
  input.setAttribute('autocomplete', 'off');

  input.addEventListener('keyup', processSearch);

  form.appendChild(input);

  // Convert the title into a wrapper that has the title and our form
  const titleWrapper = makeElement('div', 'mhui-supply-search');
  const title = container.querySelector('h2');
  title.textContent = 'Send Supplies';
  titleWrapper.appendChild(title);

  titleWrapper.appendChild(form);

  container.insertBefore(titleWrapper, container.firstChild);

  setTimeout(() => {
    input.focus();
  }, 100);
};

const asNum = (number) => {
  // remove any commas, parse as int
  return parseInt(number.replace(',', ''));
};

const resortItems = (sortType = 'alpha') => {
  // sort items by the text in the details element
  const container = document.querySelector('#supplytransfer .tabContent.item .listContainer');
  const items = container.querySelectorAll('.item');

  let sortSelector = '.quantity';
  if ('alpha' === sortType || 'alpha-reverse' === sortType) {
    sortSelector = '.details';
  }

  const sorted = Array.from(items).sort((a, b) => {
    const aText = a.querySelector(sortSelector).textContent;
    const bText = b.querySelector(sortSelector).textContent;

    if (sortType === 'alpha') {
      return aText.localeCompare(bText);
    } else if (sortType === 'alpha-reverse') {
      return bText.localeCompare(aText);
    } else if (sortType === 'qty') {
      return asNum(bText) - asNum(aText);
    } else if (sortType === 'qty-reverse') {
      return asNum(aText) - asNum(bText);
    }

    return 0;
  });

  sorted.forEach((item) => {
    container.appendChild(item);
  });

  currentSort = sortType;
};

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

  const sortAlpha = makeElement('a', 'mhui-supply-sort-alphabetic');
  makeElement('div', 'mhui-supply-sort-alpha-text', 'Name', sortAlpha);

  sortAlpha.addEventListener('click', () => {
    const newSort = currentSort === 'alpha' ? 'alpha-reverse' : 'alpha';
    resortItems(newSort);
  });

  sortWrapper.appendChild(sortAlpha);

  const sortQty = makeElement('a', 'mhui-supply-sort-quantity');
  makeElement('div', 'mhui-supply-sort-qty-text', 'Qty', sortQty);

  sortQty.addEventListener('click', () => {
    const newSort = currentSort === 'qty' ? 'qty-reverse' : 'qty';
    resortItems(newSort);
  });

  sortWrapper.appendChild(sortQty);

  // append as the 2nd child so it's after the title
  container.insertBefore(sortWrapper, container.childNodes[1]);
};

let items = [];
let currentSort = null;

const main = () => {
  items = document.querySelectorAll('#supplytransfer .tabContent.item .listContainer .item');
  addSearch();

  resortItems('alpha'); // default to alpha sort
  addSortButtons();
};

export default function betterSendSupplies() {
  addUIStyles(styles);

  onNavigation(main, { page: 'supplytransfer' });
}
