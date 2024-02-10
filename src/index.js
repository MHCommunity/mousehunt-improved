import * as Sentry from '@sentry/browser'; // eslint-disable-line import/no-extraneous-dependencies

import {
  addSettingForModule,
  addSettingsTab,
  addToGlobal,
  debug,
  debuglite,
  debuglog,
  debugplain,
  doEvent,
  getFlag,
  getGlobal,
  getSetting,
  getUserHash,
  isApp,
  isUnsupportedFile,
  isiFrame,
  onActivation,
  showLoadingError
} from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

/**
 * Initialize Sentry.
 */
const initSentry = async () => {
  Sentry.init({
    dsn: 'https://c0e7b72f2611e14c356dba1923cedf6e@o4506582061875200.ingest.sentry.io/4506583459233792',
    maxBreadcrumbs: 50,
    debug: ! getFlag('debug'),
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
        id: await getUserHash()
      },
    },
  });
};

/**
 * Load all the modules.
 */
const loadModules = async () => {
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
    {
      id: 'advanced',
      name: 'Advanced',
      modules: [],
    }
  ];

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

  // Sort the modules by name, moving any that start with an underscore to the top, as well as moving better-ui to the top.
  for (const category of organizedModules) {
    category.modules.sort((a, b) => {
      if (a.id === 'better-ui' || (a.id.startsWith('_') && ! b.id.startsWith('_'))) {
        return -1;
      }

      if (b.id === 'better-ui' || (b.id.startsWith('_') && ! a.id.startsWith('_'))) {
        return 1;
      }

      return a.id.localeCompare(b.id);
    });
  }

  // Add the settings for each module.
  for (const module of organizedModules) {
    await addSettingForModule(module);
    doEvent('mh-improved-settings-added', { module });
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

      onActivation(submodule.id, submodule.load);

      if (
        submodule.alwaysLoad ||
        'required' === submodule.type ||
        getSetting(submodule.id, submodule.default) ||
        (submodule.beta && getFlag(submodule.id))
      ) {
        try {
          doEvent('mh-improved-module-before-load', submodule);

          load.push(submodule.load());

          doEvent('mh-improved-module-loaded', submodule);

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

  doEvent('mh-improved-modules-loaded', {
    loaded: loadedModules,
    notLoaded: notLoadedModules,
    skipped: skippedModules,
  });
};

/**
 * Initialize the script.
 */
const init = async () => {
  doEvent('mh-improved-init');

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

  if (! eventRegistry) {
    showLoadingError({ message: 'Event registry not found.' });
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

    doEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });
  }
};

if (getSetting('error-reporting', true)) {
  initSentry(); // eslint-disable-line unicorn/prefer-top-level-await
}

init(); // eslint-disable-line unicorn/prefer-top-level-await
