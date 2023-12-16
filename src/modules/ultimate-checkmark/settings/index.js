import { addMhuiSetting, getSetting } from '@utils';

import categories from '@data/ultimate-checkmark.json';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
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

  addMhuiSetting(
    'ultimate-checkmark-categories',
    'Ultimate Checkmark',
    [],
    'Adds more things collect on the items view of your Hunter profile.',
    module,
    {
      type: 'multi-toggle',
      options,
    }
  );
}
