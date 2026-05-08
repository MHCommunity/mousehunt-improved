/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-maps.default-to-sorted',
      title: 'Default to Sorted tab',
    },
    {
      id: 'better-maps.show-sidebar-goals',
      title: 'Show map goals in sidebar',
    },
    {
      id: 'better-maps.show-map-solver-links',
      title: 'Show map solver links',
      default: true,
    },
    {
      id: 'better-maps.catch-dates',
      name: 'Show map join & catch dates',
      description: 'Shows the approximate date you started/joined a map and when each mouse was caught.',
    },
    {
      id: 'better-maps.community',
      title: 'Hide old & inactive Community Maps',
      default: true,
    },
  ];
};
