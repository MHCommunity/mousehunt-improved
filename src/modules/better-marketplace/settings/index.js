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
      id: 'better-marketplace.trend-numbers',
      title: 'Show percentage next to price trend arrows',
      default: true,
    },
    {
      id: 'better-marketplace.filter-listings',
      title: 'Add filter to listings',
      default: true,
    },
    {
      id: 'better-marketplace.show-chart-images',
      title: 'Show price history charts on category pages',
      default: false,
    },
    {
      id: 'better-marketplace.value-column',
      title: 'Show estimated value column when browsing',
      default: true,
    },
    {
      id: 'better-marketplace.skin-trap-filter',
      title: 'Add a "Filter by trap" dropdown to the Skins category',
      default: true,
    },
    {
      id: 'better-marketplace.quick-price-links',
      title: 'Add quick undercut/overbid price links',
      default: true,
    },
    {
      id: 'better-marketplace.quick-quantity-buttons',
      title: 'Add quick quantity buttons (1, 10, 100, 10%, All But One, All) to the order form',
      default: true,
    },
    {
      id: 'better-marketplace.highlight-last-viewed',
      title: 'Highlight and scroll to the last item you viewed',
      default: true,
    },
    {
      id: 'better-marketplace.quick-sell',
      title: 'Quick sell',
      default: false,
    }
  ];
};
