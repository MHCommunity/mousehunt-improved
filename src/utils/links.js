import { makeElement } from './elements';

/**
 * Add an item to the top 'Hunters Online' menu.
 *
 * @param {Object}   options            The options for the menu item.
 * @param {string}   [options.label]    The label for the menu item.
 * @param {string}   [options.href]     The href for the menu item.
 * @param {string}   [options.class]    The class for the menu item.
 * @param {Function} [options.callback] The callback for the menu item.
 * @param {boolean}  [options.external] Whether the link is external or not.
 */
const addItemToGameInfoBar = (options) => {
  const settings = Object.assign({}, {
    label: '',
    href: '',
    class: '',
    callback: null,
    external: false,
    title: '',
  }, options);

  const safeLabel = settings.label.replaceAll(/[^\da-z]/gi, '_').toLowerCase();
  const exists = document.querySelector(`#mh-custom-topmenu-${safeLabel}`);
  if (exists) {
    return;
  }

  const menu = document.querySelector('.mousehuntHud-gameInfo');
  if (! menu) {
    return;
  }

  const item = makeElement('a', ['mousehuntHud-gameInfo-item', 'mousehuntHud-custom-menu-item']);
  item.id = `mh-custom-topmenu-${safeLabel}`;
  item.title = settings.title || settings.label;

  item.href = settings.href || '#';

  makeElement('div', 'name', settings.label ?? '', item);

  if (settings.class) {
    item.classList.add(settings.class);
  }

  if (settings.callback) {
    item.addEventListener('click', settings.callback);
  }

  if (settings.external) {
    const externalLinkIconWrapper = makeElement('div', 'mousehuntHud-menu');
    makeElement('div', 'external_icon', '', externalLinkIconWrapper);

    item.append(externalLinkIconWrapper);
  }

  menu.insertBefore(item, menu.firstChild);
};

/**
 * Sanitize a label for a submenu item.
 *
 * @param {string} label The label to sanitize.
 *
 * @return {string} The sanitized label.
 */
const getCleanSubmenuLabel = (label) => {
  return label.toLowerCase().replaceAll(/[^\da-z]/g, '-');
};

/**
 * Add a submenu item to a menu.
 *
 * Custom icons are available via https://i.mouse.rip/icons/{icon}.png:
 * airplane, atom, back, bolt, bookmark, book, briefcase, calendar, card,
 * chart, clock, cloud, compass, deal, diamond, down, envelope, file, film,
 * flag, folder, game, gift, help, hourglass, left, light-bulb, list, lock,
 * moon, music, page, paint, phone, puzzle, return, right, sun, tablet, tag,
 * target, ticket, tiles4, tiles, todo, trash, tv, up.
 *
 * @param {Object}   options            The options for the submenu item.
 * @param {string}   [options.menu]     The menu to add the submenu item to.
 * @param {string}   [options.label]    The label for the submenu item.
 * @param {string}   [options.icon]     The icon for the submenu item.
 * @param {string}   [options.href]     The href for the submenu item.
 * @param {string}   [options.class]    The class for the submenu item.
 * @param {Function} [options.callback] The callback for the submenu item.
 * @param {boolean}  [options.external] Whether the submenu item is external or not.
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
  const item = makeElement('li', 'custom-submenu-item');
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
  const icon = makeElement('div', 'icon');
  icon.style = `background-image: url(${settings.icon});`;
  link.append(icon);

  // Create the label.
  makeElement('div', 'name', settings.label, link);

  // If it's an external link, also add the icon for it.
  if (settings.external) {
    makeElement('div', 'external_icon', '', link);

    // Set the target to _blank so it opens in a new tab.
    link.target = '_blank';
    link.rel = 'noreferrer';
  }

  // Add the link to the item.
  item.append(link);

  // Add the item to the submenu.
  submenu.append(item);

  if (! hasSubmenu) {
    menuTarget.append(submenu);
  }
};

/**
 * Remove a submenu item from a menu.
 *
 * @param {string} id The id of the submenu item to remove.
 */
