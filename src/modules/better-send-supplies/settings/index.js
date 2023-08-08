import getTradableItems from '../../../tradable-items';

export default function (subModule, module) {
  addSetting(
    'Send Supplies Pinned Items',
    'send-supplies-pinned-items',
    [
      {
        name: 'SUPER|brie+',
        value: 'SUPER|brie+',
      },
      {
        name: 'Empowered SUPER|brie+',
        value: 'Empowered SUPER|b...',
      },
      {
        name: 'Rift Cherries',
        value: 'Rift Cherries',
      },
      {
        name: 'Rift-torn Roots',
        value: 'Rift-torn Roots',
      },
      {
        name: 'Sap-filled Thorns',
        value: 'Sap-filled Thorns',
      },
    ],
    'Items to pin at the top of the send supplies page.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'better-mh-settings',
    {
      type: 'multi-select',
      number: 5,
      options: getTradableItems('truncated_name'),
    }
  );
}
