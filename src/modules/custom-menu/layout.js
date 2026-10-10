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
  { id: 'hunters-online', name: 'Hunters Online', selector: '[data-mh-menu-id="hunters-online"]', side: 'info' },
  { id: 'friends-online', name: 'Friends Online', selector: '[data-mh-menu-id="friends-online"]', side: 'info' },
];

/**
 * The sides an item can be on: the two sides of the menu, and the info bar under it.
 */
const sides = ['left', 'right', 'info'];

/**
 * The game's items in the info bar, which have no classes of their own, so they're found by what they are.
 */
const infoItems = [
  { id: 'hunters-online', match: (el) => 'SPAN' === el.tagName && el.textContent.includes('Hunters Online') },
  { id: 'friends-online', match: (el) => el.matches('a[href*="friends.php"]') },
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
 * Get the groups of menu items: the tabs on the left, the dropdown container on the right, and the
 * info bar with Hunters Online.
 *
 * @return {Object} The left, right, and info containers, any of which may be null.
 */
const getContainers = () => {
  const left = document.querySelector('.mousehuntHeaderView-gameTabs');

  return {
    left,
    right: left?.querySelector(':scope > .mousehuntHeaderView-dropdownContainer') || null,
    info: document.querySelector('.mousehuntHud-gameInfo'),
  };
};

/**
 * Mark the game's items in the info bar, so they can be moved like menu items.
 *
 * The game only fills them in when the page loads, but if it ever adds them again, the new ones
 * replace the ones that were moved.
 *
 * @param {HTMLElement} info The info bar.
 *
 * @return {boolean} Whether any were marked.
 */
const markInfoItems = (info) => {
  let isMarked = false;

  for (const el of info.querySelectorAll(':scope > :not([data-mh-menu-id])')) {
    const infoItem = infoItems.find((item) => item.match(el));
    if (!infoItem) {
      continue;
    }

    const old = document.querySelector(`.menuItem[data-mh-menu-id="${infoItem.id}"]`);
    el.dataset.mhMenuId = infoItem.id;
    el.classList.add('menuItem', ...(old ? [...old.classList] : []));
    old?.remove();
    isMarked = true;
  }

  return isMarked;
};

/**
 * Check whether an item can go in the info bar, which only has room for links, not dropdowns or
 * items with unread counts, like Inbox and Gifts.
 *
 * @param {HTMLElement} el The menu item.
 *
 * @return {boolean} Whether it can.
 */
const canBeInInfo = (el) => !el.matches('.inbox, .freeGifts') && !el.querySelector('.dropdownContent');

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

  // The MH Improved icon is put in the info bar while the menu is hidden, like in the tutorial, but it isn't one of its items.
  const isInfo = container.classList.contains('mousehuntHud-gameInfo');

  return [...container.querySelectorAll(':scope > .menuItem')].map((el) => ({ el, id: getItemId(el) })).filter((item) => item.id && !(isInfo && lockedItems.has(item.id)));
};

/**
 * Get the saved layout, falling back to the defaults.
 *
 * @return {Object} The layout, with `left`, `right`, and `info` orders, the `hidden` ids, the added `links`,
 *                  the display `styles` for each item, and each item's other `options`.
 */
const getLayout = () => {
  const saved = getSetting(settingKey, null);

  return {
    left: Array.isArray(saved?.left) ? saved.left : [],
    right: Array.isArray(saved?.right) ? saved.right : [],
    info: Array.isArray(saved?.info) ? saved.info : [],
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

  return `:is(.mousehuntHeaderView-gameTabs, .mousehuntHud-gameInfo) .menuItem${native ? native.selector : `[data-mh-menu-id="${CSS.escape(id)}"]`}`;
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
 * Put an item at the end of a container, before the MH Improved icon on the right.
 *
 * @param {HTMLElement} container The container.
 * @param {HTMLElement} el        The item.
 */
const addToContainer = (container, el) => {
  container.insertBefore(el, container.querySelector(':scope > #mousehunt-improved-icon-menu'));
};

/**
 * Get the side an item has been put on.
 *
 * @param {Object} layout The layout.
 * @param {string} id     The item id.
 *
 * @return {string|null} The side, or null if it hasn't been put anywhere.
 */
const getSavedSide = (layout, id) => sides.find((side) => layout[side].includes(id)) || null;

/**
 * Add the links that have been added to the menu, put them on the right side, and remove the
 * ones that have been taken out.
 *
 * @param {Object} layout     The layout.
 * @param {Object} containers The containers.
 */
const updateLinks = (layout, containers) => {
  const linkIds = new Set(layout.links.map((link) => link.id));
  const linkEls = sides.flatMap((side) => (containers[side] ? [...containers[side].querySelectorAll(':scope > .mhui-custom-menu-link')] : []));

  linkEls.forEach((el) => {
    if (!linkIds.has(el.dataset.mhMenuId)) {
      el.remove();
    }
  });

  for (const link of layout.links) {
    const container = containers[getSavedSide(layout, link.id) || 'right'];
    if (!container) {
      continue;
    }

    const el = linkEls.find((linkEl) => linkEl.dataset.mhMenuId === link.id) || makeLinkElement(link);
    if (el.parentElement !== container) {
      addToContainer(container, el);
    }
  }
};

/**
 * Move items that have been put on another side, or in the info bar, into that side's container.
 *
 * @param {Object} layout     The layout.
 * @param {Object} containers The containers.
 */
const moveItemsToSides = (layout, containers) => {
  for (const side of sides) {
    for (const { el, id } of getGroupItems(containers[side])) {
      const target = getSavedSide(layout, id);
      if (!target || target === side || !containers[target] || lockedItems.has(id) || ('info' === target && !canBeInInfo(el))) {
        continue;
      }

      addToContainer(containers[target], el);
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
    // Items we add an icon to, like the HUD toggle and Dashboard, start out with their icon and name,
    // and pins, which go by their item's name, start out as text.
    defaultStyle: el.dataset.mhMenuPin ? 'text' : iconUrl ? 'icon-text' : 'icon',
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
  const containers = getContainers();
  const { left, info } = containers;
  if (!left) {
    return;
  }

  if (info) {
    markInfoItems(info);
  }

  updateHiddenStyles(layout.hidden);
  updateLinks(layout, containers);
  moveItemsToSides(layout, containers);

  for (const side of sides) {
    applyOrder(containers[side], layout[side]);
    applyStyles(containers[side], layout.styles);
  }

  const allItems = sides.flatMap((side) => getGroupItems(containers[side]));

  // Items in the info bar are shown as links rather than tabs.
  for (const { el } of allItems) {
    el.classList.toggle('mhui-menu-info-item', el.parentElement === info);
  }

  // The SUPER|brie+ label is bare text, so it needs a span to be hidden.
  const superBrie = allItems.find((item) => 'super-brie' === item.id);
  if (superBrie) {
    wrapOwnText(superBrie.el);
  }

  applyItemOptions(allItems, layout);
  updateEndItems(left);

  // With everything taken out of the info bar, its background goes too.
  info?.classList.toggle('mhui-menu-info-empty', ![...info.children].some((el) => 'none' !== getComputedStyle(el).display));
};

export {
  applyLayout,
  canBeInInfo,
  getContainers,
  getDefaultOrder,
  getDefaultSide,
  getGroupItems,
  getItemName,
  getLayout,
  getStyleInfo,
  isNativeItem,
  lockedItems,
  markInfoItems,
  saveLayout,
  sides,
};
