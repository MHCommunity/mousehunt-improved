import { getSetting, getTradableItems, groupItemOptions } from '@utils';

import { defaultPinnedItems, getPinnedSupplyItems, pinnedItemsSetting } from '../pinned-items';

/**
 * Add settings for the module.
 *
 * @return {Promise<Array>} The settings for the module.
 */
const getSettings = async () => {
  // Migrate with the full catalog so hiding a Marketplace item doesn't discard an existing pin.
  const catalog = await getTradableItems('all');
  const pinnedItems = await getPinnedSupplyItems(catalog);
  const tradableItems = await getTradableItems('type', { removeHidden: true });
  const pinnedOptions = pinnedItems.map((value) => {
    const item = catalog.find((entry) => entry.type === value);
    return item ? { name: item.name, value, type: item.type, image: item.image } : (defaultPinnedItems.find((entry) => entry.value === value) ?? { name: value, value });
  });
  const defaults = null === getSetting(`${pinnedItemsSetting}-count`, null) ? pinnedOptions : defaultPinnedItems;
  // Preserve pins excluded from the catalog/picker, including unresolved legacy names during an outage.
  for (const item of pinnedOptions) {
    if (!tradableItems.some((option) => option.value === item.value)) {
      tradableItems.push(item);
    }
  }
  tradableItems.unshift({ name: 'None', value: 'none' }, { seperator: true });

  return [
    {
      id: 'better-send-supplies.quick-send',
      title: 'Quick send from Send Supplies buttons',
      description: 'Hover over or click a Send Supplies button to send your pinned items without leaving the page.',
      default: true,
    },
    {
      id: pinnedItemsSetting,
      title: 'Pinned items',
      description: 'Shown at the top of the Send Supplies page and in quick send.',
      default: defaults,
      settings: {
        type: 'multi-select',
        expandable: true,
        searchable: true,
        options: await groupItemOptions(tradableItems),
      },
    },
  ];
};

export default getSettings;
