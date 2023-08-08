// Utilities
import { addUIStyles } from './modules/utils';

// Core 'Better' modules
import betterInventory from './modules/better-inventory';
import betterJournal from './modules/better-journal';
import betterMaps from './modules/better-maps';
import betterMarketplace from './modules/better-marketplace';
import betterQuests from './modules/better-quests';
import betterSendSupplies from './modules/better-send-supplies';
import betterShops from './modules/better-shops';
import betterUi from './modules/better-ui';

// Feature modules.
import betterItemView from './modules/better-item-view';
import betterMouseView from './modules/better-mouse-view';
import copyId from './modules/copy-id';
import dashboard from './modules/dashboard';
import fixes from './modules/fixes/';
import hoverProfiles from './modules/hover-profiles';
import imageUpscaling from './modules/image-upscaling';
import inlineWiki from './modules/inline-wiki';
import locationHud from './modules/location-hud';
import onlyOpenMultiple from './modules/only-open-multiple';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import quickSendSuppliesSettings from './modules/quick-send-supplies/settings';
import temCrowns from './modules/tem-crowns';

// Copies of standalone userscripts.
import fancyKingsReward from './modules/external/fancy-kings-reward';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';
import tallerWindows from './modules/external/taller-windows';

import testing from './modules/testing';

// Global styles
import globalStyles from './styles.css';

testing();

addUIStyles(globalStyles);
addUIStyles(fixes);

// Core 'Better' modules.
const modules = [
  {
    id: 'ui-modules',
    name: 'UI',
    description: 'Interface and functionality improvements',
    modules: [
      { id: 'better-ui', name: 'Better UI', default: true, description: 'Updates the MH interface with a variety of UI and style changes.', load: betterUi },
      { id: 'better-inventory', name: 'Better Inventory', default: true, description: 'Updates the inventory layout and appearance and adds a variety of small features.', load: betterInventory },
      { id: 'better-journal', name: 'Better Journal', default: true, description: 'Modify the journal text, layout, and styling.', load: betterJournal },
      { id: 'better-maps', name: 'Better Maps', default: true, description: 'Updates the map layout and appearance and adds a variety of small features.', load: betterMaps },
      { id: 'better-marketplace', name: 'Better Marketplace', default: true, description: 'Updates the marketplace layout and appearance and adds a variety of small features.', load: betterMarketplace },
      { id: 'better-send-supplies', name: 'Better Send Supplies', default: true, description: 'Adds a variety of features to the Send Supplies page.', load: betterSendSupplies },
      { id: 'better-shops', name: 'Better Shops', default: true, description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.', load: betterShops },
      { id: 'quests', name: 'Better Quests', default: true, description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and bundles the M400 helper.', load: betterQuests },
    ]
  },
  {
    id: 'feature-modules',
    name: 'Features',
    description: 'Additional features',
    modules: [
      { id: 'better-item-view', name: 'Better Item View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing drop rates.', load: betterItemView },
      { id: 'better-mouse-view', name: 'Better Mouse View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing attraction rates.', load: betterMouseView },
      { id: 'copy-id', name: 'Copy ID Button', default: true, description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.', load: copyId },
      { id: 'dashboard', name: 'Location Dashboard', default: true, description: 'See location HUD information in a dashboard available in the top dropdown menu.', load: dashboard },
      { id: 'fancy-kings-reward', name: 'Fancy King\'s Reward', default: true, description: 'Automatically clicks the \'Continue\' button after solving a King\'s Reward.', load: fancyKingsReward },
      { id: 'hover-profiles', name: 'Hover Profiles', default: true, description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.', load: hoverProfiles },
      { id: 'image-upscaling', name: 'Image Upscaling', default: true, description: 'Uses high-res images with transparent backagrounds across the entire MH interface.', load: imageUpscaling },
      { id: 'inline-wiki', name: 'Inline Wiki', default: true, description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.', load: inlineWiki },
      { id: 'inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'quick-filters-and-sort', name: 'Quick Filters and Sort', default: true, description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.', load: quickFiltersAndSort },
      { id: 'quick-send-supplies', name: 'Quick Send Supplies', default: true, description: 'Hover over the send supplies button to easily send any quantity of SUPER|brie+ or another item..', load: quickSendSupplies, settings: quickSendSuppliesSettings },
      { id: 'taller-windows', name: 'Taller Windows', default: true, description: 'Makes popup windows taller.', load: tallerWindows },
      { id: 'tem-crowns', name: 'TEM Crowns', default: true, description: 'Adds crowns and catches to the the Trap Effectiveness Meter.', load: temCrowns },
      { id: 'location-huds', name: 'Location HUD Improvements', default: true, description: 'Add additional information to the HUD for each location.', load: locationHud },
    ]
  },
  {
    id: 'remove-elements',
    name: 'Hide Page Elements',
    modules: [
      { id: 'no-footer', name: 'Remove Footer', default: false, description: 'Hides the footer.', load: noFooter },
      { id: 'no-share', name: 'Remove Share Buttons', default: true, description: 'Hides the share buttons.', load: noShare },
      { id: 'no-sidebar', name: 'Remove Sidebar', default: false, description: 'Hides the sidebar and adds a \'Sidebar\' dropdown in the top menu.', load: noSidebar },
    ],
  },
  {
    // Always loaded modules.
    id: 'always-loaded',
    modules: [
      { id: 'fixes', load: fixes, alwaysLoad: true },
      { id: 'testing', load: testing, alwaysLoad: true },
    ],
  }
];

// enableDebugMode();

const main = () => {
  debug('Starting MH UI');

  addSettingsTab('better-mh-settings', 'Better MH');

  // Add the settings for each module.
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      if (subModule.alwaysLoad) {
        return;
      }

      addSetting(
        subModule.name,
        subModule.id,
        subModule.default,
        subModule.description,
        { id: module.id, name: module.name, description: module.description },
        'better-mh-settings'
      );

      if (subModule.settings && (subModule.alwaysLoad || getSetting(subModule.id, subModule.default))) {
        subModule.settings(subModule, module);
      }
    });
  });

  eventRegistry.doEvent('better-mh-before-load');
  // Load the modules.
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      eventRegistry.doEvent(`better-mh-before-load-${subModule.id}`);
      if (subModule.alwaysLoad) {
        subModule.load();
      } else if (getSetting(subModule.id, subModule.default)) {
        subModule.load();
      }
      eventRegistry.doEvent(`better-mh-after-load-${subModule.id}`);
    });
  });

  eventRegistry.doEvent('better-mh-after-load');
};

// Start it up.
main();
