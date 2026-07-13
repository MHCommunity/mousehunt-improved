import { getData } from '@utils';

let namesByType = new Map();
let typesById = new Map();

/**
 * Load the item data used to resolve types and names.
 *
 * The surfaces that only give us an item ID need a type to look up, and the acronym fallback needs
 * a name, so both lookups are built once up front.
 */
const initItems = async () => {
  const items = await getData('items');
  if (! items) {
    return;
  }

  namesByType = new Map(items.map((item) => [item.type, item.name]));
  typesById = new Map(items.map((item) => [item.id, item.type]));
};

/**
 * Get an item's name from its type.
 *
 * @param {string} type The item type.
 *
 * @return {string} The item name, or an empty string if the type isn't known.
 */
const getItemName = (type) => {
  return namesByType.get(type) || '';
};

/**
 * Get an item's type from its ID.
 *
 * @param {number|string} id The item ID.
 *
 * @return {string} The item type, or an empty string if the ID isn't known.
 */
const getItemType = (id) => {
  return typesById.get(Number.parseInt(id, 10)) || '';
};

export {
  getItemName,
  getItemType,
  initItems
};
