// Utilities
import { addBodyClasses, addUIStyles } from './modules/utils';

// Global styles
import globalStyles from './styles.css';

// Core 'Better' modules
import betterInventory from './modules/better-inventory';
import betterJournal from './modules/better-journal';
import betterMouseView from './modules/better-mouse-view';
import betterQuests from './modules/better-quests';
import betterShops from './modules/better-shops';
import betterUi from './modules/better-ui';

// Feature modules.
import copyId from './modules/copy-id';
import dashboard from './modules/dashboard';
import hoverProfiles from './modules/hover-profiles';
import imageUpscaling from './modules/image-upscaling';
import inlineWiki from './modules/inline-wiki';
import onlyOpenMultiple from './modules/only-open-multiple';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import temCrowns from './modules/tem-crowns';

// Copies of standalone userscripts.
import itemLinks from './modules/external/item-links';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';
import tallerWindows from './modules/external/taller-windows';

// Location HUD improvements.
import cheeseSelectors from './modules/location-hud/cheese-selectors';
import balacksCove from './modules/location-hud/balacks-cove';
import forbiddenGrove from './modules/location-hud/forbidden-grove';
import fortRox from './modules/location-hud/fortrox';
import iceberg from './modules/location-hud/iceberg';
import labyrinth from './modules/location-hud/labyrinth';
import vrift from './modules/location-hud/vrift';

import testing from './modules/testing';
addUIStyles(globalStyles);

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
      { id: 'better-mouse-view', name: 'Better Mouse View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing attraction rates.', load: betterMouseView },
      { id: 'better-shops', name: 'Better Shops', default: true, description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.', load: betterShops },
      { id: 'quests', name: 'Better Quests', default: true, description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and bundles the M400 helper.', load: betterQuests },
    ]
  },
  {
    id: 'feature-modules',
    name: 'Features',
    description: 'Additional features',
    modules: [
      { id: 'copy-id', name: 'Copy ID Button', default: true, description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.', load: copyId },
      { id: 'dashboard', name: 'Location Dashboard', default: true, description: 'See location HUD information in a dashboard available in the top dropdown menu.', load: dashboard },
      { id: 'hover-profiles', name: 'Hover Profiles', default: true, description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.', load: hoverProfiles },
      { id: 'image-upscaling', name: 'Image Upscaling', default: true, description: 'Uses high-res images with transparent backagrounds across the entire MH interface.', load: imageUpscaling },
      { id: 'inline-wiki', name: 'Inline Wiki', default: true, description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.', load: inlineWiki },
      { id: 'inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'item-links', name: 'Item Links', default: true, description: 'Add links to MHCT, MHWiki, mhdb in item popups.', load: itemLinks },
      { id: 'quick-filters-and-sort', name: 'Quick Filters and Sort', default: true, description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.', load: quickFiltersAndSort },
      { id: 'quick-send-supplies', name: 'Quick Send Supplies', default: true, description: 'Hover over the send supplies button to easily send any quantity of SUPER|brie+ or another item..', load: quickSendSupplies },
      { id: 'taller-windows', name: 'Taller Windows', default: true, description: 'Makes popup windows taller.', load: tallerWindows },
      { id: 'tem-crowns', name: 'TEM Crowns', default: true, description: 'Adds crowns and catches to the the Trap Effectiveness Meter.', load: temCrowns },
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
    id: 'location-hud',
    name: 'Location HUD improvements',
    description: 'Add additional information to the HUD for each location.',
    modules: [
      { id: 'cheese-selectors', name: 'Cheese Selectors', default: true, description: 'Adds a quick cheese selector to locations that don\'t have a specific HUD.', load: cheeseSelectors },
      { id: 'balacks-cove', name: 'Balack\'s Cove HUD Improvements', default: true, description: '', load: balacksCove },
      { id: 'forbidden-grove', name: 'Forbidden Grove HUD Improvements', default: true, description: '', load: forbiddenGrove },
      { id: 'fortrox', name: 'Fort Rox HUD Improvements', default: true, description: '', load: fortRox },
      { id: 'iceberg', name: 'Iceberg HUD Improvements', default: true, description: '', load: iceberg },
      { id: 'labyrinth', name: 'Labyrinth HUD Improvements', default: true, description: '', load: labyrinth },
      { id: 'vrift', name: 'Valour Rift HUD Improvements', default: true, description: '', load: vrift },
    ],
  },
  {
    // Always loaded modules.
    id: 'always-loaded',
    modules: [
      // move to toggleable modules
      { id: 'testing', load: testing, alwaysLoad: true },
    ],
  }
];

// enableDebugMode();

const addSettings = () => {
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
    });
  });

  // Load the modules.
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      if (subModule.alwaysLoad) {
        subModule.load();
      } else if (getSetting(subModule.id, subModule.default)) {
        subModule.load();
      }
    });
  });
};

const main = () => {
  addBodyClasses();
  addSettings();
};

// Start it up.
main();









// hg.views.MouseCrownsView.toggleFavouriteHandler(event); return false;
