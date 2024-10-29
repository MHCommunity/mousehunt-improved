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
      id: 'better-maps.community',
      title: 'Show Community Maps information',
      description: 'Hide old and inactive maps from the community maps list.',
      default: false,
    }
  ];
};