const removeSubmenuItem = (id) => {
  const item = document.querySelector(`#custom-submenu-item-${getCleanSubmenuLabel(id)}`);
  if (item) {
    item.remove();
  }
};

/**
 * Add a divider to a submenu.
 *
 * @param {string} menu        The menu to add the divider to.
 * @param {string} [className] The class for the divider.
 */
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

/**
 * Add the icon to the menu.
 *
 * @param {Object}   opts             The options for the menu item.
 * @param {string}   [opts.id]        The id for the menu item.
 * @param {string}   [opts.classname] The class for the menu item.
 * @param {string}   [opts.href]      The href for the menu item.
 * @param {string}   [opts.title]     The title for the menu item.
 * @param {string}   [opts.text]      The text for the menu item.
 * @param {Function} [opts.action]    The action for the menu item.
 * @param {string}   [opts.position]  The position for the menu item.
 */
const addIconToMenu = (opts) => {
  const menu = document.querySelector('.mousehuntHeaderView-gameTabs .mousehuntHeaderView-dropdownContainer');
  if (! menu) {
    return;
  }

  const defaults = {
    id: '',
    classname: '',
    href: false,
    title: '',
    text: '',
    action: null,
    position: 'prepend',
  };

  const settings = Object.assign({}, defaults, opts);

  if (! settings.classname) {
    settings.classname = settings.id;
  }

  const icon = makeElement('a', ['menuItem', settings.classname], settings.text);
  icon.id = settings.id;
  if (settings.href) {
    icon.href = settings.href;
    icon.title = settings.title;
  }

  if (settings.action) {
    icon.addEventListener('click', (e) => {
      settings.action(e, icon);
    });
  }

  if (settings.id) {
    const exists = document.querySelector(`#${settings.id}`);
    if (exists) {
      exists.replaceWith(icon);
      return;
    }
  }

  if ('prepend' === settings.position) {
    menu.prepend(icon);
  } else if ('append' === settings.position) {
    menu.append(icon);
  }
};

/**
 * Remove an icon from the menu.
 *
 * @param {string} id The id of the icon to remove.
 */
const removeIconFromMenu = (id) => {
  const icon = document.querySelector(`#${id}`);
  if (icon) {
    icon.remove();
  }
};

/**
 * Replace an icon in the menu.
 *
 * @param {string} id   The id of the icon to replace.
 * @param {Object} opts The options for the menu item. See addIconToMenu for details.
 */
const replaceIconInMenu = (id, opts) => {
  removeIconFromMenu(id);
  addIconToMenu(opts);
};

/**
 * Get the link to the extension.
 *
 * @return {string} The link to the extension.
 */
const getExtensionLink = () => {
  if ('chrome' === mhImprovedPlatform) {
    return 'https://chromewebstore.google.com/detail/mousehunt-improved/fgjkidgknmkhnbeobehlfabjbignhkhm';
  }

  if ('firefox' === mhImprovedPlatform) {
    return 'https://addons.mozilla.org/en-US/firefox/addon/mousehunt-improved/';
  }

  if ('userscript' === mhImprovedPlatform) {
    return 'https://greasyfork.org/en/scripts/465139-mousehunt-improved';
  }

  return github;
};

/**
 * Get the text for the extension link.
 *
 * @return {string} The text for the extension link.
 */
const getExtensionLinkText = () => {
  if ('chrome' === mhImprovedPlatform) {
    return 'View on Chrome Web Store';
  }

  if ('firefox' === mhImprovedPlatform) {
    return 'View on Firefox Add-ons';
  }

  if ('userscript' === mhImprovedPlatform) {
    return 'View on Greasy Fork';
  }

  return 'View on GitHub';
};

export {
  addItemToGameInfoBar,
  addSubmenuItem,
  addSubmenuDivider,
  removeSubmenuItem,
  addIconToMenu,
  removeIconFromMenu,
  replaceIconInMenu,
  getExtensionLink,
  getExtensionLinkText
};
