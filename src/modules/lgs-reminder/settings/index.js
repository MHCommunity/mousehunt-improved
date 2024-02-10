import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const newStyle = await addMhuiSetting(
    'lgs-new-style',
    'Use "new" style',
    false,
    '',
    module
  );

  return [newStyle];
}
