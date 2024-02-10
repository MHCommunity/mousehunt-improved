import {
  addStyles,
  doRequest,
  getCurrentPage,
  getCurrentTab,
  getSetting,
  makeElement,
  onNavigation,
  sessionGet,
  sessionSet
} from '@utils';

import categories from '@data/ultimate-checkmark.json';

import settings from './settings';
import styles from './styles.css';

/**
 * Get the items for a category.
 *
 * @param {Array}  required The required items.
 * @param {string} queryTab The query tab.
 * @param {string} queryTag The query tag.
 * @param {Array}  allItems All the items.
 *
 * @return {Array} The items.
 */
const getItems = async (required, queryTab, queryTag, allItems = []) => {
  if (! allItems.length) {
    // cache the data for a minute

    const cachedData = sessionGet('ultimate-checkmark') || '{}';

    let inventoryData = cachedData[queryTab]?.data || null;
    const lastCachedTime = cachedData[queryTab]?.time || 0;

    // Cache the data for 5 minutes.
    if (! inventoryData || Date.now() - lastCachedTime > 5 * 60 * 1000) {
      inventoryData = await doRequest('managers/ajax/pages/page.php', {
        page_class: 'Inventory',
        'page_arguments[legacyMode]': '',
        'page_arguments[tab]': queryTab,
        'page_arguments[sub_tab]': 'false',
      });

      cachedData[queryTab] = {
        data: inventoryData,
        time: Date.now(),
      };

      sessionSet('ultimate-checkmark', cachedData);
    }

    // Find the inventoryData.page.tabs array item that has type=special
    const specialTab = inventoryData.page.tabs.find((tab) => queryTab === tab.type);
    if (! specialTab || ! specialTab.subtabs || ! specialTab.subtabs.length || ! specialTab.subtabs[0].tags) {
      return [];
    }

    const owned = specialTab.subtabs[0].tags.filter((tag) => queryTag === tag.type);
    if (! owned || ! owned.length || ! owned[0].items) {
      return [];
    }

    allItems = owned[0].items;
  }

  // Merge the required allItems with the owned allItems
  required.forEach((requiredItem) => {
    const ownedItem = allItems.find((i) => i.type === requiredItem.type);
    if (! ownedItem) {
      allItems.push(requiredItem);
    }
  });

  allItems = allItems.map((item) => {
    const requiredItem = required.find((i) => i.type === item.type);

    return {
      item_id: item.item_id, // eslint-disable-line camelcase
      type: item.type,
      name: item.name,
      thumbnail: item.thumbnail_gray || item.thumbnail, // eslint-disable-line camelcase
      quantity: item.quantity || 0,
      quantity_formatted: item.quantity_formatted || '0', // eslint-disable-line camelcase
      le: ! requiredItem,
    };
  });

  // sort the items array by name
  allItems.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return allItems;
};

/**
 * Get the progress for a category.
 *
 * @param {Array} items    The items.
 * @param {Array} required The required items.
 *
 * @return {Object} The progress.
 */
const getProgress = (items, required) => {
  // Count the number of required chests that are owned
  let le = 0;
  let requiredCompleted = 0;
  items.forEach((item) => {
    if (item.quantity <= 0) {
      return;
    }

    if (! item.le) {
      requiredCompleted++;
    } else if (item.le) {
      le++;
    }
  });

  return {
    checkmark: required.total >= requiredCompleted,
    completed: requiredCompleted,
    required: required.length,
    le,
  };
};

/**
 * Make the progress string.
 *
 * @param {Object} progress The progress.
 *
 * @return {string} The progress string.
 */
const makeProgressString = (progress) => {
  const { completed, required, le } = progress;

  let text = `${completed} of ${required}`;
  if (le && le > 0) {
    text += ` (+${le} LE)`;
  }

  return text;
};

/**
 * Make the markup for a category.
 *
 * @param {string} category The category.
 * @param {string} name     The name.
 * @param {Object} progress The progress.
 */
const makeCategory = (category, name, progress) => {
  const exists = document.querySelector(`.hunterProfileItemsView-category[data-category="${category}"]`);
  if (exists) {
    return;
  }

  const sidebar = document.querySelector('.hunterProfileItemsView-directory');
  if (! sidebar) {
    return;
  }

  const catSidebarCategory = makeElement('a', 'hunterProfileItemsView-category');
  if (progress.completed === progress.required) {
    catSidebarCategory.classList.add('complete');
  }

  catSidebarCategory.title = name;
  catSidebarCategory.href = '#';
  catSidebarCategory.setAttribute('data-category', category);
  catSidebarCategory.addEventListener('click', () => {
    hg.views.HunterProfileItemsView.showCategory(category);
    return false;
  });

  const catSidebarCategoryMargin = makeElement('div', 'hunterProfileItemsView-category-margin');

  makeElement('div', 'hunterProfileItemsView-category-name', name, catSidebarCategoryMargin);
  makeElement('div', 'hunterProfileItemsView-category-progress', makeProgressString(progress), catSidebarCategoryMargin);
  makeElement('div', 'hunterProfileItemsView-category-status', '', catSidebarCategoryMargin);

  catSidebarCategory.append(catSidebarCategoryMargin);

  sidebar.append(catSidebarCategory);
};

