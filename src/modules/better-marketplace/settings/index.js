/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-marketplace.search-all',
      title: 'Default to showing all items in search',
      default: false,
    },
    {
      id: 'better-marketplace.small-images',
      title: 'Smaller images',
      default: false,
    },
    {
      id: 'better-marketplace.show-chart-images',
      title: 'Show charts on category pages',
      default: false,
    }
  ];
};
