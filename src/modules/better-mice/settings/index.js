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
      title: 'Show mouse details when hovering in the journal',
      default: true,
    },
    {
      id: 'better-mice.show-sidebar',
      title: 'Show available mice in sidebar',
      default: true,
    },
    {
      id: 'better-mice.show-crown-summary',
      title: "Show crown summary on King's Crowns",
      default: true,
    },
    {
      id: 'better-mice.show-crown-power-type-summary',
      title: "Show silver crowns by power type on King's Crowns",
      default: true,
    },
    {
      id: 'better-mice.show-crown-power-types',
      title: "Show power type icons on King's Crowns mice",
      default: true,
    },
  ];
};