/**
 * Make the markup for an item.
 *
 * @param {Object}  item                    The item.
 * @param {string}  item.item_id            The item id.
 * @param {string}  item.type               The item type.
 * @param {string}  item.name               The item name.
 * @param {string}  item.thumbnail          The item thumbnail.
 * @param {string}  item.thumbnail_gray     The item gray thumbnail.
 * @param {number}  item.quantity           The item quantity.
 * @param {string}  item.quantity_formatted The item formatted quantity.
 * @param {boolean} item.le                 If the item is limited edition.
 *
 * @return {HTMLElement} The item div.
 */
const makeItem = (item) => {
  const { item_id, type, name, thumbnail, thumbnail_gray, quantity, quantity_formatted, le } = item; // eslint-disable-line camelcase

  const itemDiv = makeElement('div', 'hunterProfileItemsView-categoryContent-item');
  if (quantity > 0) {
    itemDiv.classList.add('collected');
    if (le) {
      itemDiv.classList.add('limited_edition');
    }
  } else {
    itemDiv.classList.add('uncollected');
    itemDiv.classList.add('hidden');
  }

  itemDiv.setAttribute('data-id', item_id);
  itemDiv.setAttribute('data-type', type);

  const itemPadding = makeElement('div', 'hunterProfileItemsView-categoryContent-item-padding');
  itemPadding.addEventListener('click', () => {
    hg.views.ItemView.show(type);
  });

  const itemImage = makeElement('div', 'itemImage');
  itemImage.style.backgroundImage = (quantity > 0 && thumbnail_gray) ? `url(${thumbnail_gray})` : `url(${thumbnail})`; // eslint-disable-line camelcase

  if (quantity > 0) {
    makeElement('div', 'quantity', quantity_formatted, itemImage);
  }

  const itemName = makeElement('div', 'hunterProfileItemsView-categoryContent-item-name');
  makeElement('span', '', name, itemName);

  itemPadding.append(itemImage);
  itemPadding.append(itemName);

  itemDiv.append(itemPadding);

  return itemDiv;
};

/**
 * Make the markup for the content.
 *
 * @param {string}  id        The id.
 * @param {string}  name      The name.
 * @param {Array}   items     The items.
 * @param {boolean} completed If the category is completed.
 */
const makeContent = (id, name, items, completed) => {
  const content = document.querySelector('.hunterProfileItemsView-content-padding');
  if (! content) {
    return;
  }

  const categoryDiv = makeElement('div', 'hunterProfileItemsView-categoryContent');
  if (completed) {
    categoryDiv.classList.add('collected');
  }

  categoryDiv.setAttribute('data-category', id);

  const nameDiv = makeElement('div', 'hunterProfileItemsView-categoryContent-name', name);

  const itemsDiv = document.createElement('div');

  // sort the items by name
  items.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  items.forEach((item) => {
    itemsDiv.append(makeItem(item));
  });

  categoryDiv.append(nameDiv);
  categoryDiv.append(itemsDiv);

  content.append(categoryDiv);
};

/**
 * Add the category and items.
 *
 * @param {Array}  required The required items.
 * @param {string} type     The type.
 * @param {string} subtype  The subtype.
 * @param {string} key      The key.
 * @param {string} name     The name.
 *
 * @return {boolean} If the category and items were added.
 */
const addCategoryAndItems = async (required, type, subtype, key, name) => {
  const exists = document.querySelector(`.hunterProfileItemsView-categoryContent[data-category="${key}"]`);
  if (exists) {
    return;
  }

  const items = await getItems(required, type, subtype);
  const progress = getProgress(items, required);

  makeCategory(key, name, progress);
  makeContent(key, name, items, progress.completed);

  return true;
};

/**
 * Run the module.
 */
const run = async () => {
  if (! ('hunterprofile' === getCurrentPage() && 'items' === getCurrentTab())) {
    return;
  }

  if (! hg?.utils?.PageUtil?.getQueryParams) {
    return;
  }

  for (const category of categories) {
    if (! getSetting(`ultimate-checkmark-categories-${category.id}`, true)) {
      continue;
    }

    await addCategoryAndItems(category.items, category.type, category.subtype, category.key, category.name);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'ultimate-checkmark');

  onNavigation(run, {
    page: 'hunterprofile',
    tab: 'items',
  });
};

export default {
  id: 'ultimate-checkmark',
  type: 'feature',
  alwaysLoad: true,
  load: init,
  settings,
};
