import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const onePerRow = await addMhuiSetting(
    'better-inventory-one-item-per-row',
    'Show one item per row',
    true,
    'Makes each item full-width.',
    module
  );

  const largerImages = await addMhuiSetting(
    'better-inventory-larger-images',
    'Show larger images',
    true,
    '',
    module
  );

  return [onePerRow, largerImages];
};
