import { addStylesDirect } from './styles';

import gameInfoBarStyles from './styles/game-info-bar.css';

/**
 * Add an item to the top 'Hunters Online' menu.
 *
 * @param {Object}   options          The options for the menu item.
 * @param {string}   options.label    The label for the menu item.
 * @param {string}   options.href     The href for the menu item.
 * @param {string}   options.class    The class for the menu item.
 * @param {Function} options.callback The callback for the menu item.
 * @param {boolean}  options.external Whether the link is external or not.
 */
const addItemToGameInfoBar = (options) => {
  const settings = Object.assign({}, {
    label: '',
    href: '',
    class: '',
    callback: null,
    external: false,
  }, options);

  const safeLabel = settings.label.replaceAll(/[^\da-z]/gi, '_').toLowerCase();
  const exists = document.querySelector(`#mh-custom-topmenu-${safeLabel}`);
  if (exists) {
    return;
  }

  addStylesDirect(gameInfoBarStyles, 'mh-improved-styles-game-info-bar', true);

  const menu = document.querySelector('.mousehuntHud-gameInfo');
  if (! menu) {
    return;
  }

  const item = document.createElement('a');
  item.id = `mh-custom-topmenu-${safeLabel}`;
  item.classList.add('mousehuntHud-gameInfo-item');
  item.classList.add('mousehuntHud-custom-menu-item');

  item.href = settings.href || '#';

  const name = document.createElement('div');
  name.classList.add('name');

  if (settings.label) {
    name.innerText = settings.label;
  }

  item.append(name);

  if (settings.class) {
    item.classList.add(settings.class);
  }

  if (settings.href) {
    item.href = settings.href;
  }

  if (settings.callback) {
    item.addEventListener('click', settings.callback);
  }

  if (settings.external) {
    const externalLinkIconWrapper = document.createElement('div');
    externalLinkIconWrapper.classList.add('mousehuntHud-menu');

    const externalLinkIcon = document.createElement('div');
    externalLinkIcon.classList.add('external_icon');

    externalLinkIconWrapper.append(externalLinkIcon);
    item.append(externalLinkIconWrapper);
  }

  menu.insertBefore(item, menu.firstChild);
};

const getCleanSubmenuLabel = (label) => {
  return label.toLowerCase().replaceAll(/[^\da-z]/g, '-');
};

/**
 * Add a submenu item to a menu.
 *
 * @param {Object}   options          The options for the submenu item.
 * @param {string}   options.menu     The menu to add the submenu item to.
 * @param {string}   options.label    The label for the submenu item.
 * @param {string}   options.icon     The icon for the submenu item.
 * @param {string}   options.href     The href for the submenu item.
 * @param {string}   options.class    The class for the submenu item.
 * @param {Function} options.callback The callback for the submenu item.
 * @param {boolean}  options.external Whether the submenu item is external or not.
 */
const addSubmenuItem = (options) => {
  // Default to sensible values.
  const settings = Object.assign({}, {
    id: null,
    menu: 'kingdom',
    label: '',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/special.png',
    href: '',
    class: '',
    callback: null,
    external: false,
  }, options);

  // Grab the menu item we want to add the submenu to.
  const menuTarget = document.querySelector(`.mousehuntHud-menu .${settings.menu}`);
  if (! menuTarget) {
    return;
  }

  // If the menu already has a submenu, just add the item to it.
  if (! menuTarget.classList.contains('hasChildren')) {
    menuTarget.classList.add('hasChildren');
  }

  let hasSubmenu = true;
  let submenu = menuTarget.querySelector('ul');
  if (! submenu) {
    hasSubmenu = false;
    submenu = document.createElement('ul');
  }

  // Create the item.
  const item = document.createElement('li');
  item.classList.add('custom-submenu-item');
  const label = settings.label.length > 0 ? settings.label : settings.id;
  const cleanLabel = getCleanSubmenuLabel(label);

  const exists = document.querySelector(`#custom-submenu-item-${cleanLabel}`);
  if (exists) {
    exists.remove();
  }

  item.id = settings.id ? `custom-submenu-item-${settings.id}` : `custom-submenu-item-${cleanLabel}`;

  if (settings.class) {
    const classes = settings.class.split(' ');
    item.classList.add(...classes);
  }

  // Create the link.
  const link = document.createElement('a');
  link.href = settings.href || '#';

  if (settings.callback) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      settings.callback();
    });
  }

  // Create the icon.
  const icon = document.createElement('div');
  icon.classList.add('icon');
  icon.style = `background-image: url(${settings.icon});`;

  // Create the label.
  const name = document.createElement('div');
  name.classList.add('name');
  name.innerHTML = settings.label;

  // Add the icon and label to the link.
  link.append(icon);
  link.append(name);

  // If it's an external link, also add the icon for it.
  if (settings.external) {
    const externalLinkIcon = document.createElement('div');
    externalLinkIcon.classList.add('external_icon');
    link.append(externalLinkIcon);

    // Set the target to _blank so it opens in a new tab.
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  // Add the link to the item.
  item.append(link);

  // Add the item to the submenu.
  submenu.append(item);

  if (! hasSubmenu) {
    menuTarget.append(submenu);
  }
};

const removeSubmenuItem = (id) => {
  id = getCleanSubmenuLabel(id);
  const item = document.querySelector(`#custom-submenu-item-${id}`);
  if (item) {
    item.remove();
  }
};

const addSubmenuDivider = (menu, className = '') => {
  addSubmenuItem({
    menu,
    id: `mh-improved-submenu-divider-${className}`,
    label: '',
    icon: '',
    href: '',
    class: `mh-improved-submenu-divider ${className}`,
  });
};

export {
  addItemToGameInfoBar,
  addSubmenuItem,
  addSubmenuDivider,
  removeSubmenuItem
};
