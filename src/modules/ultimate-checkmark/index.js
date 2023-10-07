import { addUIStyles, onNavigationPatched } from '../utils';
import styles from './styles.css';

import airships from './items/airships.json';
import currency from './items/currency.json';
import equipment from './items/equipment.json';
import plankrunPages from './items/plankrun-pages.json';
import treasureChests from './items/treasure-chests.json';

const getItems = async (required, queryTab, queryTag, allItems = []) => {
  if (! allItems.length) {
    const inventoryData = await doRequest(
      'managers/ajax/pages/page.php',
      {
        page_class: 'Inventory',
        'page_arguments[legacyMode]': '',
        'page_arguments[tab]': queryTab,
        'page_arguments[sub_tab]': 'false',
      }
    );

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
      item_id: item.item_id, /* eslint-disable-line camelcase */
      type: item.type,
      name: item.name,
      thumbnail: item.thumbnail_gray || item.thumbnail, /* eslint-disable-line camelcase */
      quantity: item.quantity || 0,
      quantity_formatted: item.quantity_formatted || '0', /* eslint-disable-line camelcase */
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

const makeProgressString = (progress) => {
  const { completed, required, le } = progress;

  let text = `${completed} of ${required}`;
  if (le && le > 0) {
    text += ` (+${le} LE)`;
  }

  return text;
};

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

  catSidebarCategory.appendChild(catSidebarCategoryMargin);

  sidebar.appendChild(catSidebarCategory);
};

const makeItem = (item) => {
  const { item_id, type, name, thumbnail, thumbnail_gray, quantity, quantity_formatted, le } = item; /* eslint-disable-line camelcase */

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
  if (quantity > 0 && thumbnail_gray) { /* eslint-disable-line camelcase */
    itemImage.style.backgroundImage = `url(${thumbnail_gray})`; /* eslint-disable-line camelcase */
  } else {
    itemImage.style.backgroundImage = `url(${thumbnail})`;
  }

  if (quantity > 0) {
    makeElement('div', 'quantity', quantity_formatted, itemImage);
  }

  const itemName = makeElement('div', 'hunterProfileItemsView-categoryContent-item-name');
  makeElement('span', '', name, itemName);

  itemPadding.appendChild(itemImage);
  itemPadding.appendChild(itemName);

  itemDiv.appendChild(itemPadding);

  return itemDiv;
};

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
    itemsDiv.appendChild(makeItem(item));
  });

  categoryDiv.appendChild(nameDiv);
  categoryDiv.appendChild(itemsDiv);

  content.appendChild(categoryDiv);
};

const addCategoryAndItems = async (required, type, subtype, key, name) => {
  const exists = document.querySelector(`.hunterProfileItemsView-categoryContent[data-category="${key}"]`);
  if (exists) {
    return;
  }

  const items = await getItems(required, type, subtype);
  const progress = getProgress(items, required);

  makeCategory(key, name, progress);
  makeContent(key, name, items, progress.completed);
};

const run = async () => {
  if (! ('hunterprofile' === getCurrentPage() && 'items' === getCurrentTab())) {
    return;
  }

  const params = hg.utils.PageUtil.getQueryParams();
  if (! (params && params.snuid && user.sn_user_id === params.snuid)) {
    return;
  }

  const categories = [
    {
      name: 'Treasure Chests',
      items: treasureChests,
      type: 'special',
      subtype: 'treasure_chests',
      key: 'chests',
    },
    {
      name: 'Airships',
      items: airships,
      type: 'special',
      subtype: 'cosmetics',
      key: 'airships',
    },
    {
      name: 'Equipment',
      items: equipment,
      type: 'special',
      subtype: 'equipment',
      key: 'equipment',
    },
    {
      name: 'Currency',
      items: currency,
      type: 'special',
      subtype: 'currency',
      key: 'currency',
    },
    {
      name: 'Plankrun Pages',
      items: plankrunPages,
      type: 'plankrun',
      subtype: 'general',
      key: 'plankrun',
    },
  ];

  // wait for each category to load + an extra 250ms before loading the next
  let delay = 0;
  for (const category of categories) {
    setTimeout(() => {
      addCategoryAndItems(category.items, category.type, category.subtype, category.key, category.name);
    }, delay);
    delay += 500;
  }
};

export default () => {
  addUIStyles(styles);

  onNavigationPatched(run, {
    page: 'hunterprofile',
    tab: 'items'
  });
};
