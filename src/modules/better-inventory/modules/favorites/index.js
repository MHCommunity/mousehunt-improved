import {
  addStyles,
  doRequest,
  getCurrentPage,
  getSetting,
  getUserItems,
  isUserTitleAtLeast,
  make,
  makeFavoriteButton,
  onEvent,
  onNavigation,
  onRequest,
  saveSetting,
} from '@utils';

import { reapplySorting } from '../sorting';

import styles from './styles.css';
import trapSelectorFavorites from './trap-selector';

const tabType = 'mhui-favorites';
const groupTag = 'mhui-favorites-group';

// Subtabs that don't get a favorites group or favorites-first ordering.
const skippedSubtabs = new Set(['favorites', 'crafting_table', 'hammer']);

const groupNames = {
  bait: 'Cheese',
  weapon: 'Weapons',
  base: 'Bases',
  trinket: 'Charms',
  skin: 'Skins',
  crafting_item: 'Crafting',
  potion: 'Potions',
  convertible: 'Convertibles',
  collectible: 'Collectibles',
  stat: 'Special',
  quest: 'Quest items',
  message_item: 'Message items',
  torn_page: 'Torn pages',
  map_piece: 'Map pieces',
};

const statKeys = [
  'has_power',
  'power_formatted',
  'has_power_bonus',
  'has_attraction_bonus',
  'has_luck',
  'has_cheese_effect',
  'has_min_title',
  'min_title_name',
  'min_title_icon',
  'power_type_icon',
];

/**
 * Get the favorited item or recipe types.
 *
 * Recipes aren't items, so they're kept apart to stop the Favorites tab asking for them as items.
 *
 * @param {string} kind Either 'item' or 'recipe'.
 *
 * @return {string[]} The types.
 */
const getFavorites = (kind = 'item') => getSetting('recipe' === kind ? 'better-inventory.favorite-recipes' : 'better-inventory.favorite-items', []);

/**
 * Get whether an inventory element is an item or a recipe.
 *
 * @param {Element} el The inventory item element.
 *
 * @return {string} Either 'item' or 'recipe'.
 */
const getKind = (el) => ('recipe' === el.getAttribute('data-item-classification') ? 'recipe' : 'item');

/**
 * Get an item's untouched name (Enhanced Search appends its terms to `data-name`).
 *
 * @param {Element} el The inventory item element.
 *
 * @return {string} The name.
 */
const getName = (el) => el.getAttribute('data-mhui-name') || el.getAttribute('data-name') || '';

/**
 * Compare two inventory elements by name.
 *
 * @param {Element} a The first element.
 * @param {Element} b The second element.
 *
 * @return {number} The comparison.
 */
const byName = (a, b) => getName(a).localeCompare(getName(b));

/**
 * Update every star on the page for an item.
 *
 * @param {string}  type     The item type.
 * @param {boolean} favorite Whether it's a favorite.
 */
const updateStars = (type, favorite) => {
  document.querySelectorAll(`.inventoryPage-item[data-item-type="${CSS.escape(type)}"]`).forEach((el) => {
    el.classList.toggle('mh-inventory-favorited', favorite);

    const star = el.querySelector('.mh-inventory-favorite');
    if (star) {
      star.classList.toggle('active', favorite);
      star.classList.toggle('inactive', !favorite);
      star.title = favorite ? 'Remove from favorites' : 'Add to favorites';
    }
  });
};

/**
 * Add or remove a favorite.
 *
 * @param {string}  type     The item type.
 * @param {boolean} favorite Whether it should be a favorite.
 * @param {string}  kind     Either 'item' or 'recipe'.
 */
