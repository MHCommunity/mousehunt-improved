import { getSetting } from '@utils';

import bigTimer from './modules/big-timer';
import codexAtBottom from './modules/codex-at-bottom';
import newSettingsStylesColumns from './modules/new-settings-styles-columns';
import raffle from './modules/raffle';
import trollMode from './modules/troll-mode';

const experiments = [
  {
    id: 'experiments.favorite-setups-toggle',
    title: 'Favorite Setups button in top menu',
  },
  {
    id: 'experiments.location-hud-toggle',
    title: 'Location HUD toggle button in top menu',
  },
  {
    id: 'experiments.lol-gottem',
    title: 'Troll mode',
    load: trollMode,
  },
  {
    id: 'experiments.raffle',
    title: 'Return Raffles button',
    load: raffle,
  },
  {
    id: 'experiments.new-settings-styles-columns',
    title: 'Settings: Columns',
    load: newSettingsStylesColumns,
  },
  {
    id: 'experiments.codex-at-bottom',
    title: 'Move Codex section to the bottom of the trap selector',
    load: codexAtBottom,
  },
  {
    id: 'better-marketplace.show-chart-images',
    title: 'Better Marketplace: Show charts on category pages',
  },
  {
    id: 'location-huds.bountiful-beanstalk-invetory-in-one-row',
    title: 'Location HUD - Bountiful Beanstalk: Inventory box in one row',
  },
  {
    id: 'experiments.iceberg-always-show-progress',
    title: 'Location HUD - Iceberg: Always show progress details',
  },
  {
    id: 'experiments.fi-draggable-airship',
    title: 'Location HUD - Floating Islands: Make airship draggable',
  },
  {
    id: 'experiments.big-timer',
    title: 'Big Timer',
    load: bigTimer,
  }
];

const init = async () => {
  // Not every experiment has a load function, because most of them are used by
  // checking for the setting in their respective modules. These ones aren't contained
  // in a module, so they need to be loaded here.
  for (const experiment of experiments) {
    if (experiment.load && getSetting(experiment.id, false)) {
      experiment.load();
    }
  }
};

export default {
  id: 'experiments',
  name: 'Experiments',
  description: '',
  type: 'beta',
  default: true,
  order: -1,
  load: init,
  settings: () => experiments,
};
