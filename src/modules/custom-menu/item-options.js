import { getSetting, isModuleEnabled, saveSetting } from '@utils';

/**
 * Extra options for specific menu items.
 *
 * Options with a `setting` read and save that setting instead of the layout, for settings another
 * module already uses, and are only offered while that module is enabled.
 */
const itemOptions = {
  inbox: [{ key: 'count', label: 'Show unread count', default: true }],
  gifts: [
    { key: 'count', label: 'Show unread count', default: true },
    {
      key: 'selector',
      label: 'Open the gift selector instead of the gifts popup',
      setting: 'better-gifts.gift-button-opens-gift-selector',
      module: 'better-gifts',
      default: false,
    },
  ],
  'super-brie': [
    { key: 'name', label: 'Show “SUPER|brie+:”', default: true },
    { key: 'get-more', label: 'Show “Get More”', default: true },
  ],
  'quick-items-menu': [
    { key: 'item-name', label: 'Show the item’s name instead of “Quick Items”', default: false },
    { key: 'quantity', label: 'Show quantity instead of the name', default: true },
  ],
};

/**
 * Get the options offered for a menu item.
 *
 * @param {string} id The item id.
 *
 * @return {Array} The options.
 */
const getItemOptions = (id) => {
  return (itemOptions[id] || []).filter((option) => !option.module || isModuleEnabled(option.module));
};

/**
 * Get the value of an item's option.
 *
 * @param {Object} layout The layout.
 * @param {string} id     The item id.
 * @param {Object} option The option.
 *
 * @return {boolean} The value.
 */
const getOptionValue = (layout, id, option) => {
  if (option.setting) {
    return Boolean(getSetting(option.setting, option.default));
  }

  return layout.options?.[id]?.[option.key] ?? option.default;
};

/**
 * Set the value of an item's option.
 *
 * @param {Object}  layout The layout, which is updated in place.
 * @param {string}  id     The item id.
 * @param {Object}  option The option.
 * @param {boolean} value  The value.
 */
const setOptionValue = (layout, id, option, value) => {
  if (option.setting) {
    saveSetting(option.setting, value);
    return;
  }

  layout.options = { ...layout.options, [id]: { ...layout.options?.[id], [option.key]: value } };
};

/**
 * Mark each item with the options it has on and off, which the styles use to show or hide parts of it.
 *
 * @param {Array}  items  The items, each with `el` and `id`.
 * @param {Object} layout The layout.
 */
const applyItemOptions = (items, layout) => {
  for (const { el, id } of items) {
    for (const option of itemOptions[id] || []) {
      if (option.setting) {
        continue;
      }

      const value = getOptionValue(layout, id, option);
      el.classList.toggle(`mhui-menu-show-${option.key}`, value);
      el.classList.toggle(`mhui-menu-hide-${option.key}`, !value);
    }
  }
};

export { applyItemOptions, getItemOptions, getOptionValue, setOptionValue };
