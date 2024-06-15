import { getSetting, saveSetting } from '@utils';
import { moveSetting } from '../utils';

const migrateLegacyHud = async () => {
  if ('not-set' !== getSetting('legacy-hud.menu', 'not-set')) {
    saveSetting('legacy-hud.menu', getSetting('experiments.legacy-hud-only-menu', false));
  }

  if ('not-set' !== getSetting('legacy-hud.stats', 'not-set')) {
    saveSetting('legacy-hud.stats', getSetting('experiments.legacy-hud-only-stats', false));
  }

  if ('not-set' === getSetting('legacy-hud.tweaks', 'not-set')) {
    saveSetting('legacy-hud.tweaks', getSetting('experiments.legacy-hud-tweaks', true));
  }
};

const migrateExperimentsToBeta = async () => {
  const settings = [
    { from: 'experiments.big-timer', to: 'big-timer' },
    { from: 'experiments.shield-goes-to-camp', to: 'shield-goes-to-camp' },
    { from: 'experiments.codex-at-bottom', to: 'codex-at-bottom' },
    { from: 'experiments.delayed-menus', to: 'delayed-menus' },
    { from: 'experiments.replace-favicon', to: 'replace-favicon' },
    { from: 'experiments.sticky-popups', to: 'sticky-popups' },
    { from: 'experiments.unique-loot-count', to: 'unique-loot-count' },
  ];

  settings.forEach((setting) => {
    if (getSetting(setting.from, false)) {
      moveSetting(setting);
    }
  });
};

/**
 * Migrate the item settings.
 */
const update = async () => {
  await migrateLegacyHud();
  await migrateExperimentsToBeta();
};

export default {
  id: '0.45.0',
  update
};
