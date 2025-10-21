/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-ui.styles',
      title: 'Styles: Various UI improvements and fixes',
      default: true,
    },
    {
      id: 'better-ui.hud-changes',
      title: 'Menu & HUD: Kingdom link goes to News, shows full title percent on hover, etc.',
      default: true,
    },
    {
      id: 'better-ui.profile-changes',
      title: 'Profile: Add Egg Master icon',
      default: true,
    },
    {
      id: 'better-ui.larger-skin-images',
      title: 'Larger Skin Images: Show larger skin images in the trap selector',
      default: true,
    },
    {
      id: 'better-ui.show-unowned-skins',
      title: 'Show Unowned Skins: Show unowned skins in the trap selector',
      default: true,
    }
  ];
};
