import { doEvent, getHiddenMenuItems, getSetting, saveSetting } from '@utils';

import { applyItemOptions } from './item-options';
import { makeLinkElement } from './menu-links';

const settingKey = 'custom-menu.layout';

/**
 * The MH Improved icon is the way back into settings, so it can't be hidden.
 */
const lockedItems = new Set(['mousehunt-improved-icon-menu']);

/**
 * The game's own menu items, in the order the game renders them, and the side they start on.
 */
const nativeItems = [
  { id: 'inbox', name: 'Inbox', selector: '.inbox', side: 'left' },
  { id: 'my-profile', name: 'My Profile', selector: '.myProfile', side: 'left' },
  { id: 'gifts', name: 'Gifts', selector: '.freeGifts', side: 'left' },
  { id: 'discord', name: 'Discord', selector: '.chat', side: 'left' },
  { id: 'item-shop', name: 'Item Shop', selector: '.premiumShop', side: 'left' },
  { id: 'super-brie', name: 'SUPER|brie+', selector: '.superBrie:not(#autoHorn)', side: 'left' },
  { id: 'autohorn', name: 'AutoHorn', selector: '#autoHorn', side: 'left' },
  { id: 'advent-calendar', name: 'Advent Calendar', selector: '.adventCalendar', side: 'left' },
  { id: 'settings', name: 'Settings', selector: '.settings', side: 'right' },
  { id: 'community', name: 'Community', selector: '.community', side: 'right' },
  { id: 'help', name: 'Help', selector: '.support', side: 'right' },
];

/**
 * Get the side a menu item starts on. Everything MH Improved adds starts on the right.
 *
 * @param {string} id The item id.
 *
 * @return {string} The side, 'left' or 'right'.
 */
const getDefaultSide = (id) => nativeItems.find((item) => item.id === id)?.side || 'right';

/**
 * Check whether a menu item is one of the game's own.
 *
 * @param {string} id The item id.
 *
 * @return {boolean} Whether it's the game's.
 */
const isNativeItem = (id) => nativeItems.some((item) => item.id === id);

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
 * @return {Object} The layout, with `left` and `right` orders, the `hidden` ids, the added `links`,
 *                  the display `styles` for each item, and each item's other `options`.
 */
const getLayout = () => {
  const saved = getSetting(settingKey, null);

  return {
    left: Array.isArray(saved?.left) ? saved.left : [],
    right: Array.isArray(saved?.right) ? saved.right : [],
    hidden: getHiddenMenuItems(saved),
    links: Array.isArray(saved?.links) ? saved.links : [],
    styles: saved?.styles && 'object' === typeof saved.styles ? saved.styles : {},
    options: saved?.options && 'object' === typeof saved.options ? saved.options : {},
  };
};

/**
 * Save the layout.
 *
 * @param {Object} layout The layout.
 */
