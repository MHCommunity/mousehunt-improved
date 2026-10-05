import { getSetting, onEvent } from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;
const loadedExperimentModules = new Set();

/**
 * Get the display title for an experiment module.
 *
 * @param {Object} module The experiment module.
 *
 * @return {string} The module title.
 */
const getModuleTitle = (module) => module.title || module.name || module.id || '';

/**
 * Load a single experiment module.
 *
 * @param {Object} module The experiment module to load.
 */
const loadExperimentModule = (module) => {
  if (!module.load || loadedExperimentModules.has(module.id)) {
    return;
  }

  if (module.showIf && !module.showIf()) {
    return;
  }

  module.load();
  loadedExperimentModules.add(module.id);
};

/**
 * Load the experiments.
 */
const init = () => {
  const onlySettings = [
    {
      id: 'better-inventory.favorites',
      title: 'Better Inventory: Add Favorites tab',
      description: 'Star items in your inventory to collect them in one tab.',
      load: () => {},
    },
    {
      id: 'better-inventory.add-trap-sorting',
      title: 'Better Inventory: Show sorting and filtering controls',
      load: () => {},
    },
    {
      id: 'better-maps.draggable-highlight',
      title: 'Better Maps: Allow dragging the highlight',
      load: () => {},
    },
    {
      id: 'better-maps.plan-tab',
      title: 'Better Maps: Add Plan tab',
      description: 'Ranks locations, stages, and cheeses by how many of the remaining map mice they attract, and suggests a route.',
      load: () => {},
    },
    {
      id: 'better-marketplace.price-history-chart',
      title: 'Better Marketplace: Show Markethunt price history charts',
      load: () => {},
    },
  ];

  onlySettings.forEach((module) => {
    modules.push(module);
  });

  // Sort by name, but put all the ones that have a ":" in the name before the ones that don't.
  modules.sort((a, b) => {
    const aTitle = getModuleTitle(a);
    const bTitle = getModuleTitle(b);
    const aHasColon = aTitle.includes(':');
    const bHasColon = bTitle.includes(':');

    if (aHasColon && !bHasColon) {
      return -1;
    }

    if (!aHasColon && bHasColon) {
      return 1;
    }

    if (aTitle < bTitle) {
      return -1;
    }

    if (aTitle > bTitle) {
      return 1;
    }

    return 0;
  });

  // Not every experiment has a load function, because most of them are used by
  // checking for the setting in their respective modules. These ones aren't contained
  // in a module, so they need to be loaded here.
  modules.forEach((module) => {
    if (getSetting(module.id, false)) {
      loadExperimentModule(module);
    }
  });

  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if (!value) {
      return;
    }

    const module = modules.find((item) => item.id === key);
    if (module) {
      loadExperimentModule(module);
    }
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'experiments',
  name: 'Experiments',
  description: '',
  type: 'beta',
  order: -1,
  alwaysLoad: true,
  load: init,
  settings: async () => {
    const moduleSettings = [];
    const availableModules = modules.filter((module) => !module.showIf || module.showIf());

    for (const module of availableModules) {
      const settings = module.settings ? await module.settings() : null;

      moduleSettings.push({
        id: module.id || getModuleTitle(module),
        title: getModuleTitle(module),
        description: module.description || '',
        default: module.default || false,
        children: settings || [],
      });
    }

    return moduleSettings;
  },
};