const setFavorite = (type, favorite, kind = 'item') => {
  const favorites = getFavorites(kind).filter((t) => t !== type);

  saveSetting('recipe' === kind ? 'better-inventory.favorite-recipes' : 'better-inventory.favorite-items', favorite ? [...favorites, type] : favorites);
  updateStars(type, favorite);
  arrangeFavorites();
  addStars();

  // Unstarring from the Favorites tab takes the item out of it.
  if (!favorite) {
    document.querySelectorAll(`.mousehuntHud-page-tabContent.${tabType} .inventoryPage-item[data-item-type="${CSS.escape(type)}"]`).forEach((el) => {
      const group = el.closest('.inventoryPage-tagContent-tagGroup');
      el.remove();
      updateGroupCount(group);
    });
  }
};

/**
 * Update a favorites group's count, removing it once it's empty.
 *
 * @param {Element|null} group The tag group.
 */
const updateGroupCount = (group) => {
  if (!group) {
    return;
  }

  const count = group.querySelectorAll('.inventoryPage-item').length;
  const tab = group.closest('.inventoryContent');
  const tag = group.getAttribute('data-tag');
  const directoryCount = tab?.querySelector(`.inventoryPage-tagDirectory-tag[data-tag="${tag}"] span`);

  if (count) {
    group.querySelector('.inventoryPage-tagContent-itemCount').textContent = count;
    if (directoryCount) {
      directoryCount.textContent = count;
    }

    return;
  }

  group.remove();
  directoryCount?.closest('.inventoryPage-tagDirectory-tag')?.remove();
};

let starCount = 0;

/**
 * Add the favorite stars to the items on the page.
 */
const addStars = () => {
  const favorites = { item: new Set(getFavorites('item')), recipe: new Set(getFavorites('recipe')) };

  document.querySelectorAll('.inventoryPage-item[data-item-type]').forEach((el) => {
    // The game copies items into the search results without their click handlers, so swap those
    // copies for working stars.
    const existing = el.querySelector('.mh-inventory-favorite');
    if (existing?.mhBound) {
      return;
    }

    existing?.remove();

    const margin = el.querySelector('.inventoryPage-item-margin');
    if (!margin) {
      return;
    }

    const type = el.getAttribute('data-item-type');
    const kind = getKind(el);
    const favorite = favorites[kind].has(type);
    el.classList.toggle('mh-inventory-favorited', favorite);

    starCount++;
    makeFavoriteButton({
      id: `mh-inventory-favorite-${starCount}`,
      target: margin,
      size: 'small',
      isSetting: false,
      state: favorite,
      onChange: (state) => setFavorite(type, state, kind),
    }).then((star) => {
      star.classList.add('mh-inventory-favorite');
      star.title = favorite ? 'Remove from favorites' : 'Add to favorites';
      star.mhBound = true;
    });
  });
};

/**
 * Make a tag group for a set of items.
 *
 * @param {string}   tag   The group id.
 * @param {string}   name  The group name.
 * @param {string[]} cards The rendered item markup.
 *
 * @return {HTMLElement} The tag group.
 */
const makeGroup = (tag, name, cards) => {
  const group = make('div', ['inventoryPage-tagContent-tagGroup', 'clear-block', 'active']);
  group.setAttribute('data-tag', tag);
  group.setAttribute('data-name', name);

  const title = make('div', 'inventoryPage-tagContent-tagTitle', `${name} (`, group);
  make('span', 'inventoryPage-tagContent-itemCount', cards.length, title);
  title.append(')');

  const listing = make('div', 'inventoryPage-tagContent-listing', '', group);
  listing.setAttribute('data-tag', tag);
  listing.innerHTML = cards.join('');

  return group;
};

/**
 * Render an item with the game's own inventory template so its buttons work as normal.
 *
 * @param {Object}  item       The item data.
 * @param {boolean} forceSmall Whether to use the small card.
 *
 * @return {string} The item markup.
 */
