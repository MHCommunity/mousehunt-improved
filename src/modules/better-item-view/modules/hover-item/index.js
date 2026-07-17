import { addStyles, createHoverCard, doRequest, makeElement, onEvent, onJournalEntry } from '@utils';
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
  if (!itemData) {
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
  if (!item) {
    return false;
  }

  const itemData = makeElement('div', 'item-data');

  const itemImage = makeElement('img', 'item-image');
  itemImage.src = item?.large || item?.thumbnail || '';
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

const hoverCard = createHoverCard({
  wrapperId: 'item-data-wrapper',
  hrefParam: 'item_type',
  fetchData: fetchItemData,
  render: makeItemMarkup,
});

/**
 * The main function.
 *
 * @param {HTMLElement|null} element The parent element to search for item links.
 */
const main = (element = null) => {
  const parentElement = element || document;
  const itemLinks = parentElement.querySelectorAll('.journal .content .entry .journaltext a[onclick*="ItemView.show"]');
  if (!itemLinks) {
    return;
  }

  itemLinks.forEach((link) => {
    const itemType = link.getAttribute('onclick').match(/'([^']+)'/)[1];
    link.setAttribute('onclick', `hg.views.ItemView.show('${itemType}'); return false;`);

    hoverCard.attach(link);
  });
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-item-view-hover-item');

  onEvent('journal-item-link-modified', main);
  onJournalEntry((model) => main(model.el), {
    id: 'better-item-view-hover-item',
    stage: 'links',
  });
};
