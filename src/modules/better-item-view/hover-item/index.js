import {
  addStyles,
  doRequest,
  makeElement,
  onRequest,
  onTurn,
  sessionGet,
  sessionSet,
  sessionsDelete
} from '@utils';

import styles from './styles.css';

const fetchAndFillItemData = async (itemId) => {
  if (isLoading) {
    return;
  }

  isLoading = true;

  let item;

  const cacheditemData = sessionGet(`better-item-view-hover-mice-${itemId}`, false);
  if (cacheditemData) {
    item = cacheditemData;
  } else {
    const itemDataRequest = await doRequest('managers/ajax/users/userInventory.php', {
      action: 'get_items',
      'item_types[]': itemId,
    });

    if (! itemDataRequest?.items?.length) {
      return;
    }

    item = itemDataRequest?.items[0];

    sessionSet(`better-item-view-hover-mice-${itemId}`, item);
  }

  const itemData = makeElement('div', 'item-data');

  const itemImage = makeElement('img', 'item-image');
  itemImage.src = item.thumbnail;
  itemData.append(itemImage);

  const itemText = makeElement('div', 'item-text');
  makeElement('div', 'item-name', item.name, itemText);

  const quantity = makeElement('div', 'item-quanity');
  makeElement('span', '', 'Quantity: ', quantity);
  makeElement('span', '', item.quantity.toLocaleString(), quantity);

  itemText.append(quantity);

  const description = makeElement('div', 'item-description');
  // grab the first sentence of the description
  const firstSentence = item.description.match(/[^!.?]+[!.?]/);
  makeElement('div', 'item-description-text', firstSentence ? firstSentence[0] : item.description, description);

  itemData.append(itemText);

  itemDataWrapper.innerHTML = itemData.outerHTML;

  isLoading = false;
};

let itemDataWrapper;
let isLoading = false;
const makeMouseMarkup = async (itemId, e) => {
  itemDataWrapper?.remove();

  const existing = document.querySelectorAll('#item-data-wrapper');
  if (existing && existing.length) {
    existing.forEach((el) => {
      // el.remove();
    });
  }

  itemDataWrapper = makeElement('div', 'item-data-wrapper');
  itemDataWrapper.id = 'item-data-wrapper';
  itemDataWrapper.innerHTML = '<span class="item-data-wrapper-loading">Loading...</span>';

  fetchAndFillItemData(itemId);

  document.body.append(itemDataWrapper);
  const rect = e.target.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  let tooltipTop = top - itemDataWrapper.offsetHeight - 10;
  if (tooltipTop < 0) {
    tooltipTop = top + rect.height + 10;
  }

  itemDataWrapper.style.top = `${tooltipTop}px`;
  itemDataWrapper.style.left = `${left - (itemDataWrapper.offsetWidth / 2) + (rect.width / 2)}px`;
  let timeoutId;

  itemDataWrapper.addEventListener('mouseleave', () => {
    timeoutId = setTimeout(() => {
      // itemDataWrapper.remove();
    }, 250);
  });

  itemDataWrapper.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });

  const parent = e.target.parentElement;
  if (parent) {
    parent.addEventListener('mouseleave', () => {
      timeoutId = setTimeout(() => {
        // itemDataWrapper.remove();
      }, 500);
    });

    parent.addEventListener('mouseenter', () => {
      clearTimeout(timeoutId);
    });
  }
};

const main = () => {
  const itemLinks = document.querySelectorAll('.journal .content .entry .journaltext a[onclick*="ItemView.show"]');
  if (! itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.ItemView.show('${itemType}'); return false;`);

    let timer;
    link.addEventListener('mouseover', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        makeMouseMarkup(itemType, e);
      }, 200);
    });

    link.addEventListener('mouseout', () => {
      clearTimeout(timer);
    });
  });
};

const hoverMice = () => {
  addStyles(styles, 'better-item-view-hover-mice');

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });

  onTurn(() => {
    sessionsDelete('better-item-view-hover-mice-');
  }, 1000);
};

export default hoverMice;
