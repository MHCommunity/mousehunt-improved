import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  return addMhuiSetting(
    'lgs-new-style',
    'New Style',
    false,
    'Use the \'new\' style for the LGS reminder',
    module
  );
}
