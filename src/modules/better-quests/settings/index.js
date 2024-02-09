import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  return addMhuiSetting(
    'better-quests-m400-helper',
    'M400 Helper',
    true,
    'Adds a "Travel to next step" button to the M400 quest.',
    module
  );
}
