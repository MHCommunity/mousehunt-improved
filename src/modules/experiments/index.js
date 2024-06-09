import { getSetting } from '@utils';

import emotes from './modules/emotes';
import newSettingsStylesColumns from './modules/new-settings-styles-columns';
import raffle from './modules/raffle';
import trollMode from './modules/troll-mode';

const experiments = [
  {
    id: 'experiments.emotes',
    title: 'Emotes in corkboard',
    description: 'Replaces discord-style emotes in the corkboard like :jerry: with the actual image',
    load: emotes,
  },
  {
    id: 'experiments.raffle',
    title: 'Return Raffles button',
    description: 'Adds a button to return all raffle tickets to the Inbox. Use at your own risk',
    load: raffle,
  },
  {
    id: 'experiments.lol-gottem',
    title: 'Troll mode',
    description: 'lol',
    load: trollMode,
  },
  {
    id: 'better-inventory.show-all-group',
    title: 'Better Inventory: Add list of all items to top of inventory pages',
  },
  {
    id: 'better-maps.community',
    title: 'Better Maps: Community maps information',
    description: 'Shows last active time on community maps and hides old maps',
  },
  {
    id: 'better-marketplace.show-chart-images',
    title: 'Better Marketplace: Show sales price history charts on category pages',
  },
  {
    id: 'experiments.favorite-setups-toggle',
    title: 'Favorite Setups: Add toggle button to top menu',
  },
  {
    id: 'experiments.location-hud-toggle',
    title: 'Location HUDs: Add toggle button to top menu',
  },
  {
    id: 'location-huds.bountiful-beanstalk-invetory-in-one-row',
    title: 'Location HUDs - Bountiful Beanstalk: Inventory box in one row',
  },
  {
    id: 'experiments.fi-draggable-airship',
    title: 'Location HUDs - Floating Islands: Make airship draggable',
  },
  {
    id: 'experiments.prologue-pond-wood-boat',
    title: 'Location HUDs - Prologue Pond: Normal boat color',
  },
  {
    id: 'experiments.new-settings-styles-columns',
    title: 'Settings: Columns',
    load: newSettingsStylesColumns,
  },
];

/**
 * Load the experiments.
 */
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

/**
 * Initialize the module.
 */
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
