import { getTradableItems } from '@utils';

const defaultPinnedItems = [
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
];

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
const getSettings = async () => {
  const tradableItems = await getTradableItems('truncated_name', { removeHidden: true });

  tradableItems.unshift({ name: 'None', value: 'none' }, { seperator: true });

  return [
    {
      id: 'better-send-supplies.pinned-items',
      title: 'Pinned items',
      default: defaultPinnedItems,
      description: '',
      settings: {
        type: 'multi-select',
        expandable: true,
        searchable: true,
        options: tradableItems,
      },
    },
  ];
};

export { defaultPinnedItems };
export default getSettings;