const renderItem = (item, forceSmall = false) => {
  const data = app.pages.InventoryPage.formatItem(item, forceSmall);
  const isComponent = ['weapon', 'base', 'trinket'].includes(item.classification);

  // Match the other tabs, which show full names and component descriptions.
  data.name_formatted = item.name;
  if (isComponent && !forceSmall) {
    data.description = item.description;
  }

  // formatItem leaves out the flags the stat block needs, so it would show every stat as empty.
  if (isComponent && !forceSmall) {
    statKeys.forEach((key) => {
      if (undefined !== item[key]) {
        data[key] = item[key];
      }
    });

    data.stat_block_css_class = 'horizontal';

    if (item.min_title_name) {
      const meetsTitle = isUserTitleAtLeast(item.min_title_name.toLowerCase().replaceAll(' ', ''));
      data.min_title_met = meetsTitle;
      data.min_title_error = !meetsTitle;
    }
  }

  let html = hg.utils.TemplateUtil.renderFromFile('InventoryPage', 'item', data);

  // formatItem checks if a component can be armed using data keys this item doesn't have, so it
  // always marks them as disabled.
  if (isComponent && !hg.utils.UserInventory.isArmed(item.item_id)) {
    html = html.replace(/(class="inventoryPage-item [^"]*)\bdisabled\b/, '$1canArm');
  }

  return html;
};

/**
 * Get the favorited recipes, ready for the game's item template.
 *
 * @return {Promise<Object[]>} The recipes, by name.
 */
