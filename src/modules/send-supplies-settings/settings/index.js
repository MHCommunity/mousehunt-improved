import { getSetting, getTradableItems, groupItemOptions } from '@utils';

import { defaultPinnedItems, getPinnedSupplyItems, pinnedItemsSetting } from '../pinned-items';

/**
 * Add the shared Send Supplies pinned-item editor.
 *
 * @return {Promise<Array>} The settings for both Send Supplies interfaces.
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
      id: pinnedItemsSetting,
      title: 'Pinned supply items',
      description: 'Used on the Send Supplies page and in Quick Send Supplies.',
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
