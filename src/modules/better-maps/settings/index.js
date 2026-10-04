/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const sortedTabOptions = [
    { name: 'Never', value: 'never' },
    { name: 'For categorized maps', value: 'categorized' },
    { name: 'Always', value: 'always' },
  ];

  return [
    {
      id: 'better-maps.open-sorted-tab',
      title: 'Open Sorted tab',
      default: [sortedTabOptions[1]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: sortedTabOptions,
      },
    },
    {
      id: 'better-maps.show-sidebar-goals',
      title: 'Show map goals in sidebar',
      default: true,
    },
    {
      id: 'better-maps.catch-dates',
      title: 'Show map join and catch dates',
      description: 'Dates are approximate.',
      default: false,
    },
  ];
};