const getFavoriteRecipes = async () => {
  const favorites = new Set(getFavorites('recipe'));
  if (!favorites.size) {
    return [];
  }

  let response;
  try {
    response = await doRequest('managers/ajax/pages/page.php', {
      page_class: 'Inventory',
      'page_arguments[tab]': 'crafting',
      'page_arguments[sub_tab]': 'recipe',
    });
  } catch {
    return [];
  }

  const subtab = response?.page?.tabs?.find((tab) => 'crafting' === tab.type)?.subtabs?.find((sub) => 'recipe' === sub.subtab_type);

  // Recipes can be in more than one group.
  const recipes = new Map();
  (subtab?.tags || []).forEach((tag) => {
    (tag.items || []).forEach((recipe) => {
      if (favorites.has(recipe.type) && !recipes.has(recipe.type)) {
        recipes.set(recipe.type, recipe);
      }
    });
  });

  return [...recipes.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Copy an item into the favorites group without the controls other features bound to the original.
 *
 * @param {Element} el The inventory item element.
 *
 * @return {Element} The copy.
 */
const copyItem = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('.mh-inventory-favorite, .mhui-inventory-lock-and-hide-item-controls').forEach((child) => child.remove());
  copy.classList.remove('mh-inventory-sort-duplicate', 'mh-inventory-item-filtered');
  copy.style.removeProperty('order');

  return copy;
};

/**
 * Keep a Favorites group at the top of a subtab with area groups.
 *
 * The items are copies, so the originals stay in their area groups for the game to manage.
 *
 * @param {Element} subtabEl  The subtab content element.
 * @param {Set}     favorites The favorited types.
 */
const updateFavoritesGroup = (subtabEl, favorites) => {
  const tagContent = subtabEl.querySelector('.inventoryPage-tagContent');
  const directory = subtabEl.querySelector('.inventoryPage-tagDirectory-listing');
  let group = tagContent.querySelector('.mh-inventory-favorites-group');
  let link = directory?.querySelector(`.inventoryPage-tagDirectory-tag[data-tag="${groupTag}"]`);

  const picked = new Map();
  tagContent
    .querySelectorAll('.inventoryPage-tagContent-tagGroup:not(.search, .mh-inventory-favorites-group) .inventoryPage-tagContent-listing > .inventoryPage-item')
    .forEach((el) => {
      const type = el.getAttribute('data-item-type');
      if (favorites.has(type) && !picked.has(type)) {
        picked.set(type, el);
      }
    });

  if (!picked.size) {
    group?.remove();
    link?.remove();
    return;
  }

  if (!group) {
    // Match whichever groups are showing, so it doesn't pop up while one area is picked.
    const activeTag = subtabEl.querySelector('.inventoryPage-tagDirectory-tag.active')?.getAttribute('data-tag');
    const isSearching = tagContent.querySelector('.inventoryPage-tagContent-tagGroup.search.active');
    const isShown = !isSearching && (!activeTag || 'all' === activeTag);

    group = make('div', ['inventoryPage-tagContent-tagGroup', 'clear-block', 'mh-inventory-favorites-group', isShown ? 'active' : 'contracted']);
    group.setAttribute('data-tag', groupTag);
    // The game sorts groups by name, and an empty one sorts first.
    group.setAttribute('data-name', '');

    const title = make('div', 'inventoryPage-tagContent-tagTitle', 'Favorites (', group);
    make('span', 'inventoryPage-tagContent-itemCount', '', title);
    title.append(')');

    const listing = make('div', 'inventoryPage-tagContent-listing', '', group);
    listing.setAttribute('data-tag', groupTag);
  }

  if (directory && !link) {
    link = make('a', 'inventoryPage-tagDirectory-tag', 'Favorites (');
    link.href = '#';
    link.setAttribute('data-tag', groupTag);
    link.setAttribute('data-name', '');
    link.setAttribute('onclick', 'app.pages.InventoryPage.showTagGroup(this); return false;');
    make('span', '', '', link);
    link.append(')');
  }

  const key = [...picked.keys()].sort().join(',');
  if (group.dataset.mhFavorites !== key) {
    group.querySelector('.inventoryPage-tagContent-listing').replaceChildren(...[...picked.values()].sort(byName).map((el) => copyItem(el)));
    group.dataset.mhFavorites = key;
  }

  // Recipes are filtered by whether they're known.
  const recipeFilter = ['known', 'unknown'].find((filter) => 'recipe' === subtabEl.getAttribute('data-tab') && subtabEl.classList.contains(filter));
  const count = recipeFilter ? group.querySelectorAll(`.inventoryPage-item.${recipeFilter}`).length : picked.size;
  group.querySelector('.inventoryPage-tagContent-itemCount').textContent = count.toLocaleString();
  link?.querySelector('span')?.replaceChildren(count.toLocaleString());

  const firstGroup = tagContent.querySelector(':scope > .inventoryPage-tagContent-tagGroup:not(.search, .mh-inventory-favorites-group)');
  if (firstGroup && group.nextElementSibling !== firstGroup) {
    firstGroup.before(group);
  }

  if (directory && directory.firstElementChild !== link) {
    directory.prepend(link);
  }
};

/**
 * Keep favorites at the top of a subtab that's one list.
 *
 * @param {Element} subtabEl  The subtab content element.
 * @param {Set}     favorites The favorited types.
 * @param {boolean} isActive  Whether favorites go first, or back in their usual places.
 */
const moveFavoritesToTop = (subtabEl, favorites, isActive) => {
  const listing = subtabEl.querySelector('.inventoryPage-tagContent-tagGroup:not(.search) .inventoryPage-tagContent-listing');
  if (!listing) {
    return;
  }

  const items = [...listing.children].filter((el) => el.classList.contains('inventoryPage-item'));
  const isFavorite = (el) => favorites.has(el.getAttribute('data-item-type'));

  let desired;
  if (isActive && (items.some((el) => isFavorite(el)) || listing.dataset.mhFavoritesFirst)) {
    desired = [...items.filter((el) => isFavorite(el)).sort(byName), ...items.filter((el) => !isFavorite(el)).sort(byName)];
    listing.dataset.mhFavoritesFirst = 'true';
  } else if (!isActive && listing.dataset.mhFavoritesFirst) {
    desired = [...items].sort(byName);
    delete listing.dataset.mhFavoritesFirst;
  }

  if (!desired || desired.every((el, index) => el === items[index])) {
    return;
  }

  desired.forEach((el) => listing.append(el));
};

/**
 * Put favorites first in the visible subtab, unless it's sorted or filtered.
 */
const arrangeFavorites = () => {
  if ('inventory' !== getCurrentPage()) {
    return;
  }

  const tabEl = document.querySelector('.mousehuntHud-page-tabContent.active');
  const subtabEl = tabEl?.querySelector('.mousehuntHud-page-subTabContent.active');
  if (!subtabEl?.querySelector('.inventoryPage-tagContent') || 'plankrun' === tabEl.getAttribute('data-tab') || skippedSubtabs.has(subtabEl.getAttribute('data-tab'))) {
    return;
  }

  const kind = 'recipe' === subtabEl.getAttribute('data-tab') ? 'recipe' : 'item';
  const favorites = new Set(getFavorites(kind));
  const isActive = !subtabEl.classList.contains('mh-inventory-sort-flat') && !subtabEl.classList.contains('mh-inventory-sort-filtering');

  if (!subtabEl.querySelector('.inventoryPage-tagDirectory')) {
    moveFavoritesToTop(subtabEl, favorites, isActive);
    return;
  }

  updateFavoritesGroup(subtabEl, favorites);

  // The recipe book shows one group at a time, so open it on Favorites. Only on the first pass
  // for each load, so starring a recipe doesn't jump away from the group being looked at.
  const isFirstPass = !subtabEl.mhFavoritesArranged;
  subtabEl.mhFavoritesArranged = true;
  const favoritesLink = subtabEl.querySelector(`.inventoryPage-tagDirectory-tag[data-tag="${groupTag}"]`);
  if (isFirstPass && 'recipe' === subtabEl.getAttribute('data-tab') && favoritesLink && !favoritesLink.classList.contains('hidden')) {
    app.pages.InventoryPage.showTagGroup(favoritesLink);
  }

  // The group is hidden while sorting or filtering, so don't leave it as the only one picked.
  const activeLink = subtabEl.querySelector(`.inventoryPage-tagDirectory-tag.active[data-tag="${groupTag}"]`);
  const allLink = subtabEl.querySelector('.inventoryPage-tagDirectory-tag[data-tag="all"]');
  if (!isActive && activeLink && allLink) {
    app.pages.InventoryPage.showTagGroup(allLink);
  }
};

/**
 * Make a link in the tag directory.
 *
 * @param {string}      tag    The group id.
 * @param {string}      name   The group name.
 * @param {number|null} count  The item count, or null to leave it off.
 * @param {Element}     parent The element to add it to.
 */
const makeDirectoryTag = (tag, name, count, parent) => {
  const link = make('a', ['inventoryPage-tagDirectory-tag', 'all' === tag ? 'all active' : ''], name, parent);
  link.href = '#';
  link.setAttribute('data-tag', tag);
  link.setAttribute('onclick', 'app.pages.InventoryPage.showTagGroup(this); return false;');
  if (null !== count) {
    link.append(' (');
    make('span', '', count, link);
    link.append(')');
  }
};

/**
 * Fill the Favorites tab.
 *
 * @param {Element} content The tab content element.
 */
const renderFavorites = async (content) => {
  const subtab = content.querySelector('.mousehuntHud-page-subTabContent');
  const inventory = content.querySelector('.inventoryContent');
  const favorites = getFavorites();

  content.classList.add('loading');

  let items = [];
  if (favorites.length) {
    try {
      items = await getUserItems(favorites, true);
    } catch {
      items = [];
    }
  }

  const recipes = await getFavoriteRecipes();

  content.classList.remove('loading');
  inventory.innerHTML = '';

  const owned = items.filter((item) => item.quantity > 0);
  const unowned = items.filter((item) => !item.quantity);

  if (!owned.length && !unowned.length && !recipes.length) {
    const empty = make('div', ['mousehuntHud-page-subTabContent-empty', 'mh-inventory-favorites-empty'], '', inventory);
    make('div', 'mh-inventory-favorites-empty-title', 'No favorites yet', empty);
    make('div', '', 'Click the star on any inventory item to add it here.', empty);
    return;
  }

  const groups = new Map();
  owned.forEach((item) => {
    if (!groups.has(item.classification)) {
      groups.set(item.classification, []);
    }

    groups.get(item.classification).push(item);
  });

  const order = Object.keys(groupNames);
  const sortedGroups = [...groups.entries()].sort(([a], [b]) => {
    const aIndex = order.includes(a) ? order.indexOf(a) : order.length;
    const bIndex = order.includes(b) ? order.indexOf(b) : order.length;
    return aIndex - bIndex || a.localeCompare(b);
  });

  const directory = make('div', 'inventoryPage-tagDirectory', '', inventory);
  const search = make('div', 'inventoryPage-tagDirectory-searchBar', 'Search:', directory);
  const searchInput = make('input', 'inventoryPage-tagDirectory-searchBar-input', '', search);
  searchInput.type = 'text';
  searchInput.setAttribute('onkeyup', 'app.pages.InventoryPage.searchItems(this);');
  const searchClear = make('a', 'inventoryPage-tagDirectory-searchBar-clear', 'x', search);
  searchClear.href = '#';
  searchClear.setAttribute('onclick', 'app.pages.InventoryPage.clearSearchItems(this); return false;');

  makeDirectoryTag('all', 'All', null, directory);
  const directoryListing = make('div', 'inventoryPage-tagDirectory-listing', '', directory);

  const tagContent = make('div', 'inventoryPage-tagContent', '', inventory);
  const searchGroup = make('div', ['inventoryPage-tagContent-tagGroup', 'search', 'contracted'], '', tagContent);
  searchGroup.setAttribute('data-tag', 'search');
  const searchTitle = make('div', 'inventoryPage-tagContent-tagTitle', '', searchGroup);
  make('span', 'inventoryPage-tagContent-name', '', searchTitle);
  searchTitle.append(' (');
  make('span', 'inventoryPage-tagContent-itemCount', '', searchTitle);
  searchTitle.append(')');

  sortedGroups.forEach(([classification, groupItems]) => {
    const name = groupNames[classification] || classification.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());
    makeDirectoryTag(classification, name, groupItems.length, directoryListing);
    tagContent.append(
      makeGroup(
        classification,
        name,
        groupItems.map((item) => renderItem(item))
      )
    );
  });

  if (recipes.length) {
    makeDirectoryTag('recipe', 'Recipes', recipes.length, directoryListing);
    tagContent.append(
      makeGroup(
        'recipe',
        'Recipes',
        recipes.map((recipe) => hg.utils.TemplateUtil.renderFromFile('InventoryPage', 'item', recipe))
      )
    );
  }

  if (unowned.length) {
    makeDirectoryTag('mhui-unowned', 'Not owned', unowned.length, directoryListing);
    const group = makeGroup(
      'mhui-unowned',
      'Not owned',
      unowned.map((item) => renderItem(item, true))
    );
    group.classList.add('mh-inventory-favorites-unowned');
    tagContent.append(group);
  }

  subtab.setAttribute('data-initialized', 'true');

  addStars();
  if (getSetting('better-inventory.add-trap-sorting', false)) {
    reapplySorting(0);
  }
};

