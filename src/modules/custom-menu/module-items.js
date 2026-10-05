import { doEvent, getSetting, isLiveModule, isModuleEnabled, saveSetting } from '@utils';

// The module's own icon comes from its styles, which aren't there while it's off.
const privacyIcon = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#888"><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" /></svg>'
)}`;

/**
 * Make a module item for a link a module adds to the main menu, which can be added to the top menu.
 *
 * @param {Object}  opts               The link options.
 * @param {string}  opts.menu          The main menu it's in.
 * @param {string}  opts.key           The key `addSubmenuItem` gives it: its `id`, or its label made into one.
 * @param {string}  opts.name          The link's label.
 * @param {string}  opts.icon          The link's icon.
 * @param {string}  opts.module        The module that adds it.
 * @param {string}  opts.moduleName    The module's name.
 * @param {boolean} opts.moduleDefault Whether the module is on by default.
 * @param {boolean} opts.isPlain       Whether it's a plain link to a game page, listed with the game's links.
 *
 * @return {Object} The module item.
 */
const makeLinkItem = ({ menu, key, name, icon, module, moduleName, moduleDefault = false, isPlain = false }) => {
  const id = `hud-${menu}-custom-${key}`;

  return {
    id,
    name,
    icon,
    module,
    moduleDefault,
    defaultStyle: 'icon-text',
    isPlain,
    needs: `Needs ${moduleName} turned on.`,
    link: { id, menu, key, custom: true, label: name, icon },
  };
};

const mouseIcon = 'https://www.mousehuntgame.com/images/ui/hud/menu/mice.png';
const travelIcon = 'https://www.mousehuntgame.com/images/ui/hud/menu/travel.png';

/**
 * Links that modules add to the main menu.
 */
const linkItems = [
  { menu: 'camp', key: 'timers', name: 'Timers', icon: 'https://i.mouse.rip/icons/clock.png', module: 'timers', moduleName: 'Location Timers' },
  {
    menu: 'travel',
    key: 'mh-improved-travel-window',
    name: 'Travel Window',
    icon: 'https://i.mouse.rip/icons/tiles.png',
    module: 'better-travel',
    moduleName: 'Better Travel',
    moduleDefault: true,
  },
  {
    menu: 'mice',
    key: 'location-catch-stats',
    name: 'Location Catch Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png?',
    module: 'location-catch-stats',
    moduleName: 'Location Catch Stats',
    moduleDefault: true,
  },
  {
    menu: 'mice',
    key: 'skyport-star-tracker',
    name: 'Skyport Star Tracker',
    icon: 'https://www.mousehuntgame.com/images/ui/map/star_gold_320.png',
    module: 'skyport-star-tracker',
    moduleName: 'Skyport Star Tracker',
  },
  { menu: 'mice', key: 'groups', name: 'Groups', icon: mouseIcon, module: 'better-mice', moduleName: 'Better Mice', moduleDefault: true, isPlain: true },
  { menu: 'mice', key: 'regions', name: 'Regions', icon: travelIcon, module: 'better-mice', moduleName: 'Better Mice', moduleDefault: true, isPlain: true },
  { menu: 'mice', key: 'your-stats--groups-', name: 'Your Stats (Groups)', icon: mouseIcon, module: 'better-mice', moduleName: 'Better Mice', moduleDefault: true, isPlain: true },
  {
    menu: 'mice',
    key: 'your-stats--locations-',
    name: 'Your Stats (Locations)',
    icon: travelIcon,
    module: 'better-mice',
    moduleName: 'Better Mice',
    moduleDefault: true,
    isPlain: true,
  },
  {
    menu: 'mice',
    key: 'king-s-crowns',
    name: 'King’s Crowns',
    icon: 'https://www.mousehuntgame.com/images/ui/crowns/crown_silver.png',
    module: 'better-mice',
    moduleName: 'Better Mice',
    moduleDefault: true,
    isPlain: true,
  },
  {
    menu: 'kingdom',
    key: 'export-data',
    name: 'Export Data',
    icon: 'https://www.mousehuntgame.com/images/items/crafting_items/transparent_thumb/c6f39c2b522f114c788f5fb65e3ab8d7.png',
    module: 'data-exporters',
    moduleName: 'Data Export',
    moduleDefault: true,
  },
  {
    menu: 'kingdom',
    key: 'rank-up-forecaster',
    name: 'Rank-Up Forecaster',
    icon: 'https://i.mouse.rip/icons/up.png',
    module: 'rank-up-forecaster',
    moduleName: 'Rank-Up Forecaster',
  },
].map((item) => makeLinkItem(item));

/**
 * Menu items that other modules add, so they can be offered while those modules are off.
 *
 * Each item is only on the page while its `module` is on, along with its `setting` if it has one. Modules
 * that aren't live toggled need their `moduleDefault` if they're on by default. `defaultStyle` is how the item
 * is shown in the menu until it's changed.
 */
const moduleItems = [
  {
    id: 'mousehunt-improved-journal-privacy',
    name: 'Journal Privacy',
    icon: privacyIcon,
    module: 'journal-privacy',
    defaultStyle: 'icon',
    needs: 'Needs Journal Privacy turned on.',
  },
  {
    id: 'location-dashboard',
    name: 'Dashboard',
    icon: 'https://i.mouse.rip/icons/chart.png',
    module: 'location-dashboard',
    defaultStyle: 'text',
    moduleDefault: true,
    needs: 'Needs Location Dashboard turned on.',
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/scoreboard.png',
    module: 'hide-page-elements',
    defaultStyle: 'text',
    setting: { key: 'hide-page-elements.hide-sidebar', default: true },
    needs: 'Needs Hide Page Elements turned on, with the sidebar moved to the top menu.',
  },
  ...linkItems,
];

/**
 * Check whether an item's module, and its setting if it has one, are on.
 *
 * @param {Object} item The item.
 *
 * @return {boolean} Whether they're on.
 */
const isModuleItemOn = (item) => {
  const isModuleOn = isLiveModule(item.module) ? isModuleEnabled(item.module) : Boolean(getSetting(item.module, item.moduleDefault ?? false));

  return isModuleOn && (!item.setting || Boolean(getSetting(item.setting.key, item.setting.default)));
};

/**
 * Check whether an item is on the page, ready to use.
 *
 * @param {Object} item The item.
 *
 * @return {boolean} Whether it's on the page.
 */
const isOnPage = (item) => {
  // A link's tab in the top menu only works once the link it clicks is in the main menu.
  if (item.link) {
    return Boolean(document.querySelector(`#custom-submenu-item-${CSS.escape(item.link.key)}`));
  }

  return Boolean(document.querySelector(`.mousehuntHeaderView-gameTabs [data-mh-menu-id="${CSS.escape(item.id)}"]`));
};

