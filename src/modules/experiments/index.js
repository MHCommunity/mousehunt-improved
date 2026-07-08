import { getSetting, onEvent } from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;
const loadedExperimentModules = new Set();

/**
 * Load a single experiment module.
 *
 * @param {Object} module The experiment module to load.
 */
const loadExperimentModule = (module) => {
  if (! module.load || loadedExperimentModules.has(module.id)) {
    return;
  }

  if (module.showIf && ! module.showIf()) {
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
      id: 'better-maps.draggable-highlight',
      name: 'Better Maps: Draggable highlight',
      description: 'Allows you to drag and reposition the sticky highlight',
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
    if (getSetting(module.id, false)) {
      loadExperimentModule(module);
    }
  });

  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if (! value) {
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
  name: 'Experiments / Beta Features',
  description: '',
  type: 'beta',
  order: -1,
  alwaysLoad: true,
  load: init,
  settings: async () => {
    const moduleSettings = [];
    const availableModules = modules.filter((module) => ! module.showIf || module.showIf());

    for (const module of availableModules) {
      const settings = module.settings ? await module.settings() : null;

      moduleSettings.push({
        id: module.id || module.name,
        title: module.name || module.id,
        description: module.description || '',
        default: module.default || false,
        children: settings || [],
      });
    }

    return moduleSettings;
  },
};
