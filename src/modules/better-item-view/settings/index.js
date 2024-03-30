/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-item-view.show-drop-rates',
      title: 'Show drop rates',
      default: true,
    },
    {
      id: 'better-item-view.show-item-hover',
      title: 'Show item details on hover (in journal)',
      default: true,
    },
  ];
};
