import { getSetting } from '@utils';

import bigTimer from './modules/big-timer';
import codexAtBottom from './modules/codex-at-bottom';
import journalTags from './modules/journal-tags';
import newSettingsStylesColumns from './modules/new-settings-styles-columns';
import raffle from './modules/raffle';
import replaceFavicon from './modules/replace-favicon';
import trollMode from './modules/troll-mode';

const experiments = [
  {
    id: 'experiments.big-timer',
    title: 'Big Timer',
    description: 'Click the timer to toggle between big and small.',
    load: bigTimer,
  },
  {
    id: 'experiments.codex-at-bottom',
    title: 'Codex at bottom',
    description: 'Moves the Codex section to the bottom of the trap selector',
    load: codexAtBottom,
  },
  {
    id: 'experiments.replace-favicon',
    title: 'Replace Favicon',
    description: 'Changes the favicon to a golden shield.',
    load: replaceFavicon,
  },
  {
    id: 'experiments.raffle',
    title: 'Return Raffles button',
    load: raffle,
  },
  {
    id: 'experiments.lol-gottem',
    title: 'Troll mode',
    load: trollMode,
  },
  {
    id: 'better-journal.journal-tags',
    title: 'Better Journal: Journal Tags',
    description: 'Shows entry type when hovering over journal entries.',
    load: journalTags,
  },
  {
    id: 'better-maps.community',
    title: 'Better Maps: Community maps information',
    description: 'Shows last active time on community maps. Hides old maps.',
  },
  {
    id: 'better-marketplace.show-chart-images',
    title: 'Better Marketplace: Show charts on category pages',
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
    id: 'experiments.iceberg-always-show-progress',
    title: 'Location HUDs - Iceberg: Always show progress details',
  },
  {
    id: 'experiments.fi-draggable-airship',
    title: 'Location HUDs - Floating Islands: Make airship draggable',
  },
  {
    id: 'experiments.new-settings-styles-columns',
    title: 'Settings: Columns',
    load: newSettingsStylesColumns,
  },
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
