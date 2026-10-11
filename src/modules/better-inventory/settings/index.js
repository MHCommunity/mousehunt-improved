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
      id: 'better-inventory.favorites',
      title: 'Add Favorites tab',
      description:
        'Star items in your inventory to collect them in one tab. Starred weapons, bases, and charms also show as trap selector favorites, so you can have more than five of each.',
      default: false,
      badge: 'Beta',
    },
    {
      id: 'better-inventory.add-trap-sorting',
      title: 'Show sorting and filtering controls',
      default: false,
      badge: 'Beta',
    },
  ];
};
