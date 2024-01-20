import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  addMhuiSetting(
    'better-inventory-one-item-per-row',
    'Show one item per row',
    true,
    'Makes each item full-width.',
    module
  );

  addMhuiSetting(
    'better-inventory-larger-images',
    'Show larger images',
    true,
    'Increases the size of item images for smaller items, such as baits or collectibles.',
    module
  );
}
