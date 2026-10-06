import { doEvent, getData, getSetting, saveSetting } from '@utils';

const pinsKey = 'quick-items-menu.pins';

// Message items, like Scrambles, can be pinned alongside convertibles.
const classifications = ['convertible', 'message_item'];

/**
 * Options for a pin's tab, alongside the icon and name choices every item has.
 */
const pinOptions = [{ key: 'quantity', label: 'Show quantity', default: false }];

/**
 * Get the pins, each with an `id` and the item types it has. One with more than one item is a group.
 *
 * @return {Array} The pins.
 */
const getPins = () => {
  const pins = getSetting(pinsKey, []);
  if (!Array.isArray(pins)) {
    return [];
  }

  return pins.filter((pin) => pin?.id).map((pin) => ({ id: pin.id, items: Array.isArray(pin.items) ? pin.items : [] }));
};

/**
 * Save the pins and let the menu know.
 *
 * It has its own event, since the settings page would otherwise ask for a refresh that isn't needed.
 *
 * @param {Array} pins The pins.
 */
const savePins = (pins) => {
  saveSetting(pinsKey, pins);
  doEvent('mh-improved-pins-changed', pins);
};

/**
 * Make an id for a new pin.
 *
 * @return {string} The id.
 */
const makePinId = () => `pinned-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Decode the HTML entities the inventory uses in item names (e.g. "&lt3 Gift Basket").
 *
 * @param {string} name The item name.
 *
 * @return {string} The decoded name.
 */
const decodeName = (name) => new DOMParser().parseFromString(name, 'text/html').documentElement.textContent;

/**
 * Get the convertibles and message items the user owns.
 *
 * @return {Promise<Array|null>} The owned items, or null if the inventory couldn't be loaded.
 */
const getOwnedItems = () => {
  return new Promise((resolve) => {
    try {
      hg.utils.UserInventory.getItemsByClass(classifications, true, resolve, () => resolve(null));
    } catch {
      resolve(null);
    }
  });
};

let pinnableItems = null;

/**
 * Get the items that can be pinned: the convertibles and message items the user owns, plus any that
 * are already pinned, sorted by name.
 *
 * @return {Promise<Array>} The items, each with a `type`, `name`, and `thumbnail`.
 */
const getPinnableItems = () => {
  pinnableItems ||= Promise.all([getOwnedItems(), getData('items')]).then(([owned, allItems]) => {
    const all = (Array.isArray(allItems) ? allItems : [])
      .filter((item) => classifications.includes(item.classification))
      .map((item) => ({ type: item.type, name: item.name, thumbnail: item.images?.thumbnail }));

    // Fall back to every convertible if the inventory request fails.
    if (!Array.isArray(owned)) {
      return all.sort((a, b) => a.name.localeCompare(b.name));
    }

    const items = owned.filter((item) => Number(item.quantity) > 0).map((item) => ({ type: item.type, name: decodeName(item.name), thumbnail: item.thumbnail }));

    // Keep pinned items pickable after they're used up.
    for (const type of new Set(getPins().flatMap((pin) => pin.items))) {
      const item = items.some((i) => i.type === type) ? null : all.find((i) => i.type === type);
      if (item) {
        items.push(item);
      }
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  });

  // Try again next time if it failed.
  pinnableItems.catch(() => {
    pinnableItems = null;
  });

  return pinnableItems;
};

export { getPinnableItems, getPins, makePinId, pinOptions, savePins };
