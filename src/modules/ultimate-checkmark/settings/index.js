import { getSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const options = [];

  const categories = [
    { id: 'airships', name: 'Airships' },
    { id: 'codex', name: 'Codex' },
    { id: 'currency', name: 'Currency' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'plankrun', name: 'Plankrun Pages' },
    { id: 'treasure_chests', name: 'Treasure Chests' },
  ];

  categories.forEach((category) => {
    options.push({
      id: category.id,
      name: category.name,
      value: getSetting(`ultimate-checkmark.show-${category.id}`, true),
    });
  });

  return [
    {
      id: 'ultimate-checkmark.show',
      title: 'Ultimate Checkmark',
      default: [],
      description: 'Add more items to collect on your Hunter profile.',
      settings: {
        type: 'multi-toggle',
        options,
      },
    },
  ];
};
