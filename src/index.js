// Core 'Better' modules.
import betterUi from './modules/better-ui';
import betterInventory from './modules/better-inventory';
import betterGifts from './modules/better-gifts';
import betterGiftsSettings from './modules/better-gifts/settings';
import betterItemView from './modules/better-item-view';
import betterJournal from './modules/better-journal';
import betterKingsReward from './modules/better-kings-reward';
import betterMaps from './modules/better-maps';
import betterMarketplace from './modules/better-marketplace';
import betterMice from './modules/better-mice';
import betterQuests from './modules/better-quests';
import betterSendSupplies from './modules/better-send-supplies';
import betterSendSuppliesSettings from './modules/better-send-supplies/settings';
import betterShops from './modules/better-shops';
import betterTournaments from './modules/better-tournaments';
import betterTournamentsSettings from './modules/better-tournaments/settings';
import betterTravel from './modules/better-travel';
import betterTravelSettings from './modules/better-travel/settings';

// Feature modules.
import copyId from './modules/copy-id';
import customShield from './modules/custom-shield';
import customShieldSettings from './modules/custom-shield/settings';
import darkMode from './modules/dark-mode';
import hoverProfiles from './modules/hover-profiles';
import imageUpscaling from './modules/image-upscaling';
import inlineWiki from './modules/inline-wiki';
import keyboardShortcuts from './modules/keyboard-shortcuts';
import locationCatchStats from './modules/location-catch-stats';
import locationDashboard from './modules/dashboard';
import onlyOpenMultiple from './modules/only-open-multiple';
import openAllButOne from './modules/open-all-but-one';
import pasteHunterId from './modules/paste-hunter-id';
import prestigeBaseStats from './modules/prestige-base-stats';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import quickSendSuppliesSettings from './modules/quick-send-supplies/settings';
import tallerWindows from './modules/taller-windows';
import temCrowns from './modules/tem-crowns';
import ultimateCheckmark from './modules/ultimate-checkmark';

// Location HUD module.
import locationHud from './modules/location-hud';
import locationHudSettings from './modules/location-hud/settings.js';

// Element hiding modules.
import adblock from './modules/adblock';
import noFooter from './modules/no-footer';
import noShare from './modules/no-share';
import noSidebar from './modules/no-sidebar';
import noDailyReward from './modules/no-daily-reward';
import journalPrivacy from './modules/journal-privacy';

// All the always loaded modules.
import dev from './modules/dev';
import featureFlags from './modules/feature-flags';
import fixes from './modules/fixes';
import globalStyles from './modules/global-styles';
import highlightUsers from './modules/highlight-users';
import links from './modules/links';
import required from './modules/required';
import updateNotifications from './modules/update-notifications';

import {
  addToGlobal,
  debug,
  debuglite,
  getFlag,
  getGlobal,
  isiFrame,
  isApp
} from './modules/utils';

import {
  addAdvancedSettings,
  addSettingForModule,
  showLoadingError
} from './modules/settings';

