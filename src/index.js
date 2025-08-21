import * as Sentry from '@sentry/browser'; // eslint-disable-line import/no-extraneous-dependencies

import {
  addSettingForModule,
  debug,
  debuglog,
  doEvent,
  doInternalEvent,
  getAnonymousUserHash,
  getFlag,
  getGlobal,
  getSetting,
  isApp,
  isUnsupportedFile,
  isiFrame,
  maybeDoMaintenance,
  onNavigation,
  setGlobal,
  showLoadingError
} from '@utils';

import update from './updates/index.js';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

const categories = [
  { id: 'required', name: 'Always Loaded' },
  { id: 'better', name: `MouseHunt Improved <a title="View release notes" href="https://github.com/MHCommunity/mousehunt-improved/releases/tag/v${mhImprovedVersion}" target="_blank" rel="noopener noreferrer">v${mhImprovedVersion}</a>` },
  { id: 'feature', name: 'Features' },
  { id: 'design', name: 'Design' },
  { id: 'element-hiding', name: 'Hide Page Elements' },
  { id: 'location-hud', name: 'Location HUDs' },
  { id: 'beta', name: 'Experiment / Beta Features' },
  { id: 'advanced', name: 'Advanced' },
];

/**
 * Load all the modules.
 */
const loadModules = async () => {
  // Don't load if already loaded.
  if (getGlobal('loaded')) {
    debug('Already loaded, exiting.');
    return;
  }

  modules.forEach((m) => {
    const category = categories.find((c) => c.id === m.type);
    if (! category) {
      debug(`Unknown module category: ${m.type}`);
      return;
    }

    category.modules = category.modules || [];

    category.modules.push(m);
  });

  for (const category of categories) {
    category.modules.sort((a, b) => {
      a.order = a.order || 1;
      b.order = b.order || 1;

      // Sort by 'order' property
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      // If order is the same, sort by name.
      return (a.name || a.id).localeCompare(b.name || b.id);
    });
  }

  // Track modules to load.
  const load = [];

  // Track loaded modules.
  const allLoadedModules = [];

  // Loop through the categories and load the modules.
  for (const category of categories) {
    const loadedModules = [];

    // Load the modules.
    for (const module of category.modules) {
      // Skip loading if the `no-<module.id>` flag is set.
      if (getFlag(`no-${module.id}`)) {
        continue;
      }

      // If the module is always loaded, or if the category is required, or if the module is enabled, load it.
      if (
        module.alwaysLoad ||
        'required' === category.id ||
        getSetting(module.id, module.default)
      ) {
        try {
          // Add the module to the load queue.
          load.push(module.load());

          // Add the module to the loaded modules.
          loadedModules.push(module.id);
        } catch (error) {
          // If the module fails to load, log the error.
          debug(`Error loading "${module.id}"`, error);
          throw error;
        }
      }
    }

    allLoadedModules.push(...loadedModules);

    // Log the loaded modules for the category.
    debuglog('module-loading', `Loaded ${category.modules.length} ${category.id} modules`, loadedModules);
  }

  // Wait for all modules to load.
  try {
    await Promise.all(load);
  } catch (error) {
    if (getSetting('error-reporting', true)) {
      Sentry.captureException(error);
    }

    throw error;
  }

  // Add the loaded modules to the global scope.
  setGlobal('modules', allLoadedModules);
};

/**
 * Initialize the script.
 */
const init = async () => {
  // Validate loading conditions.
  if (isUnsupportedFile()) {
    debug('Skipping unsupported filetype.');
    return;
  }

  // Make sure we're not inside an iframe.
  if (isiFrame()) {
    debug('Loading inside an iframe is not supported.');
    return;
  }

  // Make sure the global MouseHunt functions are available.
  if (! isApp()) {
    maybeDoMaintenance();
    debug('Global MouseHunt functions not found.');
    return;
  }

  // Make sure the event registry is available.
  if (! eventRegistry) {
    debug('Event registry not found.');
    return;
  }

  excludeFromUserscript: if (getSetting('error-reporting', true)) {
    Sentry.init({
      dsn: 'https://850af0a4f96b32d673a133c9353a3622@o4506583858348032.ingest.us.sentry.io/4506781071835136',
      maxBreadcrumbs: 50,
      debug: getSetting('debug.sentry', false),
      release: `mousehunt-improved@${mhImprovedVersion}`,
      environment: mhImprovedPlatform,
      initialScope: {
        tags: {
          platform: mhImprovedPlatform,
          version: mhImprovedVersion,
        },
        user: {
          id: await getAnonymousUserHash()
        },
      },

      /**
       * Before sending the event to Sentry, check if it should be sent.
       *
       * @param {Event} event The event object.
       *
       * @return {Event|null} The event to send, or null to skip.
       */
      beforeSend(event) {
        const file = event.exception?.values?.[0]?.stacktrace?.frames?.[0]?.filename;
        if (
          file && (
            file.includes('hknhadpnfdnkinmompmkclpfkngdcdph') ||
            file.includes('fgjkidgknmkhnbeobehlfabjbignhkhm') ||
            file.includes('mousehunt-improved')
          )
        ) {
          return event;
        }

        return null;
      }
    });
  }

  // If we're updating, do the update before loading the modules.
  const previousVersion = getSetting('mh-improved-version', '0.0.0');
  if (previousVersion !== mhImprovedVersion) {
    await update(previousVersion, mhImprovedVersion);
  }

  // Time to load the modules.
  try {
    await loadModules();

    // Add the version and loaded flag to the global scope.
    setGlobal('version', mhImprovedVersion);
    setGlobal('loaded', true);

    // Fire the events to signal that the script has been loaded.
    doEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });

    doInternalEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });

    // Welcome message.
    // eslint-disable-next-line no-console
    console.log(
      `%c🐭️ MouseHunt Improved v${mhImprovedVersion}-${mhImprovedPlatform} has been loaded. Happy Hunting!%c`,
      'color: #ca77ff; font-weight: 900; font-size: 1.1em',
      'color: inherit; font-weight: inherit; font-size: inherit'
    );

    doEvent('mh-improved-init', mhImprovedVersion);

    // Add the settings for each module.
    onNavigation(async () => {
      for (const module of categories) {
        await addSettingForModule(module);
      }
    }, {
      page: 'preferences',
      tab: 'mousehunt-improved-settings',
    });
  } catch (error) {
    showLoadingError(error);
  }
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
