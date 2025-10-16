import {
  addStyles,
  doRequest,
  makeElement,
  onEvent,
  onJournalEntry
} from '@utils';
import styles from './styles.css';

let lastFetchedItem = null;
let lastFetchedTime = 0;
let lastFetchedData = null;

/**
 * Fetch the item data.
 *
 * @param {string} itemId The item ID.
 *
 * @return {Promise<Object>} The item data.
 */
const fetchItemData = async (itemId) => {
  // cache the data if its been less than 30 seconds
  const now = Date.now();
  if (lastFetchedItem === itemId && now - lastFetchedTime < 30000 && lastFetchedData) {
    return lastFetchedData;
  }

  const itemDataRequest = await doRequest('managers/ajax/users/userInventory.php', {
    action: 'get_items',
    'item_types[]': itemId,
  });

  const itemData = itemDataRequest?.items?.[0];
  if (! itemData) {
    return null;
  }

  lastFetchedItem = itemId;
  lastFetchedTime = now;
  lastFetchedData = itemData;

  return itemData;
};

/**
 * Create the markup for the item data.
 *
 * @param {Object} item The item data.
 *
 * @return {HTMLElement|boolean} The item data markup or false.
 */
const makeItemMarkup = (item) => {
  if (! item) {
    return false;
  }

  const itemData = makeElement('div', 'item-data');

  const itemImage = makeElement('img', 'item-image');
  itemImage.src = item.thumbnail;
  itemImage.alt = item.name;
  itemImage.width = '82';
  itemImage.height = '82';
  itemData.append(itemImage);

  const itemText = makeElement('div', 'item-text');
  makeElement('div', 'item-name', item.name, itemText);

  const quantity = makeElement('div', 'item-quanity');
  makeElement('span', '', 'You own: ', quantity);
  makeElement('span', '', item.quantity.toLocaleString(), quantity);

  itemText.append(quantity);

  const description = makeElement('div', 'item-description');
  // grab the first sentence of the description
  const firstSentence = item.description.match(/[^!.?]+[!.?]/);
  makeElement('div', 'item-description-text', firstSentence ? firstSentence[0] : item.description, description);

  itemData.append(itemText);

  return itemData;
};

/**
 * Create the loading markup.
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

let itemDataWrapper;

const listeners = {};

const addHoverListener = (link) => {
  let timeoutId = null;
  let isMouseOver = false;

  if (listeners[link]) {
    link.removeEventListener('mouseenter', listeners[link].mouseenter);
    link.removeEventListener('mouseleave', listeners[link].mouseleave);
  }

  const enter = link.addEventListener('mouseenter', async (e) => {
    isMouseOver = true;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      if (! isMouseOver) {
        return;
      }

      makeLoadingMarkup(e);
      let match;
      if (link.getAttribute('onclick')) {
        match = link.getAttribute('onclick').match(/'([^']+)'/);
      } else if (link.getAttribute('href')) {
        match = link.getAttribute('href').match(/item_type=([^&]+)/);
      }

      if (! match || match.length < 2) {
        return;
      }

      const itemType = match[1];

      const itemData = await fetchItemData(itemType);
      if (itemData && itemDataWrapper && isMouseOver) {
        const markup = makeItemMarkup(itemData);
        itemDataWrapper.innerHTML = markup.outerHTML;
      }
    }, 500);
  });

  const leave = link.addEventListener('mouseleave', () => {
    isMouseOver = false;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (itemDataWrapper) {
      itemDataWrapper.remove();
    }
  });

  listeners[link] = { mouseenter: enter, mouseleave: leave };
};

/**
 * The main function.
 *
 * @param {HTMLElement|null} element The parent element to search for item links.
 */
const main = (element = null) => {
  const parentElement = element || document;
  const itemLinks = parentElement.querySelectorAll('.journal .content .entry .journaltext a[onclick*="ItemView.show"]');
  if (! itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.ItemView.show('${itemType}'); return false;`);

    addHoverListener(link);
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-item-view-hover-item');

  onEvent('journal-item-link-modified', main);
  onJournalEntry(main, {
    id: 'better-item-view-hover-item',
    weight: 8000,
  });
};
