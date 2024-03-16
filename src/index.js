import * as Sentry from '@sentry/browser'; // eslint-disable-line import/no-extraneous-dependencies

import {
  addSettingForModule,
  addSettingsTab,
  debug,
  debuglog,
  doEvent,
  getAnonymousUserHash,
  getFlag,
  getGlobal,
  getSetting,
  isApp,
  isUnsupportedFile,
  isiFrame,
  setGlobal,
  showLoadingError
} from '@utils';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

/**
 * Load all the modules.
 */
const loadModules = async () => {
  const categories = [
    { id: 'required', name: 'Always Loaded' },
    { id: 'better', name: 'MouseHunt Improved' },
    { id: 'feature', name: 'Features' },
    { id: 'design', name: 'Design' },
    { id: 'element-hiding', name: 'Hide Page Elements' },
    { id: 'location-hud', name: 'Location HUDs' },
    { id: 'advanced', name: 'Advanced' },
    { id: 'beta', name: 'Beta Features' }
  ];

  // Don't load if already loaded.
  if (getGlobal('loaded')) {
    debug('Already loaded, exiting.');
    return;
  }

  // Initialize the settings tab.
  await addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  // Add the settings for each module.
  modules.forEach((m) => {
    const category = categories.find((c) => c.id === m.type);
    if (! category) {
      debug(`Unknown module category: ${m.type}`);
      return;
    }

    if (! category.modules) {
      category.modules = [];
    }

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

  // Add the settings for each module.
  for (const module of categories) {
    await addSettingForModule(module);
    doEvent('mh-improved-settings-added', { module });
  }

  // Track modules to load.
  const load = [];

  // Track loaded modules.
  let loadedModules;

  // Loop through the categories and load the modules.
  for (const category of categories) {
    loadedModules = [];

    // Load the modules.
    for (const module of category.modules) {
      // Skip loading if the `no-<module.id>` flag is set.
      if (getFlag(`no-${module.id}`)) {
        continue;
      }

      // If the module is always loaded, or if the category is required, or if the module is enabled, load it.
      if (module.alwaysLoad || 'required' === category.id || getSetting(module.id, module.default)) {
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
  setGlobal('modules', loadedModules);

  // Fire the event to signal that all modules have been loaded.
  doEvent('mh-improved-modules-loaded');
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
      dsn: 'https://a677b0fe4d2fbc3a7db7410353d91f39@o4506582061875200.ingest.sentry.io/4506781071835136',
      maxBreadcrumbs: 50,
      debug: ! getSetting('debug.sentry'),
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
      beforeSend(event, hint) { // eslint-disable-line no-unused-vars
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

  // Time to load the modules.
  try {
    await loadModules();
  } catch (error) {
    showLoadingError(error);
  } finally {
    // Add the version and loaded flag to the global scope.
    setGlobal('version', mhImprovedVersion);
    setGlobal('loaded', true);

    // Welcome message.
    // eslint-disable-next-line no-console
    console.log(
      `%c🐭️ MouseHunt Improved v${mhImprovedVersion}-${mhImprovedPlatform} has been loaded. Happy Hunting!%c`,
      'color: #ca77ff; font-weight: 900; font-size: 1.1em',
      'color: inherit; font-weight: inherit; font-size: inherit'
    );

    // Fire the events to signal that the script has been loaded.
    doEvent('mh-improved-loaded', {
      version: mhImprovedVersion,
      modules: getGlobal('modules'),
    });
  }

  doEvent('mh-improved-init');
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
