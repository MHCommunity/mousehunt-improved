import * as Sentry from '@sentry/browser'; // eslint-disable-line import/no-extraneous-dependencies

import {
  addAdvancedSettings,
  addSettingForModule,
  addSettingsTab,
  addToGlobal,
  debug,
  debuglite,
  debuglog,
  debugplain,
  getFlag,
  getGlobal,
  getSetting,
  getSettingDirect,
  isApp,
  isUnsupportedFile,
  isiFrame,
  showLoadingError
} from '@utils';

import modules from './module-loader';

if (getSetting('error-reporting', true)) {
  Sentry.init({
    dsn: 'https://c0e7b72f2611e14c356dba1923cedf6e@o4506582061875200.ingest.sentry.io/4506583459233792',
    maxBreadcrumbs: 50,
    debug: false,
    release: `mousehunt-improved@${mhImprovedVersion}`,
    environment: mhImprovedPlatform,
    allowUrls: [
      /mproved/, // mproved rather than improved to match the MH-Improved userscript
      '/nicobnljejcjcbnhgcjhhhbnadkiafca/', // Chrome extension
      /73164570-6676-4291-809b-7b5c9cf6e626/, // Firefox extension
    ],
    initialScope: {
      tags: {
        platform: mhImprovedPlatform,
        version: mhImprovedVersion,
      },
      user: {
        id: user.unique_hash,
      },
    },
  });
}

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
    id: 'design',
    name: 'Design',
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
  const notLoadedModules = [];
  const skippedModules = [];
  let modulesDebug = [];

  const load = [];
  for (const module of organizedModules) {
    for (const submodule of module.modules) {
      const overrideStopLoading = getFlag(`no-${submodule.id}`);
      if (overrideStopLoading) {
        debuglite(`Skipping ${submodule.name} due to override flag.`);
        skippedModules.push(submodule.id);

        continue;
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
      } else {
        notLoadedModules.push(submodule.id);
      }
    }

    debuglog('loader', `Loaded ${modulesDebug.length} ${module.id} modules`, modulesDebug);
    modulesDebug = [];
  }

  if (getSetting('error-reporting', true)) {
    Sentry.setContext('modules', {
      loaded: loadedModules,
      not_loaded: notLoadedModules,
      skipped: skippedModules,
      feature_flags: getSetting('override-flags', ''),
    });
  }

  await Promise.all(load);

  addToGlobal('modules', loadedModules);

  addAdvancedSettings();
};

/**
 * Initialize the script.
 */
const init = async () => {
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

    debugplain(`%c🐭️ MouseHunt Improved v${mhImprovedVersion}-${mhImprovedPlatform} has been loaded. Happy Hunting!%c`, 'color: #ca77ff; font-weight: 900; font-size: 1.1em', 'color: inherit; font-weight: inherit; font-size: inherit'); // eslint-disable-line no-console

    eventRegistry.doEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });
  }
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
