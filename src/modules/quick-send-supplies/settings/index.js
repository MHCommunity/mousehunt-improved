import { addMhuiSetting } from '@/utils';
import getTradableItems from '@data/tradable-items';

export default function (module) {
  addMhuiSetting(
    'quick-send-supplies-items',
    'Quick Send Supplies Items',
    [
      {
        name: 'SUPER|brie+',
        value: 'super_brie_cheese'
      },
      {
        name: 'Rare Map Dust',
        value: 'rare_map_dust_stat_item'
      },
      {
        name: 'Adorned Empyrean Jewel',
        value: 'floating_trap_upgrade_stat_item'
      },
      {
        name: 'Rift-torn Roots',
        value: 'rift_torn_roots_crafting_item'
      },
    ],
    'Items to make available in the Quick Send Supplies popup.',
    module,
    {
      type: 'multi-select',
      number: 4,
      options: getTradableItems('type'),
    }
  );
}
