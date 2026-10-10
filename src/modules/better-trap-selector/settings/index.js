/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-trap-selector.quick-filters-and-sort',
      title: 'Show quick filters and sort buttons',
      description: 'Filter by power type and sort by power, luck, and more in one click.',
      default: true,
    },
    {
      id: 'better-trap-selector.special-effects',
      title: 'Mark items with special effects',
      description: 'Add a dot to items with special effects, including ones that only work at your current location.',
      default: true,
    },
    {
      id: 'better-trap-selector.trap-gradient-background',
      title: 'Add a background gradient to your trap',
      default: false,
    },
    {
      id: 'better-trap-selector.real-base-stats',
      title: 'Show the real stats for variable bases',
      description: 'Prestige, Hailstone, Denture, and Printing Press bases.',
      default: true,
    },
    {
      id: 'better-trap-selector.base-item-counters',
      title: 'Show toothlet and printing paper counts',
      default: true,
    },
    {
      id: 'better-trap-selector.supply-runway',
      title: 'Show how long your cheese and charms will last',
      default: true,
    },
  ];
};
