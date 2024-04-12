import { getTradableItems } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const tradableItems = await getTradableItems('type');

  tradableItems.unshift({ name: 'None', value: 'none' }, { seperator: true });

  return [{
    id: 'quick-send-supplies.items',
    title: 'Items shown in popup',
    default: [
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
    ],
    description: '',
    settings: {
      type: 'multi-select',
      number: 4,
      options: tradableItems,
    },
  }];
};
