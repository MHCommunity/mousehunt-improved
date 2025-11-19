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
      id: 'better-ui.trap-gradient-background',
      title: 'Trap Selector: Add background gradient to your trap',
      default: false,
    },
    {
      id: 'better-ui.larger-skin-images',
      title: 'Trap Selector: Show larger skin images in the trap selector',
      default: true,
    },
    {
      id: 'better-ui.show-unowned-skins',
      title: 'Trap Selector: Show unowned trap skins in the trap selector',
      default: true,
    },
    {
      id: 'better-ui.larger-codices',
      title: 'Trap Selector: Show larger codex images in the trap selector',
      default: true,
    },
    {
      id: 'better-ui.codex-at-bottom',
      title: 'Trap Selector: Move the codex to the bottom of the trap view',
      default: true,

    }
  ];
};
