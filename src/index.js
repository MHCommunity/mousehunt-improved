import {
  addAdvancedSettings,
  addSettingForModule,
  addSettingsTab,
  addToGlobal,
  debug,
  debuglite,
  getFlag,
  getGlobal,
  getSettingDirect,
  isApp,
  isImage,
  isiFrame,
  showLoadingError
} from '@utils';

import modules from './module-loader';

const organizedModules = [
  {
    // Always loaded modules.
    id: 'required',
    modules: [],
  },
  {
    id: 'better',
    name: 'MouseHunt Improved',
    modules: [],
  },
  {
    id: 'feature',
    name: 'Features',
    modules: [],
  },
  {
    id: 'element-hiding',
    name: 'Hide Page Elements',
    modules: [],
  },
  {
    id: 'location-hud',
    name: 'Location HUDs',
    modules: [],
  },
];

/**
 * Load all the modules.
 */
const loadModules = async () => {
  if (getGlobal('loaded')) {
    debug('Already loaded, exiting.');
    return;
  }

  addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  modules.forEach((m) => {
    const category = organizedModules.find((c) => c.id === m.type);
    if (! category) {
      debug(`Unknown module category: ${m.type}`);
      return;
    }

    category.modules.push(m);
  });

  // Add the settings for each module.
  organizedModules.forEach((module) => {
    if ('required' !== module.id) {
      addSettingForModule(module);
    }
  });

  // Load the modules.
  const loadedModules = [];
  let modulesDebug = [];

  organizedModules.forEach((module) => {
    module.modules.forEach((subModule) => {
      const overrideStopLoading = getFlag(`no-${subModule.id}`);
      if (overrideStopLoading) {
        debuglite(`Skipping ${subModule.name} due to override flag.`);
        return;
      }

      if (
        subModule.alwaysLoad ||
        'required' === subModule.type ||
        getSettingDirect(subModule.id, subModule.default, 'mousehunt-improved-settings') ||
        (subModule.beta && getFlag(subModule.id))
      ) {
        try {
          subModule.load();
          loadedModules.push(subModule.id);

          modulesDebug.push(subModule.id);
        } catch (error) {
          debug(`Error loading "${subModule.id}"`, error);
        }
      } else {
        debuglite(`Skipping "${subModule.id}" (disabled)`);
      }
    });

    debuglite(`Loaded ${module.id}: ${modulesDebug.join(', ')}`);
    modulesDebug = [];
  });

  addAdvancedSettings();
};

/**
 * Initialize the script.
 */
const init = async () => {
  debug(`Initializing MouseHunt Improved v${mhImprovedVersion} / ${mhImprovedPlatform}...`);

  // Check if the url is an image and if so, don't load.
  if (isImage()) {
    debug('Skipping image.');
    return;
  }

  if (isiFrame()) {
    showLoadingError({ message: 'Loading inside an iframe is not supported.' });
    return;
  }

  if (! isApp()) {
    showLoadingError({ message: 'Global MouseHunt functions not found.' });
    return;
  }

  try {
    debug('Loading modules...');

    // Start it up.
    loadModules();
  } catch (error) {
    debug('Error loading modules', error);

    showLoadingError(error);
  } finally {
    addToGlobal('loaded', true);
    // Unblank the page.
    document.body.style.display = 'block';
  }

  debug('Loading complete.');
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
