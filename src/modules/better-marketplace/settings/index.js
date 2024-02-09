import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  return addMhuiSetting(
    'better-marketplace-search-all',
    'Show all items in search',
    false,
    'If disabled, then useless items will be hidden from the search dropdown by default.',
    module
  );
}
