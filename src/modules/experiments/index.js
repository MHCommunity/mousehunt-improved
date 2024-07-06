import { getSetting } from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

/**
 * Load the experiments.
 */
const init = async () => {
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
  name: 'Experiments',
  description: '',
  type: 'beta',
  default: true,
  order: -1,
  load: init,
  settings: () => {
    return modules.map((module) => ({
      id: module.id,
      title: module.name,
      description: module.description || '',
      default: module.default || false,
    }));
  },
};
