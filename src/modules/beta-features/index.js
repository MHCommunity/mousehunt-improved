import { debuglog, getFlag } from '@utils';

import customHudBg from './modules/custom-hud-bg';
import eventHorn from './modules/event-horn';
import raffle from './modules/raffle';
import rankupForecaster from './modules/rank-up-forecaster';
import socialNoop from './modules/social';
import trollMode from './modules/troll-mode';

/**
 * Initialize the module.
 */
const init = async () => {
  const defaultDisabledFeatures = [
    { id: 'lol-gottem', load: trollMode },
    { id: 'twitter', load: socialNoop },
    { id: 'social-noop', load: socialNoop },
    { id: 'birthday-horn', load: () => eventHorn('birthday') },
    { id: 'halloween-horn', load: () => eventHorn('halloween') },
    { id: 'great-winter-hunt-horn', load: () => eventHorn('greatWinterHunt') },
    { id: 'raffle', load: raffle },
    { id: 'hud-bg-cyan', load: () => customHudBg('cyan') },
    { id: 'hud-bg-green', load: () => customHudBg('green') },
    { id: 'hud-bg-orange', load: () => customHudBg('orange') },
    { id: 'hud-bg-pink', load: () => customHudBg('pink') },
    { id: 'hud-bg-purple', load: () => customHudBg('purple') },
    { id: 'hud-bg-cyan', load: () => customHudBg('cyan') },
    { id: 'hud-bg-teal', load: () => customHudBg('teal') },
  ];

  const defaultEnabledFeatures = [
    { id: 'rank-up-forecaster', load: rankupForecaster },
  ];

  const loaded = [];

  defaultDisabledFeatures.forEach((feature) => {
    if (getFlag(feature.id)) {
      loaded.push(feature.id);
      feature.load();
    }
  });

  defaultEnabledFeatures.forEach((feature) => {
    if (! getFlag(feature.id)) {
      loaded.push(feature.id);
      feature.load();
    }
  });

  debuglog('beta-features', 'Loaded features:', loaded);
};

export default {
  id: 'beta-features',
  type: 'required',
  load: init,
};
