import {
  addAdvancedSettings,
  addSettingForModule,
  addSettingsTab,
  addToGlobal,
  debug,
  debuglite,
  debuglog,
  getFlag,
  getGlobal,
  getSettingDirect,
  isApp,
  isUnsupportedFile,
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

  await addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  modules.forEach((m) => {
    const category = organizedModules.find((c) => c.id === m.type);
    if (! category) {
      debug(`Unknown module category: ${m.type}`);
      return;
    }

    category.modules.push(m);
  });

  // Add the settings for each module.
  for (const module of organizedModules) {
    if ('required' !== module.id) {
      await addSettingForModule(module);
    }
  }

  // Load the modules.
  const loadedModules = [];
  let modulesDebug = [];

  const load = [];
  for (const module of organizedModules) {
    for (const submodule of module.modules) {
      const overrideStopLoading = getFlag(`no-${submodule.id}`);
      if (overrideStopLoading) {
        debuglite(`Skipping ${submodule.name} due to override flag.`);
        return;
      }

      if (
        submodule.alwaysLoad ||
        'required' === submodule.type ||
        getSettingDirect(submodule.id, submodule.default, 'mousehunt-improved-settings') ||
        (submodule.beta && getFlag(submodule.id))
      ) {
        try {
          load.push(submodule.load());
          loadedModules.push(submodule.id);

          modulesDebug.push(submodule.id);
        } catch (error) {
          debug(`Error loading "${submodule.id}"`, error);
        }
      }
    }

    debuglog('loader', `Loaded ${modulesDebug.length} ${module.id} modules`, modulesDebug);
    modulesDebug = [];
  }

  await Promise.all(load);

  addToGlobal('modules', loadedModules);

  addAdvancedSettings();
};

/**
 * Initialize the script.
 */
const init = async () => {
  console.log(`%c🐭️ MouseHunt Improved v${mhImprovedVersion}-${mhImprovedPlatform}%c`, 'color: #ca77ff; font-weight: 900; font-size: 1.1em', 'color: inherit; font-weight: inherit; font-size: inherit'); // eslint-disable-line no-console

  // Check if the url is an image and if so, don't load.
  if (isUnsupportedFile()) {
    debug('Skipping unsupported filetype.');
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
    // Start it up.
    await loadModules();
  } catch (error) {
    debug('Error loading modules', error);

    showLoadingError(error);
  } finally {
    addToGlobal('version', mhImprovedVersion);
    addToGlobal('loaded', true);

    console.log(`%c🐭️ MouseHunt Improved v${mhImprovedVersion}-${mhImprovedPlatform} has been loaded. Happy Hunting!%c`, 'color: #ca77ff; font-weight: 900; font-size: 1.1em', 'color: inherit; font-weight: inherit; font-size: inherit'); // eslint-disable-line no-console

    eventRegistry.doEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });
  }
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
