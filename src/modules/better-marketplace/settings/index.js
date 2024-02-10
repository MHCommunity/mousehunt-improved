import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const showall = await addMhuiSetting(
    'better-marketplace-search-all',
    'Default to show all items in search',
    false,
    '',
    module
  );

  return [showall];
};
