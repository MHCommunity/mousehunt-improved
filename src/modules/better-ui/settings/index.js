/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-ui.styles',
      title: 'Styles: Apply general UI improvements and fixes',
      default: true,
    },
    {
      id: 'better-ui.hud-changes',
      title: 'Apply menu and HUD tweaks',
      default: true,
    },
    {
      id: 'better-ui.profile-changes',
      title: 'Profile: Add Egg Master icon',
      default: true,
    },
    {
      id: 'better-ui.replace-favicon',
      title: 'Use the MouseHunt Improved favicon',
      default: true,
    },
    {
      id: 'better-ui.square-profile-pics',
      title: 'Use square profile pictures',
      default: false,
    },
  ];
};