// Core 'Better' modules.
const modules = [
  {
    // Always loaded modules.
    id: 'always-loaded',
    modules: [
      {
        id: 'global-styles',
        load: globalStyles,
        alwaysLoad: true,
      },
      {
        id: 'required',
        load: required,
        alwaysLoad: true,
      },
      {
        id: 'dev',
        load: dev,
        alwaysLoad: true,
      },
      {
        id: 'feature-flags',
        load: featureFlags,
        alwaysLoad: true,
      },
      {
        id: 'fixes',
        load: fixes,
        alwaysLoad: true,
      },
      {
        id: 'highlight-users',
        load: highlightUsers,
        alwaysLoad: true,
      },
      {
        id: 'links',
        load: links,
        alwaysLoad: true,
      },
      {
        id: 'update-notifications',
        load: updateNotifications,
        alwaysLoad: true,
      }
    ],
  },
  {
    id: 'mousehunt-improved',
    name: 'MouseHunt Improved',
    modules: [
      {
        id: 'better-ui',
        name: 'Better UI',
        default: true,
        description: 'Updates the MH interface with a variety of UI and style changes.',
        load: betterUi,
      },
      {
        id: 'better-gifts',
        name: 'Better Gifts',
        default: true,
        description: 'Quickly accept and return all your gifts as well as picking random friends to send to.',
        load: betterGifts,
        settings: betterGiftsSettings,
      },
      {
        id: 'better-inventory',
        name: 'Better Inventory',
        default: true,
        description: 'Updates the inventory layout and styling. ',
        load: betterInventory,
      },
      {
        id: 'better-item-view',
        name: 'Better Item View',
        default: true,
        description: 'Add links to MHCT & MHWiki in mouse popups as well as showing drop rates.',
        load: betterItemView
      },
      {
        id: 'better-journal',
        name: 'Better Journal',
        default: true,
        description: 'Modify the journal text, layout, and styling.',
        load: betterJournal,
      },
      {
        id: 'better-kings-reward',
        name: 'Better King\'s Reward',
        default: true,
        description: 'Updates the style of the King\'s Reward slightly, automatically closes the success message',
        load: betterKingsReward,
      },
      {
        id: 'better-maps',
        name: 'Better Maps',
        default: true,
        description: 'Adds a variety of features to maps. ',
        load: betterMaps
      },
      {
        id: 'better-marketplace',
        name: 'Better Marketplace',
        default: true,
        description: 'Updates the marketplace layout and appearance and adds a variety of small features.',
        load: betterMarketplace,
      },
      {
        id: 'better-mice',
        name: 'Better Mice',
        default: true,
        description: 'Adds attraction rate stats and links to MHWiki and MHCT to mouse dialogs. Adds sorting to the mouse stats pages, and adds the King\'s Crown tab to the mouse pages.',
        load: betterMice,
      },
      {
        id: 'better-quests',
        name: 'Better Quests',
        default: true,
        description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and bundles the M400 helper.',
        load: betterQuests,
      },
      {
        id: 'better-send-supplies',
        name: 'Better Send Supplies',
        default: true,
        description: 'Adds a variety of features to the Send Supplies page.',
        load: betterSendSupplies,
        settings: betterSendSuppliesSettings,
      },
      {
        id: 'better-shops',
        name: 'Better Shops',
        default: true,
        description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.',
        load: betterShops
      },
      {
        id: 'better-tournaments',
        name: 'Better Tournaments',
        default: true,
        description: 'Updates the Tournaments UI to show information on hover and a variety of small interface tweaks.',
        load: betterTournaments,
        settings: betterTournamentsSettings,
      },
      {
        id: 'better-travel',
        name: 'Better Travel',
        default: true,
        description: 'Updates the travel page.',
        load: betterTravel,
        settings: betterTravelSettings,
      },
    ]
  },
  {
    id: 'feature-modules',
    name: 'Features',
    modules: [
      {
        id: 'copy-id',
        name: 'Copy ID',
        default: true,
        description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.',
        load: copyId,
      },
      {
        id: 'custom-shield',
        name: 'Custom Shield',
        default: false,
        description: 'Change your shield in the HUD to a variety of different options.',
        load: customShield,
        alwaysLoad: true, // set to always load so that rather than enable/disable, you can just change the shield back to default.
        settings: customShieldSettings,
      },
      {
        id: 'dark-mode',
        name: 'Dark Mode Improvements & Tweaks',
        default: true,
        description: 'Improves and tweaks dark mode, either the standalone extension or the MHCT version.',
        load: darkMode,
      },
      {
        id: 'hover-profiles',
        name: 'Hover Profiles',
        default: true,
        description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.',
        load: hoverProfiles,
      },
      {
        id: 'image-upscaling',
        name: 'Image Upscaling',
        default: true,
        description: 'Uses high-res images with transparent backgrounds across the entire MH interface.',
        load: imageUpscaling,
      },
      {
        id: 'inline-wiki',
        name: 'Inline Wiki',
        default: true,
        description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.',
        load: inlineWiki,
      },
      {
        id: 'keyboard-shortcuts',
        name: 'Keyboard Shortcuts',
        default: true,
        description: 'Press \'?\' to see a list of keyboard shortcuts.',
        load: keyboardShortcuts,
      },
      {
        id: 'location-dashboard',
        name: 'Location Dashboard',
        default: true,
        description: 'See location HUD information in a dashboard available in the top dropdown menu.',
        load: locationDashboard,
      },
      {
        id: 'location-catch-stats',
        name: 'Location Catch Stats',
        default: true,
        description: 'Adds an item under the "Mouse" menu to see your catch stats for the current location.',
        load: locationCatchStats,
      },
      {
        id: 'only-open-multiple',
        name: 'Inventory - Only open multiple',
        default: false,
        description: 'Lock opening things in your inventory unless you have multiple of them.',
        load: onlyOpenMultiple,
      },
      {
        id: 'open-all-but-one',
        name: 'Inventory - Open all But One buttons',
        default: true,
        description: 'Adds \'Open All But One\' buttons to convertible items in your inventory.',
        load: openAllButOne,
      },
      {
        id: 'paste-hunter-id',
        name: 'Paste Hunter ID',
        default: true,
        description: 'Copy a Hunter ID to your clipboard and then press Ctrl/Cmd+v anywhere to go directly to that hunter\'s profile.',
        load: pasteHunterId,
      },
      {
        id: 'prestige-base-stats',
        name: 'Prestige Base Stats',
        default: true,
        description: 'Shows the correct stats for the Prestige Base in the base selector.',
        load: prestigeBaseStats,
      },
      {
        id: 'quick-filters-and-sort',
        name: 'Quick Filters and Sort',
        default: true,
        description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.',
        load: quickFiltersAndSort,
      },
      {
        id: 'quick-send-supplies',
        name: 'Quick Send Supplies',
        default: true,
        description: 'Hover over the send supplies button on someone\'s profile or hover-profile to easily send any quantity of SUPER|brie+ or another item.',
        load: quickSendSupplies,
        settings: quickSendSuppliesSettings,
      },
      {
        id: 'taller-windows',
        name: 'Taller Windows',
        default: true,
        description: 'Make popup and dialog windows taller.',
        load: tallerWindows,
      },
      {
        id: 'tem-crowns',
        name: 'TEM Crowns',
        default: true,
        description: 'Adds crowns and catches to the the Trap Effectiveness Meter.',
        load: temCrowns,
      },
      {
        id: 'ultimate-checkmark',
        name: 'Ultimate Checkmark',
        default: true,
        description: 'Adds more things collect on the items view of your Hunter profile.',
        load: ultimateCheckmark,
      },
    ]
  },
  {
    id: 'remove-elements',
    name: 'Hide Page Elements',
    modules: [
      {
        id: 'adblock',
        name: 'Adblock',
        default: false,
        description: 'Hides advertisements for Feedback Friday, mobile apps, news ticker, etc.',
        load: adblock,
      },
      {
        id: 'hide-daily-reward',
        name: 'Hide Daily Reward Popup',
        default: false,
        description: 'Automatically close the daily reward popup when it shows.',
        load: noDailyReward,
      },
      {
        id: 'journal-privacy',
        name: 'Hide player names in journal entries',
        default: false,
        description: 'Hides player names in the journal. Good for screenshots that won\'t dox them.',
        load: journalPrivacy,
      },
      {
        id: 'no-footer',
        name: 'Remove Footer',
        default: false,
        description: 'Hides the footer.',
        load: noFooter,
      },
      {
        id: 'no-share',
        name: 'Remove Share Buttons',
        default: true,
        description: 'Hides the share buttons.',
        load: noShare,
      },
      {
        id: 'no-sidebar',
        name: 'Remove Sidebar',
        default: false,
        description: 'Hides the sidebar and adds a \'Sidebar\' dropdown in the top menu.',
        load: noSidebar,
      },
    ],
  },
  {
    id: 'location-hud',
    name: 'Location HUDs',
    modules: [
      {
        id: 'location-huds',
        name: 'Location HUD Improvements',
        default: true,
        description: '',
        load: locationHud, alwaysLoad: true,
        settings: locationHudSettings,
      },
    ],
  },
];

const loadModules = async () => {
  if (getGlobal('loaded')) {
    debug('Already loaded.');
    return;
  }

  addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  // Add the settings for each module.
  modules.forEach((module) => {
    addSettingForModule(module);
  });

  // Load the modules.
  const loadedModules = [];
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      const overrideStopLoading = getFlag(`no-${subModule.id}`);
      if (overrideStopLoading) {
        debuglite(`Skipping ${subModule.name} due to override flag.`);
        return;
      }

      if (subModule.alwaysLoad || getSetting(subModule.id, subModule.default, 'mousehunt-improved-settings')) {
        try {
          subModule.load();
          debuglite(`Loaded "${subModule.id}"`);
          loadedModules.push(subModule.id);
        } catch (error) {
          debug(`Error loading "${subModule.id}"`, error);
        }
      } else {
        debuglite(`Skipping "${subModule.id}" (disabled).`);
      }
    });
  });

  addAdvancedSettings();

  addToGlobal('modules', loadedModules);
};

const init = async () => {
  debug('Initializing...');

  if (isiFrame()) {
    showLoadingError({ message: 'Loading inside an iframe is not supported.' });
    return;
  }

  if (! isApp()) {
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

init();
