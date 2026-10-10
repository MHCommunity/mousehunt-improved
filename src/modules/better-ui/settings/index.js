/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-ui.styles',
      title: 'Apply general UI improvements and fixes',
      default: true,
    },
    {
      id: 'better-ui.hud-changes',
      title: 'Apply menu and HUD tweaks',
      default: true,
    },
    {
      id: 'better-ui.replace-favicon',
      title: 'Use a cleaner shield favicon',
      default: true,
    },
  ];
};
