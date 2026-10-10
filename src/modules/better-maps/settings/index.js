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
    {
      id: 'better-maps.send-to-maptain',
      title: 'Show SUPER|brie+ sender for the Maptain',
      default: true,
    },
    {
      id: 'better-maps.plan-tab',
      title: 'Add Plan tab',
      description: 'Ranks locations, stages, and cheeses by how many of the remaining map mice they attract, and suggests a route.',
      default: false,
      badge: 'Beta',
    },
    {
      id: 'better-maps.draggable-highlight',
      title: 'Allow dragging the highlight',
      default: false,
      badge: 'Beta',
    },
  ];
};
