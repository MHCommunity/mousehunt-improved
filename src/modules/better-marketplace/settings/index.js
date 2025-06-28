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
      id: 'better-marketplace.filter-listings',
      title: 'Add filter to listings',
      default: true,
    },
    {
      id: 'better-marketplace.trend-numbers',
      title: 'Show price change percentages next to trend icons',
      default: true,
    }
  ];
};
