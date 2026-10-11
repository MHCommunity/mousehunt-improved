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
      title: 'Show smaller images',
      default: false,
    },
    {
      id: 'better-marketplace.trend-numbers',
      title: 'Show percentage next to price trend arrows',
      default: true,
    },
    {
      id: 'better-marketplace.price-history-chart',
      title: 'Show Markethunt price history charts',
      default: false,
      badge: 'Experimental',
    },
    {
      id: 'better-marketplace.show-chart-images',
      title: 'Show small price history charts when browsing categories',
      default: false,
    },
    {
      id: 'better-marketplace.quick-price-links',
      title: 'Add quick undercut/overbid price links',
      default: true,
    },
    {
      id: 'better-marketplace.quick-sell',
      title: 'Add Quick Sell',
      description: 'Sell an item at the best buy price right from its page, with a box for how many to sell.',
      default: false,
    },
  ];
};
