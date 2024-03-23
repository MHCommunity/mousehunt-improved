/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-maps.show-sidebar-goals',
      title: 'Show map goals in sidebar',
      default: true,
    },
  ];
};
