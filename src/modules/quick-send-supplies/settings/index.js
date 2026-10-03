import { getTradableItems } from '@utils';

const defaultItems = [
  {
    name: 'SUPER|brie+',
    value: 'super_brie_cheese',
  },
  {
    name: 'Rare Map Dust',
    value: 'rare_map_dust_stat_item',
  },
  {
    name: 'Adorned Empyrean Jewel',
    value: 'floating_trap_upgrade_stat_item',
  },
  {
    name: 'Rift-torn Roots',
    value: 'rift_torn_roots_crafting_item',
  },
];

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
const getSettings = async () => {
  const tradableItems = await getTradableItems('type', { removeHidden: true });

  tradableItems.unshift({ name: 'None', value: 'none' }, { seperator: true });

  return [
    {
      id: 'quick-send-supplies.items',
      title: 'Items to show in the popup',
      default: defaultItems,
      settings: {
        type: 'multi-select',
        expandable: true,
        searchable: true,
        options: tradableItems,
      },
    },
  ];
};

export { defaultItems };
export default getSettings;
