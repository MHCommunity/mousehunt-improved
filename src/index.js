import * as Sentry from '@sentry/browser';

import {
  addSettingForModule,
  checkForDataUpdates,
  debug,
  debuglog,
  deleteSetting,
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
  saveSetting,
  setGlobal,
  showLoadingError
} from '@utils';

import update from './updates/index.js';

import * as imported from './modules/*/index.js'; // eslint-disable-line import/no-unresolved
const modules = imported;

const categories = [
  { id: 'required', name: 'Always Loaded' },
  { id: 'appearance', name: 'Appearance' },
  { id: 'hunting-setup', name: 'Hunting & Setup' },
  { id: 'inventory-economy', name: 'Inventory & Economy' },
  { id: 'location-hud', name: 'Location HUDs' },
  { id: 'locations-maps-travel', name: 'Locations, Maps, Travel' },
  { id: 'journal-progress-stats', name: 'Journal, Progress, Stats' },
  { id: 'social-profiles', name: 'Social & Profiles' },
  { id: 'navigation-utilities', name: 'Navigation & Utilities' },
  { id: 'hide-simplify', name: 'Hide & Simplify' },
  { id: 'beta', name: 'Beta & Experiments' },
  { id: 'advanced', name: 'Advanced' },
];

/**
 * Migrate the legacy counter modules into the merged base item counter module.
 */
const migrateBaseItemCountersSetting = () => {
  const newSettingId = 'base-item-counters';
  const legacySettingIds = ['printing-press-paper-counter', 'ssdb-teeth-counter'];
  const currentSetting = getSetting(newSettingId, null);

  if (null === currentSetting) {
    const legacySettings = legacySettingIds.map((settingId) => getSetting(settingId, null));
    const hasLegacySetting = legacySettings.some((setting) => null !== setting);

    saveSetting(newSettingId, hasLegacySetting ? legacySettings.some(Boolean) : true);
  }

  legacySettingIds.forEach((settingId) => {
    if (null !== getSetting(settingId, null)) {
      deleteSetting(settingId);
    }
  });
};

/**
 * Validate a module's metadata.
 *
 * @param {Object} module The module to validate.
 */
const validateModuleMetadata = (module) => {
  if (! module?.id || ! module?.type || 'function' !== typeof module?.load) {
    throw new Error(`Invalid module definition: ${module?.id || 'unknown module'}`);
  }
};

/**
 * Group modules by category without mutating the category definitions.
 *
 * @return {Array} Categories with grouped modules.
 */
const getCategoriesWithModules = () => {
  const categoriesWithModules = categories.map((category) => ({
    ...category,
    modules: [],
  }));

  modules.forEach((module) => {
    validateModuleMetadata(module);

    const category = categoriesWithModules.find((item) => item.id === module.type);
    if (! category) {
      debug(`Unknown module category: ${module.type}`);
      return;
    }

    category.modules.push(module);
  });

  for (const category of categoriesWithModules) {
    category.modules.sort((a, b) => {
      const orderA = a.order ?? 1;
      const orderB = b.order ?? 1;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (a.name || a.id).localeCompare(b.name || b.id);
    });
  }

  return categoriesWithModules;
};

/**
 * Load all the modules.
 *
 * @param {Array} categoriesWithModules Categories with modules to load.
 */
const loadModules = async (categoriesWithModules = getCategoriesWithModules()) => {
  // Don't load if already loaded.
  if (getGlobal('loaded')) {
    debug('Already loaded, exiting.');
    return;
  }

  // Track modules to load.
  const load = [];

  // Track loaded modules.
  const allLoadedModules = [];
  const moduleErrors = [];

  // Loop through the categories and load the modules.
  for (const category of categoriesWithModules) {
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
        getSetting(module.id, module.default) ||
        getFlag(`load-${module.id}`)
      ) {
        load.push(Promise.resolve()
          .then(() => module.load())
          .then(() => {
            loadedModules.push(module.id);
            allLoadedModules.push(module.id);
            return module.id;
          })
          .catch((error) => {
            moduleErrors.push({ module, error });
            debug(`Error loading "${module.id}"`, error);
            return null;
          }));
      }
    }

    // Log the loaded modules for the category.
    if (getSetting('debug.module-loading', false)) {
      debuglog('module-loading', `Loaded ${category.modules.length} ${category.id} modules`, loadedModules);
    }
  }

  // Wait for all modules to load.
  await Promise.all(load);

  if (moduleErrors.length > 0) {
    if (getSetting('error-reporting', true)) {
      moduleErrors.forEach(({ error }) => Sentry.captureException(error));
    }

    throw moduleErrors[0].error;
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
    const injectedScript = document.querySelector('#mousehunt-improved-script');
    const extensionBaseUrl = new URL(injectedScript?.dataset.baseurl || injectedScript?.src || 'chrome-extension://fgjkidgknmkhnbeobehlfabjbignhkhm');

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
      allowUrls: [
        // (chrome-extension|moz-extension)://<extension-id> becomes <extension-id>
        extensionBaseUrl.hostname,
      ],
    });

    // The IndexedDB layer recovers from errors instead of throwing, so report
    // its repairs and final failures as warnings to keep visibility into how
    // often they happen. Deduped per page load per database and error type.
    const reportedDatabaseIssues = new Set();
    window.addEventListener('mh-improved-db-issue', (event) => {
      const { context, databaseName, errorName, errorMessage } = event?.detail || {};

      const key = `${context}:${databaseName}:${errorName}`;
      if (reportedDatabaseIssues.has(key)) {
        return;
      }

      reportedDatabaseIssues.add(key);
      Sentry.captureMessage(
        `IndexedDB ${context} for "${databaseName}"${errorName ? `: ${errorName}` : ''}${errorMessage ? `: ${errorMessage}` : ''}`,
        'warning'
      );
    });
  }

  // If we're updating, do the update before loading the modules.
  const previousVersion = getSetting('mh-improved-version', '0.0.0');
  if (previousVersion !== mhImprovedVersion) {
    const updated = await update(previousVersion, mhImprovedVersion);
    if (! updated) {
      return;
    }
  }

  migrateBaseItemCountersSetting();

  // Check the small version map before modules read cached data. This runs at
  // most once every three hours and downloads datasets only when they changed.
  try {
    await checkForDataUpdates();
  } catch (error) {
    // Data freshness checks must never prevent the extension from loading.
    debuglog('utils-data', 'Unable to check for updated data files', error);
  }

  // Time to load the modules.
  try {
    const categoriesWithModules = getCategoriesWithModules();

    await loadModules(categoriesWithModules);

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
      for (const module of categoriesWithModules) {
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