const saveLayout = (layout) => {
  saveSetting(settingKey, layout);

  // Some modules work differently while their item is hidden, like Journal Privacy.
  doEvent('mh-improved-custom-menu-changed', layout);
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
 * Add the links that have been added to the menu, put them on the right side, and remove the
 * ones that have been taken out.
 *
 * @param {Object}      layout The layout.
 * @param {HTMLElement} left   The left container.
 * @param {HTMLElement} right  The right container.
 */
const updateLinks = (layout, left, right) => {
  const linkIds = new Set(layout.links.map((link) => link.id));
  left.querySelectorAll('.mhui-custom-menu-link').forEach((el) => {
    if (!linkIds.has(el.dataset.mhMenuId)) {
      el.remove();
    }
  });

  for (const link of layout.links) {
    const container = layout.left.includes(link.id) ? left : right;
    if (!container) {
      continue;
    }

    const el = left.querySelector(`.mhui-custom-menu-link[data-mh-menu-id="${CSS.escape(link.id)}"]`) || makeLinkElement(link);
    if (el.parentElement !== container) {
      container.insertBefore(el, container === right ? container.querySelector(':scope > #mousehunt-improved-icon-menu') : null);
    }
  }
};

/**
 * Move items that have been put on the other side of the menu into that side's container.
 *
 * @param {Object}      layout The layout.
 * @param {HTMLElement} left   The left container.
 * @param {HTMLElement} right  The right container.
 */
const moveItemsToSides = (layout, left, right) => {
  for (const { el, id } of getGroupItems(right)) {
    if (layout.left.includes(id) && !lockedItems.has(id)) {
      left.append(el);
    }
  }

  for (const { el, id } of getGroupItems(left)) {
    if (layout.right.includes(id)) {
      right.insertBefore(el, right.querySelector(':scope > #mousehunt-improved-icon-menu'));
    }
  }
};

/**
 * Wrap the bare text in a menu item in a span, so it can be hidden on its own.
 *
 * @param {HTMLElement} el The menu item.
 */
const wrapOwnText = (el) => {
  const textNodes = [...el.childNodes].filter((node) => Node.TEXT_NODE === node.nodeType && node.textContent.trim());

  for (const node of textNodes) {
    const span = document.createElement('span');
    span.className = 'mhui-menu-own-text';
    node.replaceWith(span);
    span.append(node);
  }
};

/**
 * Get the text a menu item shows itself, leaving out its icon, label, dropdown, and counts.
 *
 * @param {HTMLElement} el The menu item.
 *
 * @return {string} The text.
 */
const getOwnText = (el) => {
  return [...el.childNodes]
    .filter((node) => !node.matches?.('.mhui-menu-icon, .mhui-menu-label, .dropdownContent, .arrow, .mousehuntHeaderView-menu-notification'))
    .map((node) => node.textContent)
    .join('')
    .trim();
};

/**
 * Get how a menu item can be shown, if it can be shown more than one way.
 *
 * Items need both an icon and a name to be shown as just one or the other, so this covers the
 * links we add and icons like Favorite Setups, but not text tabs like Inbox.
 *
 * @param {HTMLElement} el The menu item.
 * @param {string}      id The item id.
 *
 * @return {Object|null} The `iconUrl` to add, whether it `needsLabel`, and its `defaultStyle`, or null.
 */
const getStyleInfo = (el, id) => {
  if (lockedItems.has(id)) {
    return null;
  }

  const isLink = el.classList.contains('mhui-custom-menu-link');
  const iconUrl = isLink ? null : el.dataset.mhMenuIcon || null;
  const hasIcon = isLink || iconUrl || el.querySelector('.mhui-menu-item-icon') || 'none' !== getComputedStyle(el, '::before').backgroundImage;
  if (!hasIcon) {
    return null;
  }

  // Items with a label of their own, even an empty one that's filled in later, don't get one added.
  const needsLabel = !isLink && !el.querySelector('.mhui-menu-label') && !getOwnText(el);

  return {
    iconUrl,
    needsLabel,
    // Items we add an icon to, like the HUD toggle and Dashboard, start out the way they were, as text,
    // and so do pins, which go by their item's name.
    defaultStyle: iconUrl || el.dataset.mhMenuPin ? 'text' : 'icon',
  };
};

const styleClasses = ['mhui-menu-style-icon', 'mhui-menu-style-icon-text', 'mhui-menu-style-text'];

/**
 * Show each item the way it's been set to, adding the icon or label it needs.
 *
 * @param {HTMLElement} container The container.
 * @param {Object}      styles    The display styles, keyed by item id.
 */
const applyStyles = (container, styles) => {
  for (const { el, id } of getGroupItems(container)) {
    const info = getStyleInfo(el, id);
    if (!info) {
      continue;
    }

    if (info.iconUrl && !el.querySelector(':scope > .mhui-menu-icon')) {
      const icon = document.createElement('span');
      icon.className = 'mhui-menu-icon';
      icon.style.backgroundImage = `url(${info.iconUrl})`;
      el.prepend(icon);
    }

    if (!info.needsLabel) {
      wrapOwnText(el);
    }

    if (info.needsLabel && !el.querySelector(':scope > .mhui-menu-label')) {
      const label = document.createElement('span');
      label.className = 'mhui-menu-label';
      label.textContent = getItemName(el, id);
      el.append(label);
    }

    el.classList.remove(...styleClasses);
    el.classList.add('mhui-menu-style', `mhui-menu-style-${styles[id] || info.defaultStyle}`);
  }
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
  updateLinks(layout, left, right);
  moveItemsToSides(layout, left, right);
  applyOrder(left, layout.left);
  applyOrder(right, layout.right);
  applyStyles(left, layout.styles);
  applyStyles(right, layout.styles);

  // The SUPER|brie+ label is bare text, so it needs a span to be hidden.
  const superBrie = [...getGroupItems(left), ...getGroupItems(right)].find((item) => 'super-brie' === item.id);
  if (superBrie) {
    wrapOwnText(superBrie.el);
  }

  applyItemOptions([...getGroupItems(left), ...getGroupItems(right)], layout);
  updateEndItems(left);
};

export { applyLayout, getContainers, getDefaultOrder, getDefaultSide, getGroupItems, getItemName, getLayout, getStyleInfo, isNativeItem, lockedItems, saveLayout };
