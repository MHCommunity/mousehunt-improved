import { getSetting } from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

/**
 * Load the experiments.
 */
const init = async () => {
  const onlySettings = [
    {
      id: 'better-marketplace.show-chart-images',
      name: 'Better Marketplace: Price History Charts',
      description: 'Show sales price history charts on category pages',
      load: () => {}
    },
    {
      id: 'better-journal-list.link-all-items',
      name: 'Better Journal List: Link all items',
      description: 'Add links to items in journal entries that are not linked.',
      load: () => {}
    },
    {
      id: 'better-inventory.add-trap-sorting',
      name: 'Better Inventory: Add Trap Sorting',
      description: 'Add sorting options for traps in the inventory.',
      load: () => {}
    }
  ];

  onlySettings.forEach((module) => {
    modules.push(module);
  });

  // Resort by name.
  modules.sort((a, b) => {
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
  default: true,
  order: -1,
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
