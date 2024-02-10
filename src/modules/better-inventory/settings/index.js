/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-inventory-one-item-per-row',
      title: 'Show one item per row',
      default: true,
      description: 'Makes each item full-width.',
    },
    {
      id: 'better-inventory-larger-images',
      title: 'Show larger images',
      default: true,
      description: '',
    }
  ];
};
