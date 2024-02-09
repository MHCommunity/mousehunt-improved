import { addMhuiSetting, getTradableItems } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async function (module) {
  const setting = await addMhuiSetting(
    'send-supplies-pinned-items',
    'Pinned Items',
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
    module,
    {
      type: 'multi-select',
      number: 5,
      options: await getTradableItems('truncated_name'),
    }
  );

  return setting;
}
