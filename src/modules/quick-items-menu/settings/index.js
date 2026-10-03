import { getData, getMultiSelectSetting } from '@utils';

const defaultItemType = 'kilohertz_processor_convertible';

// Message items, like Scrambles, can be pinned alongside convertibles.
const classifications = ['convertible', 'message_item'];

/**
 * Get the convertibles and message items the user owns.
 *
 * @return {Promise<Array|null>} The owned items, or null if the inventory couldn't be loaded.
 */
const getOwnedConvertibles = () => {
  return new Promise((resolve) => {
    try {
      hg.utils.UserInventory.getItemsByClass(classifications, true, resolve, () => resolve(null));
    } catch {
      resolve(null);
    }
  });
};

/**
 * Decode the HTML entities the inventory uses in item names (e.g. "&lt3 Gift Basket").
 *
 * @param {string} name The item name.
 *
 * @return {string} The decoded name.
 */
const decodeName = (name) => new DOMParser().parseFromString(name, 'text/html').documentElement.textContent;

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
const getSettings = async () => {
  const defaultItem = {
    name: 'Kilohertz Processor',
    value: defaultItemType,
  };

  const pinnedTypes = getMultiSelectSetting('quick-items-menu.item', [defaultItemType]);
  const [ownedItems, allItems] = await Promise.all([getOwnedConvertibles(), getData('items')]);

  const allConvertibles = (Array.isArray(allItems) ? allItems : [])
    .filter((item) => classifications.includes(item.classification))
    .map((item) => ({ name: item.name, value: item.type, image: item.images?.thumbnail }));

  let convertibles;
  if (Array.isArray(ownedItems)) {
    convertibles = ownedItems.filter((item) => Number(item.quantity) > 0).map((item) => ({ name: decodeName(item.name), value: item.type, image: item.thumbnail }));

    // Always offer the default, and keep pinned items selectable after they're used up.
    new Set([defaultItemType, ...pinnedTypes]).forEach((type) => {
      if (!type || 'none' === type || convertibles.some((item) => item.value === type)) {
        return;
      }

      const item = allConvertibles.find((convertible) => convertible.value === type) || (type === defaultItem.value ? defaultItem : null);
      if (item) {
        convertibles.push(item);
      }
    });
  } else {
    // Fall back to every convertible if the inventory request fails.
    convertibles = allConvertibles;
  }

  convertibles.sort((a, b) => a.name.localeCompare(b.name));
  convertibles.unshift({ name: 'None', value: 'none' });

  return [
    {
      id: 'quick-items-menu.item',
      title: 'Pinned items',
      live: true,
      default: [defaultItem],
      settings: {
        type: 'multi-select',
        expandable: true,
        searchable: true,
        options: convertibles,
      },
    },
  ];
};

export { defaultItemType };
export default getSettings;
