/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'native-dark-mode.enable-mice-page-image-changes',
      title: 'Enhance images on the Mice page',
      default: true,
    },
    {
      id: 'native-dark-mode.tint-journal-entries',
      title: 'Tint journal entries',
      description: "Use darker shades of the game's event and location colors.",
      default: false,
      live: true,
      badge: 'Beta',
    },
  ];
};
