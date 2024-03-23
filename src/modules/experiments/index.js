import { getSetting } from '@utils';

import newSettingsStylesColumns from './modules/new-settings-styles-columns';
import profileScoreboardSearch from './modules/profile-scoreboard-search';
import raffle from './modules/raffle';
import trollMode from './modules/troll-mode';

const experiments = [
  {
    id: 'experiments.favorite-setups-toggle',
    title: 'Favorite Setups button in top menu',
  },
  {
    id: 'experiments.fi-draggable-airship',
    title: 'Floating Islands draggable airship',
  },
  {
    id: 'experiments.journal-history',
    title: 'Journal History',
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
    id: 'experiments.iceberg-always-show-progress',
    title: 'Iceberg progress stats always visible',
  },
  {
    id: 'experiments.new-settings-styles-columns',
    title: 'Settings: Columns',
    load: newSettingsStylesColumns,
  },
  {
    id: 'experiments.profile-scoreboard-search',
    title: 'Scoreboard search on Hunter Profiles',
    load: profileScoreboardSearch,
  },
  {
    id: 'better-mice.show-mouse-hover',
    title: 'Better Mice: Show mice details on hover in journal',
  },
  {
    id: 'better-marketplace.show-chart-images',
    title: 'Better Marketplace: Show charts on category pages',
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
  description: 'Upcoming features and experiments.',
  type: 'beta',
  default: true,
  order: -1,
  load: init,
  settings: () => experiments,
};
