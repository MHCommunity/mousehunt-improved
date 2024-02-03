import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  addMhuiSetting(
    'wisdom-refresh',
    'Update automatically',
    true,
    'If enabled, wisdom will be automatically updated when it changes. Otherwise, you\'ll need to click the value to refresh it.',
    module
  );
}
