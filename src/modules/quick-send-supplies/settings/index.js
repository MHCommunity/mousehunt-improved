import getTradableItems from '../../../data/tradable-items';

export default function (subModule, module) {
  addSetting(
    'Quick Send Supplies Items',
    'quick-send-supplies-items',
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
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'better-mh-settings',
    {
      type: 'multi-select',
      number: 4,
      options: getTradableItems('type'),
    }
  );
}