/**
 * Show the Favorites tab.
 *
 * @param {Element} header  The tab header.
 * @param {Element} content The tab content.
 */
const showFavoritesTab = (header, content) => {
  document.querySelectorAll('.mousehuntHud-page-tabHeader.active, .mousehuntHud-page-tabContent.active').forEach((el) => {
    el.classList.remove('active');
  });

  header.classList.add('active');
  content.classList.add('active');

  renderFavorites(content);
};

/**
 * Add the Favorites tab to the inventory page.
 */
const addFavoritesTab = () => {
  if ('inventory' !== getCurrentPage()) {
    return;
  }

  const headers = document.querySelector('.mousehuntHud-page-tabHeader-container');
  const existingContent = document.querySelector('.mousehuntHud-page-tabContent');
  if (!headers || !existingContent || headers.querySelector(`.${tabType}`)) {
    return;
  }

  const header = make('a', ['mousehuntHud-page-tabHeader', tabType]);
  header.href = '#';
  header.setAttribute('data-tab', tabType);
  make('span', '', 'Favorites', header);

  headers.prepend(header);

  const content = make('div', ['mousehuntHud-page-tabContent', tabType]);
  content.setAttribute('data-tab', tabType);

  const subtab = make('div', ['mousehuntHud-page-subTabContent', 'favorites', 'show_tags', 'active'], '', content);
  subtab.setAttribute('data-tab', 'favorites');
  const margin = make('div', 'mousehuntHud-page-subTabContent-margin', '', subtab);
  make('div', 'mousehuntHud-page-tabContent-loading', '', content);
  make('div', ['inventoryContent', 'clear-block'], '', margin);

  existingContent.parentElement.append(content);

  header.addEventListener('click', (event) => {
    event.preventDefault();
    showFavoritesTab(header, content);
  });

  // The game only swaps the tabs it knows about, so put the clicked one back ourselves. This
  // also covers clicking the tab that was showing before Favorites, which the game ignores.
  headers.addEventListener('click', (event) => {
    const clicked = event.target.closest('.mousehuntHud-page-tabHeader');
    if (!clicked || clicked === header || !header.classList.contains('active')) {
      return;
    }

    header.classList.remove('active');
    content.classList.remove('active');
    clicked.classList.add('active');
    document.querySelector(`.mousehuntHud-page-tabContent[data-tab="${clicked.getAttribute('data-tab')}"]`)?.classList.add('active');
  });
};

