import { getTradableItems } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const tradableItems = await getTradableItems('truncated_name');

  tradableItems.unshift({ name: 'None', value: 'none' }, { seperator: true });

  return [{
    id: 'better-send-supplies.pinned-items',
    title: 'Pinned items',
    default: [
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
    description: 'Items to pin at the top of the send supplies page.',
    settings: {
      type: 'multi-select',
      number: 5,
      options: tradableItems,
    },
  }];
};
