import { getSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'legacy-hud.menu',
      title: 'Enable the legacy menu',
      default: getSetting('experiments.legacy-hud-only-menu', false),
    },
    {
      id: 'legacy-hud.stats',
      title: 'Enable the legacy stats bar',
      default: getSetting('experiments.legacy-hud-only-stats', false),
    },
    {
      id: 'legacy-hud.tweaks',
      title: 'Enable tweaks to the legacy HUD',
      default: getSetting('experiments.legacy-hud-tweaks', true),
    },
  ];
};
