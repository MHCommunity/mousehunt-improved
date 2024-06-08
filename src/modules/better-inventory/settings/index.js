/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-inventory.one-item-per-row',
      title: 'Show one item per row',
      default: true,
    },
    {
      id: 'better-inventory.larger-images',
      title: 'Show larger images',
      default: true,
    },
    {
      id: 'better-inventory.sort-inventory',
      title: 'Sort inventory alphabetically',
      default: true,
    },
  ];
};
