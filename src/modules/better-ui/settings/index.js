/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-ui.hud-changes',
      title: 'Menu & HUD: Kingdom link goes to News, shows full title percent on hover, etc.',
      default: true,
    },
    {
      id: 'better-ui.profile-changes',
      title: 'Profile: Add Egg Master icon',
      default: true,
    }
  ];
};
