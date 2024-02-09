import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  return addMhuiSetting(
    'better-journal-styles',
    'Asterios Mode',
    true,
    'TODO: Add description.',
    module
  );
}
