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

modules.sort((a, b) => getModuleTitle(a).localeCompare(getModuleTitle(b), undefined, { sensitivity: 'base' }));

/**
 * Load the experiments.
 */
const init = () => {
  // Experiments that belong to a module live in that module's settings with a badge.
  // These ones aren't contained in a module, so they need to be loaded here.
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
