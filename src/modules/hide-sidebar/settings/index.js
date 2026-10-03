/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'no-sidebar.show-dropdown',
      live: true,
      title: 'Show Sidebar dropdown in header menu',
      default: true,
    },
  ];
};