/**
 * Get the module items that need something turned on before they can be added.
 *
 * @return {Array} The items.
 */
const getUnavailableModuleItems = () => moduleItems.filter((item) => !isModuleItemOn(item));

/**
 * Get the module items that have been turned on, but won't be on the page until it's refreshed.
 *
 * @return {Array} The items.
 */
const getPendingModuleItems = () => moduleItems.filter((item) => isModuleItemOn(item) && !isLiveModule(item.module) && !isOnPage(item));

/**
 * Turn on what an item needs.
 *
 * @param {Object} item The item.
 *
 * @return {boolean} Whether the page needs a refresh before the item shows up.
 */
const enableModuleItem = (item) => {
  for (const key of [item.module, item.setting?.key].filter(Boolean)) {
    saveSetting(key, true);

    // Live modules, and the settings they watch, apply this straight away.
    doEvent('mh-improved-settings-changed', { key, value: true, tab: 'mousehunt-improved-settings', type: 'toggle' });
  }

  return !isLiveModule(item.module);
};

/**
 * Links MH Improved adds to the main menu that are just links to game pages, so they're listed with the game's links.
 */
const plainLinkIds = new Set(moduleItems.filter((item) => item.isPlain).map((item) => item.id));

export { enableModuleItem, plainLinkIds, getPendingModuleItems, getUnavailableModuleItems, moduleItems };
