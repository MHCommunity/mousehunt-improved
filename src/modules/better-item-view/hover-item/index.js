import {
  addStyles,
  doRequest,
  getSetting,
  makeElement,
  onEvent,
  onRequest,
  onTurn
} from '@utils';

import styles from './styles.css';

/**
 * Fetch the item data.
 *
 * @param {string} itemId The item ID.
 *
 * @return {Promise} The item data.
 */
const fetchItemData = async (itemId) => {
  const itemDataRequest = await doRequest('managers/ajax/users/userInventory.php', {
    action: 'get_items',
    'item_types[]': itemId,
  });

  return itemDataRequest?.items?.[0];
};

/**
 * Generate the markup for an item.
 *
 * @param {Object} item The item data.
 *
 * @return {HTMLElement} The item markup.
 */
const makeItemMarkup = (item) => {
  const itemData = makeElement('div', 'item-data');

  if (item.thumbnail) {
    const itemImage = makeElement('img', 'item-image');
    itemImage.src = item.thumbnail;
    itemData.append(itemImage);
  }

  const itemText = makeElement('div', 'item-text');

  makeElement('div', 'item-name', item.name || '', itemText);

  const quantity = makeElement('div', 'item-quanity');
  makeElement('span', '', 'You own: ', quantity);
  makeElement('span', '', Number.parseInt(item.quantity || 0).toLocaleString(), quantity);
  itemText.append(quantity);

  const description = makeElement('div', 'item-description');
  const firstSentence = item.description.match(/[^!.?]+[!.?]/);
  makeElement('div', 'item-description-text', firstSentence ? firstSentence[0] : item.description, description);
  itemData.append(itemText);

  return itemData;
};

/**
 * Generate the markup for the loading state.
 *
 * @param {Event} e The event.
 *
 * @return {HTMLElement} The loading markup.
 */
const makeLoadingMarkup = (e) => {
  if (itemDataWrapper) {
    itemDataWrapper.remove();
  }

  itemDataWrapper = makeElement('div', 'item-data-wrapper');
  itemDataWrapper.id = 'item-data-wrapper';
  itemDataWrapper.innerHTML = '<span class="item-data-wrapper-loading">Loading...</span>';

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

  return itemDataWrapper;
};

/**
 * Get the item data.
 *
 * @param {string} itemType The item type.
 *
 * @return {Promise} The item data.
 */
const getItemData = async (itemType) => {
  let item;
  if (cachedItemData[itemType]) {
    item = cachedItemData[itemType];
  } else {
    item = await fetchItemData(itemType);
    cachedItemData[itemType] = item;

    setTimeout(() => {
      // remove the cached item data after 1min
      delete cachedItemData[itemType];
    }, 60 * 1000);
  }

  if (! item) {
    return;
  }

  return item;
};

let itemDataWrapper;
let cachedItemData = {};

/**
 * Do the hover mice stuff.
 */
const main = () => {
  const itemLinks = document.querySelectorAll('.journal .content .entry .journaltext a[href*="https://www.mousehuntgame.com/item.php?item_type="]');
  if (! itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.getAttribute('href').match(/item_type=(\w+)/)[1];
    link.setAttribute('onclick', `hg.views.ItemView.show('${itemType}'); return false;`);

    let timeoutId = null;
    let isMouseOver = false;

    link.addEventListener('mouseenter', async (e) => {
      isMouseOver = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        if (! isMouseOver) {
          return;
        }

        makeLoadingMarkup(e);
        const itemData = await getItemData(itemType);
        if (itemData && itemDataWrapper && isMouseOver) {
          itemDataWrapper.innerHTML = '';
          itemDataWrapper.append(makeItemMarkup(itemData));
        }
      }, 500);
    });

    link.addEventListener('mouseleave', () => {
      isMouseOver = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (itemDataWrapper) {
        itemDataWrapper.remove();
      }
    });
  });
};

/**
 * Attach the hover mice functionality.
 */
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

  onTurn(() => cachedItemData = {});
};

export default hoverMice;
