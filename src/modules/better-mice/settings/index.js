/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-mice.show-attraction-rates',
      title: 'Show attraction rates',
      default: true,
    },
    {
      id: 'better-mice.show-mouse-hover',
      title: 'Show mice details on hover (in journal)',
    },
    {
      id: 'better-mice.show-sidebar',
      title: 'Show available mice in sidebar',
      default: true,
    }
  ];
};
