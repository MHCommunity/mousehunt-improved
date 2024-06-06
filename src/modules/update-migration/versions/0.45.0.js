import { getData, getSetting, saveSetting } from '@utils';

const migrateInventoryLockAndHide = async () => {
  const items = await getData('items');

  let itemSettings = getSetting('inventory-lock-and-hide.items', {
    locked: [],
    hidden: [],
  });

  itemSettings.locked = itemSettings.locked.map((i) => Number.parseInt(i, 10));
  itemSettings.hidden = itemSettings.hidden.map((i) => Number.parseInt(i, 10));

  itemSettings = {
    locked: itemSettings.locked,
    hidden: itemSettings.hidden,
    lockedTypes: itemSettings.locked.map((id) => items.find((item) => item.id === id)?.type),
    hiddenTypes: itemSettings.hidden.map((id) => items.find((item) => item.id === id)?.type),
  };

  saveSetting('inventory-lock-and-hide.items', itemSettings);
};

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

/**
 * Migrate the item settings.
 */
const update = async () => {
  await migrateInventoryLockAndHide();
  await migrateLegacyHud();
};

export default {
  id: '0.45.0',
  update
};
