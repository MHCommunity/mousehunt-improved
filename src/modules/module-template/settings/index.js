import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  addMhuiSetting(
    'example-setting',
    'Example Setting',
    true,
    'This is an example setting.',
    module
  );
}
