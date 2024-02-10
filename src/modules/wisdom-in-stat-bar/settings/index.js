import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const refresh = await addMhuiSetting(
    'wisdom-in-stat-bar-auto-refresh',
    'Update automatically',
    true,
    '',
    module
  );

  return [refresh];
};
