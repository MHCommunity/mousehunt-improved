// Core 'Better' modules.
import betterGifts from './modules/better-gifts';
import betterInventory from './modules/better-inventory';
import betterItemView from './modules/better-item-view';
import betterJournal from './modules/better-journal';
import betterKingsReward from './modules/better-kings-reward';
import betterMaps from './modules/better-maps';
import betterMarketplace from './modules/better-marketplace';
import betterMice from './modules/better-mice';
import betterQuests from './modules/better-quests';
import betterSendSupplies from './modules/better-send-supplies';
import betterShops from './modules/better-shops';
import betterTournaments from './modules/better-tournaments';
import betterTravel from './modules/better-travel';
import betterUi from './modules/better-ui';

// Feature modules.
import copyId from './modules/copy-id';
import customShield from './modules/custom-shield';
import darkMode from './modules/dark-mode';
import delayedTooltips from '@/delayed-tooltips';
import hoverProfiles from './modules/hover-profiles';
import imageUpscaling from './modules/image-upscaling';
import inlineWiki from './modules/inline-wiki';
import keyboardShortcuts from './modules/keyboard-shortcuts';
import lgsReminder from './modules/lgs-reminder';
import locationCatchStats from './modules/location-catch-stats';
import locationDashboard from './modules/location-dashboard';
import metric from './modules/metric';
import onlyOpenMultiple from './modules/only-open-multiple';
import openAllButOne from './modules/open-all-but-one';
import pasteHunterId from './modules/paste-hunter-id';
import prestigeBaseStats from './modules/prestige-base-stats';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import tallerWindows from './modules/taller-windows';
import temCrowns from './modules/tem-crowns';
import ultimateCheckmark from './modules/ultimate-checkmark';

// Location HUD module.
import locationHud from './modules/location-hud';

// Element hiding modules.
import adblock from './modules/adblock';
import journalPrivacy from './modules/journal-privacy';
import noFooter from './modules/no-footer';
import noShare from './modules/no-share';
import noSidebar from './modules/no-sidebar';

// All the always loaded modules.
import dev from './modules/dev';
import featureFlags from './modules/beta-features';
import fixes from './modules/fixes';
import globalStyles from './modules/global-styles';
import highlightUsers from './modules/highlight-users';
import links from './modules/links';
import required from './modules/required';
import updateNotifications from './modules/update-notifications';

import * as Utils from './modules/utils';

import { addAdvancedSettings, addSettingForModule, showLoadingError } from './modules/settings';

const modules = [
  // Better modules.
  betterUi, // First, not alphabetical.
  betterGifts,
  betterInventory,
  betterItemView,
  betterJournal,
  betterKingsReward,
  betterMaps,
  betterMarketplace,
  betterMice,
  betterQuests,
  betterSendSupplies,
  betterShops,
  betterTournaments,
  betterTravel,

  // Feature modules.
  copyId,
  customShield,
  darkMode,
  delayedTooltips,
  hoverProfiles,
  imageUpscaling,
  inlineWiki,
  keyboardShortcuts,
  lgsReminder,
  locationCatchStats,
  locationDashboard,
  metric,
  onlyOpenMultiple,
  openAllButOne,
  pasteHunterId,
  prestigeBaseStats,
  quickFiltersAndSort,
  quickSendSupplies,
  tallerWindows,
  temCrowns,
  ultimateCheckmark,

  // Element hiding modules.
  adblock,
  journalPrivacy,
  noFooter,
  noShare,
  noSidebar,

  // Location HUD module.
  locationHud,

  // Required modules.
  dev,
  featureFlags,
  fixes,
  globalStyles,
  highlightUsers,
  links,
  required,
  updateNotifications,
];

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
  if (Utils.getGlobal('loaded')) {
    Utils.debug('Already loaded.');
    return;
  }

  Utils.addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  modules.forEach((m) => {
    const category = organizedModules.find((c) => c.id === m.type);
    if (! category) {
      Utils.debug(`Unknown module category: ${m.type}`);
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
  organizedModules.forEach((module) => {
    module.modules.forEach((subModule) => {
      const overrideStopLoading = Utils.getFlag(`no-${subModule.id}`);
      if (overrideStopLoading) {
        Utils.debuglite(`Skipping ${subModule.name} due to override flag.`);
        return;
      }

      if (
        subModule.alwaysLoad ||
        'required' === subModule.type ||
        Utils.getSetting(subModule.id, subModule.default, 'mousehunt-improved-settings')
      ) {
        try {
          subModule.load();
          loadedModules.push(subModule.id);
        } catch (error) {
          Utils.debug(`Error loading "${subModule.id}"`, error);
        }
      } else {
        Utils.debuglite(`Skipping "${subModule.id}" (disabled).`);
      }
    });
  });

  addAdvancedSettings();

  Utils.addToGlobal('modules', loadedModules);
};

/**
 * Initialize the script.
 */
const init = async () => {
  Utils.debug('Initializing...');

  // Check if the url is an image and if so, don't load.
  if (Utils.isInImage()) {
    Utils.debug('Skipping image.');
    return;
  }

  if (Utils.isiFrame()) {
    showLoadingError({ message: 'Loading inside an iframe is not supported.' });
    return;
  }

  if (! Utils.isApp()) {
    showLoadingError({ message: 'Global MouseHunt functions not found.' });
    return;
  }

  // Blank the page so that there isn't a flash of the sidebar and footer and all the UI we change.
  // Set a timeout so that if something goes wrong, we don't just have a blank page.
  document.body.style.display = 'none';
  setTimeout(() => {
    document.body.style.display = 'block';
  }, 1000);

  try {
    Utils.debug('Loading modules...');

    // Start it up.
    loadModules();
  } catch (error) {
    Utils.debug('Error loading modules', error);

    showLoadingError(error);
  } finally {
    Utils.addToGlobal('loaded', true);
    // Unblank the page.
    document.body.style.display = 'block';
  }

  Utils.debug('Loading complete.');
};

init(); // eslint-disable-line unicorn/prefer-top-level-await
