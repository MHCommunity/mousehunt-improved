import { getSetting, saveSetting } from '@utils';

const maybeUpgradeHudSetting = () => {
  const hudBackgroundSetting = getSetting('custom-hud-0');
  if ('suede' === hudBackgroundSetting) {
    saveSetting('custom-hud-0', 'hud-suede');
  } else if ('groovy-green' === hudBackgroundSetting) {
    saveSetting('custom-hud-0', 'hud-groovy-green');
  }
};

const update = () => {
  maybeUpgradeHudSetting();
};

export default {
  id: '0.36.1',
  update
};
