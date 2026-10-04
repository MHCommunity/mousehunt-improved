/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'hover-delays.menus',
      title: 'Delay menu dropdowns',
      default: true,
      live: true,
    },
    {
      id: 'hover-delays.tooltips',
      title: 'Delay tooltips',
      description: 'Hold Shift to show tooltips right away.',
      default: true,
      live: true,
    },
  ];
};