/**
 * Match the Favorites cards to what's armed.
 *
 * The game only updates armed items inside the subtab for each classification, which Favorites
 * isn't, so its cards would keep showing their old state.
 *
 * @param {Object} user The user data from the response.
 */
const syncArmedState = (user) => {
  const armedItems = {
    base: user.base_item_id,
    weapon: user.weapon_item_id,
    trinket: user.trinket_item_id,
    bait: user.bait_item_id,
    skin: user.skin_item_id,
  };

  document.querySelectorAll('.mousehuntHud-page-subTabContent.favorites .inventoryPage-item').forEach((item) => {
    const classification = item.getAttribute('data-item-classification');
    if (!(classification in armedItems)) {
      return;
    }

    const isArmed = Number(item.getAttribute('data-item-id')) === Number(armedItems[classification]);
    if (isArmed === item.classList.contains('armed')) {
      return;
    }

    item.classList.toggle('armed', isArmed);
    item.classList.toggle('canDisarm', isArmed && ['bait', 'trinket'].includes(classification));

    if (['weapon', 'base', 'trinket'].includes(classification)) {
      item.classList.toggle('canArm', !isArmed);
      item.classList.toggle('disabled', isArmed && 'trinket' !== classification);
    }

    item.querySelectorAll('input.inventoryPage-item-button').forEach((button) => {
      button.value = isArmed ? 'Armed' : 'Arm';
    });
  });
};

let pending;

/**
 * Add the stars and tab once the game has finished updating the page.
 */
const refresh = () => {
  clearTimeout(pending);
  pending = setTimeout(() => {
    addFavoritesTab();
    arrangeFavorites();
    addStars();
  }, 100);
};

/**
 * Initialize favorites.
 */
const init = () => {
  addStyles(styles, 'better-inventory-favorites');

  trapSelectorFavorites();

  // Sorting, filtering, and the alphabetical pass all reorder the items.
  onEvent('mh-improved-inventory-sort-rendered', () => {
    arrangeFavorites();
    addStars();
  });
  onEvent('mh-improved-inventory-resorted', () => {
    arrangeFavorites();
    addStars();
  });

  // Searching copies items into the results group without asking the server for anything.
  document.addEventListener('keyup', (event) => {
    if (event.target.classList?.contains('inventoryPage-tagDirectory-searchBar-input')) {
      setTimeout(addStars, 400);
    }
  });

  onNavigation(refresh, {
    page: 'inventory',
    anyTab: true,
    anySubtab: true,
  });

  onRequest('*', (response) => {
    if ('inventory' === getCurrentPage()) {
      if (response?.user) {
        syncArmedState(response.user);
      }

      refresh();
    }
  });
};

export default init;
