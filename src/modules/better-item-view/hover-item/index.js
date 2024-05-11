import {
  addStyles,
  debounce,
  doRequest,
  getSetting,
  makeElement,
  onEvent,
  sleep,
  onRequest
} from '@utils';

import styles from './styles.css';

const fetchAndFillItemData = async (itemId) => {
  if (isLoading) {
    return;
  }

  isLoading = true;

  // Artificial delay to prevent spamming the server when the user is quickly moving the mouse.
  await sleep(500);

  const itemDataRequest = await doRequest('managers/ajax/users/userInventory.php', {
    action: 'get_items',
    'item_types[]': itemId,
  });

  if (! itemDataRequest?.items?.length) {
    return;
  }

  const item = itemDataRequest?.items[0];

  const itemData = makeElement('div', 'item-data');

  const itemImage = makeElement('img', 'item-image');
  itemImage.src = item.thumbnail;
  itemData.append(itemImage);

  const itemText = makeElement('div', 'item-text');
  makeElement('div', 'item-name', item.name, itemText);

  const quantity = makeElement('div', 'item-quanity');
  makeElement('span', '', 'You own: ', quantity);
  makeElement('span', '', Number.parseInt(item.quantity).toLocaleString(), quantity);

  itemText.append(quantity);

  const description = makeElement('div', 'item-description');
  // grab the first sentence of the description
  const firstSentence = item.description.match(/[^!.?]+[!.?]/);
  makeElement('div', 'item-description-text', firstSentence ? firstSentence[0] : item.description, description);

  itemData.append(itemText);

  itemDataWrapper.innerHTML = itemData.outerHTML;

  isLoading = false;
};

let debugPopup = false;
let itemDataWrapper;
let isLoading = false;
const makeMouseMarkup = async (itemId, e) => {
  if (itemDataWrapper) {
    itemDataWrapper.remove();
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

  if (e.target && ! debugPopup) {
    e.target.addEventListener('mouseleave', () => {
      if (itemDataWrapper) {
        itemDataWrapper.remove();
      }
    });
  }
};

const main = () => {
  const itemLinks = document.querySelectorAll('.journal .content .entry .journaltext a[href*="https://www.mousehuntgame.com/item.php?item_type="]');
  if (! itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.getAttribute('href').match(/item_type=(\w+)/)[1];
    link.setAttribute('onclick', `hg.views.ItemView.show('${itemType}'); return false;`);

    link.addEventListener('mouseover', debounce((e) => {
      makeMouseMarkup(itemType, e);
    }));

    link.addEventListener('mouseout', debounce(() => {
      if (itemDataWrapper) {
        itemDataWrapper.remove();
      }
    }));
  });
};

const hoverMice = () => {
  addStyles(styles, 'better-item-view-hover-mice');

  debugPopup = getSetting('debug.hover-popups', false);

  setTimeout(main, 500);
  onRequest('*', () => {
    setTimeout(main, 1000);
  });

  onEvent('dialog-show-item', () => {
    const hoverItem = document.querySelector('#item-data-wrapper');
    if (hoverItem) {
      hoverItem.remove();
    }
  });
};

export default hoverMice;
