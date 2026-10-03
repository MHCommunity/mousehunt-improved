import { getSetting, saveSetting } from '@utils';

const settingKey = 'custom-menu.layout';

/**
 * Items hidden until the menu has been customized.
 */
const defaultHidden = ['my-profile', 'discord', 'community'];

/**
 * The MH Improved icon is the way back into settings, so it can't be hidden.
 */
const lockedItems = new Set(['mousehunt-improved-icon-menu']);

/**
 * The game's own menu items, in the order the game renders them.
 */
const nativeItems = [
  { id: 'inbox', name: 'Inbox', selector: '.inbox' },
  { id: 'my-profile', name: 'My Profile', selector: '.myProfile' },
  { id: 'gifts', name: 'Gifts', selector: '.freeGifts' },
  { id: 'discord', name: 'Discord', selector: '.chat' },
  { id: 'item-shop', name: 'Item Shop', selector: '.premiumShop' },
  { id: 'super-brie', name: 'SUPER|brie+', selector: '.superBrie:not(#autoHorn)' },
  { id: 'autohorn', name: 'AutoHorn', selector: '#autoHorn' },
  { id: 'advent-calendar', name: 'Advent Calendar', selector: '.adventCalendar' },
  { id: 'settings', name: 'Settings', selector: '.settings' },
  { id: 'community', name: 'Community', selector: '.community' },
  { id: 'help', name: 'Help', selector: '.support' },
];

/**
 * Get the two groups of menu items: the tabs on the left and the dropdown container on the right.
 *
 * @return {Object} The left and right containers, either of which may be null.
 */
const getContainers = () => {
  const left = document.querySelector('.mousehuntHeaderView-gameTabs');

  return {
    left,
    right: left?.querySelector(':scope > .mousehuntHeaderView-dropdownContainer') || null,
  };
};

/**
 * Get the id for a menu item.
 *
 * @param {HTMLElement} el The menu item.
 *
 * @return {string|null} The id, or null if it's not an item we know about.
 */
const getItemId = (el) => {
  return el.dataset.mhMenuId || nativeItems.find((item) => el.matches(item.selector))?.id || null;
};

/**
 * Get the name to show for a menu item.
 *
 * @param {HTMLElement} el The menu item.
 * @param {string}      id The item id.
 *
 * @return {string} The name.
 */
const getItemName = (el, id) => {
  return el.dataset.mhMenuName || nativeItems.find((item) => item.id === id)?.name || el.title || el.textContent.trim() || id;
};

/**
 * Get the menu items we know about in a container, in their current order.
 *
 * @param {HTMLElement} container The container.
 *
 * @return {Array} The items, each with `el` and `id`.
 */
const getGroupItems = (container) => {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll(':scope > .menuItem')].map((el) => ({ el, id: getItemId(el) })).filter((item) => item.id);
};

/**
 * Get the saved layout, falling back to the defaults.
 *
 * @return {Object} The layout, with `left` and `right` orders and the `hidden` ids.
 */
const getLayout = () => {
  const saved = getSetting(settingKey, null);

  return {
    left: Array.isArray(saved?.left) ? saved.left : [],
    right: Array.isArray(saved?.right) ? saved.right : [],
    hidden: Array.isArray(saved?.hidden) ? saved.hidden : defaultHidden,
  };
};

/**
 * Save the layout.
 *
 * @param {Object} layout The layout, with `left` and `right` orders and the `hidden` ids.
 */
const saveLayout = (layout) => {
  saveSetting(settingKey, layout);
};

/**
 * Get the default sort rank for a menu item.
 *
 * Icons the modules prepend come first, then the game's items, then our tabs, then appended icons
 * like the MH Improved icon.
 *
 * @param {Object}      item    The item.
 * @param {HTMLElement} item.el The menu item element.
 * @param {string}      item.id The item id.
 *
 * @return {number} The rank.
 */
const getDefaultRank = ({ el, id }) => {
  const nativeIndex = nativeItems.findIndex((native) => native.id === id);
  if (nativeIndex !== -1) {
    return 1000 + nativeIndex;
  }

  if ('prepend' === el.dataset.mhMenuPosition) {
    return 0;
  }

  if ('append' === el.dataset.mhMenuPosition) {
    return 3000;
  }

  return 2000 + Number(el.dataset.mhOrder || 0);
};

/**
 * Get the default order for a group's items. Items with the same rank keep their current order.
 *
 * @param {Array} items The items, each with `el` and `id`.
 *
 * @return {Array} The ids in their default order.
 */
const getDefaultOrder = (items) => {
  return items
    .map((item, index) => ({ id: item.id, rank: getDefaultRank(item), index }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((item) => item.id);
};

/**
 * Put the items of a container in the given order.
 *
 * Only the items in the order are moved, and they take the spots those items already had, so
 * anything the order doesn't mention stays where it is.
 *
 * @param {HTMLElement} container The container.
 * @param {Array}       order     The ids in the order they should be.
 */
const applyOrder = (container, order) => {
  const items = getGroupItems(container).filter((item) => order.includes(item.id));
  const sorted = [...items].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  if (items.every((item, index) => item === sorted[index])) {
    return;
  }

  const markers = items.map(({ el }) => {
    const marker = document.createComment('');
    el.replaceWith(marker);
    return marker;
  });

  markers.forEach((marker, index) => marker.replaceWith(sorted[index].el));
};

/**
 * Get the selector that matches a menu item.
 *
 * @param {string} id The item id.
 *
 * @return {string} The selector.
 */
const getItemSelector = (id) => {
  const native = nativeItems.find((item) => item.id === id);

  return native ? `.mousehuntHeaderView-gameTabs .menuItem${native.selector}` : `.mousehuntHeaderView-gameTabs .menuItem[data-mh-menu-id="${CSS.escape(id)}"]`;
};

/**
 * Hide the hidden items with a stylesheet, so items that are added later are hidden as soon as
 * they're added.
 *
 * @param {Array} hidden The hidden ids.
 */
const updateHiddenStyles = (hidden) => {
  let style = document.querySelector('#mh-improved-custom-menu-hidden');
  if (!style) {
    style = document.createElement('style');
    style.id = 'mh-improved-custom-menu-hidden';
    document.head.append(style);
  }

  const selectors = hidden.filter((id) => !lockedItems.has(id)).map((id) => getItemSelector(id));

  style.textContent = selectors.length ? `${selectors.join(',\n')} { display: none !important; }` : '';
};

/**
 * Mark the first and last visible items on the left, which get the rounded corner and the closing
 * border, so they follow the items when they're reordered.
 *
 * @param {HTMLElement} container The left container.
 */
const updateEndItems = (container) => {
  const items = [...container.querySelectorAll(':scope > .menuItem')];
  const visible = items.filter((el) => 'none' !== getComputedStyle(el).display);

  items.forEach((el) => {
    el.classList.toggle('first', el === visible[0]);
    el.classList.toggle('last', el === visible.at(-1));
  });
};

/**
 * Apply a layout to the menu.
 *
 * @param {Object} layout The layout, defaults to the saved one.
 */
const applyLayout = (layout = getLayout()) => {
  const { left, right } = getContainers();
  if (!left) {
    return;
  }

  updateHiddenStyles(layout.hidden);
  applyOrder(left, layout.left);
  applyOrder(right, layout.right);
  updateEndItems(left);
};

export { applyLayout, defaultHidden, getContainers, getDefaultOrder, getGroupItems, getItemName, getLayout, lockedItems, saveLayout };
