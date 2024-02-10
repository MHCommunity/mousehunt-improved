import { getSetting } from '@utils';

import categories from '@data/ultimate-checkmark.json';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const options = [];

  // sort the categories by name
  categories.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    return 1;
  });

  categories.forEach((category) => {
    options.push({
      id: category.id,
      name: category.name,
      value: getSetting(`ultimate-checkmark-${category.id}`, true),
    });
  });

  return [{
    id: 'ultimate-checkmark-categories',
    title: 'Ultimate Checkmark',
    default: [],
    description: 'Adds more things collect on your Hunter profile.',
    settings: {
      type: 'multi-toggle',
      options,
    }
  }];
};
