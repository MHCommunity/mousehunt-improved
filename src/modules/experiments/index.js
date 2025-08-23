import { getSetting } from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

/**
 * Load the experiments.
 */
const init = () => {
  const onlySettings = [
    {
      id: 'better-maps.catch-dates',
      name: 'Better Maps: Show date caught for mice',
      description: 'Shows the approximate date you started/joined a map and when each mouse was caught.',
      load: () => {}
    },
    {
      id: 'better-marketplace.show-chart-images',
      name: 'Better Marketplace: Price history charts',
      description: 'Show sales price history charts on category pages.',
      load: () => {}
    },
    {
      id: 'better-marketplace.quick-sell',
      name: 'Better Marketplace: Quick sell',
      description: 'Add a quick sell input and button to marketplace item views for faster selling.',
      load: () => {}
    },
    {
      id: 'better-inventory.add-trap-sorting',
      name: 'Better Inventory: Add trap sorting',
      description: 'Add sorting options for traps in the inventory.',
      load: () => {}
    }
  ];

  onlySettings.forEach((module) => {
    modules.push(module);
  });

  // Sort by name, but put all the ones that have a ":" in the name before the ones that don't.
  modules.sort((a, b) => {
    const aHasColon = a.name.includes(':');
    const bHasColon = b.name.includes(':');

    if (aHasColon && ! bHasColon) {
      return -1;
    }

    if (! aHasColon && bHasColon) {
      return 1;
    }

    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  // Not every experiment has a load function, because most of them are used by
  // checking for the setting in their respective modules. These ones aren't contained
  // in a module, so they need to be loaded here.
  modules.forEach((module) => {
    if (module.load && getSetting(module.id, false)) {
      module.load();
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'experiments',
  name: 'Experiments / Beta Features',
  description: '',
  type: 'beta',
  order: -1,
  alwaysLoad: true,
  load: init,
  settings: () => {
    return modules.map((module) => ({
      id: module.id || module.name,
      title: module.name || module.id,
      description: module.description || '',
      default: module.default || false,
    }));
  },
};
