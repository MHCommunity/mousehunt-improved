// Core 'Better' modules
import betterInventory from './modules/better-inventory';
import betterJournal from './modules/better-journal';
import betterMaps from './modules/better-maps';
import betterMarketplace from './modules/better-marketplace';
import betterQuests from './modules/better-quests';
import betterSendSupplies from './modules/better-send-supplies';
import betterSendSuppliesSettings from './modules/better-send-supplies/settings';
import betterShops from './modules/better-shops';
import betterUi from './modules/better-ui';

// Feature modules.
import betterItemView from './modules/better-item-view';
import betterMouseView from './modules/better-mouse-view';
import copyId from './modules/copy-id';
import dashboard from './modules/dashboard';
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
import catchStats from './modules/external/catch-stats';
import fancyKingsReward from './modules/external/fancy-kings-reward';
import giftButtons from './modules/external/gift-buttons';
import journalPrivacy from './modules/external/journal-privacy';
// import minluckAndCre from './modules/external/minluck-and-cre';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';
import shields from './modules/external/shields';
import tallerWindows from './modules/external/taller-windows';
import travelTweaks from './modules/external/travel-tweaks';
import ultimateCheckmark from './modules/external/ultimate-checkmark';

// Global styles and fixes.
import required from './modules/_required';
import testing from './modules/testing';

// Core 'Better' modules.
const modules = [
  {
    id: 'ui-modules',
    name: 'UI',
    description: 'Interface and functionality improvements',
    modules: [
      { id: 'better-inventory', name: 'Better Inventory', default: true, description: 'Updates the inventory layout and appearance and adds a variety of small features.', load: betterInventory },
      { id: 'better-item-view', name: 'Better Item View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing drop rates.', load: betterItemView },
      { id: 'better-journal', name: 'Better Journal', default: true, description: 'Modify the journal text, layout, and styling.', load: betterJournal },
      { id: 'better-maps', name: 'Better Maps', default: true, description: 'Updates the map layout and appearance and adds a variety of small features.', load: betterMaps },
      { id: 'better-marketplace', name: 'Better Marketplace', default: true, description: 'Updates the marketplace layout and appearance and adds a variety of small features.', load: betterMarketplace },
      { id: 'better-mouse-view', name: 'Better Mouse View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing attraction rates.', load: betterMouseView },
      { id: 'better-send-supplies', name: 'Better Send Supplies', default: true, description: 'Adds a variety of features to the Send Supplies page.', load: betterSendSupplies, settings: betterSendSuppliesSettings },
      { id: 'better-shops', name: 'Better Shops', default: true, description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.', load: betterShops },
      { id: 'better-ui', name: 'Better UI', default: true, description: 'Updates the MH interface with a variety of UI and style changes.', load: betterUi },
      { id: 'quests', name: 'Better Quests', default: true, description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and bundles the M400 helper.', load: betterQuests },
    ]
  },
  {
    id: 'feature-modules',
    name: 'Features',
    description: 'Additional features',
    modules: [
      { id: 'copy-id', name: 'Copy ID Button', default: true, description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.', load: copyId },
      { id: 'custom-shields', name: 'Custom Shield', default: false, description: 'Change your shield in the HUD to a variety of different options.', load: shields },
      { id: 'dashboard', name: 'Location Dashboard', default: true, description: 'See location HUD information in a dashboard available in the top dropdown menu.', load: dashboard },
      { id: 'fancy-kings-reward', name: 'Fancy King\'s Reward', default: true, description: 'Automatically clicks the \'Continue\' button after solving a King\'s Reward.', load: fancyKingsReward },
      { id: 'gift-buttons', name: 'Gift Buttons', default: true, description: 'Quickly accept and return all your gifts', load: giftButtons },
      { id: 'hover-profiles', name: 'Hover Profiles', default: true, description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.', load: hoverProfiles },
      { id: 'image-upscaling', name: 'Image Upscaling', default: true, description: 'Uses high-res images with transparent backagrounds across the entire MH interface.', load: imageUpscaling },
      { id: 'inline-wiki', name: 'Inline Wiki', default: true, description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.', load: inlineWiki },
      { id: 'inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'journal-privacy', name: 'Journal Privacy', default: false, description: 'Hides player names in the journal.', load: journalPrivacy },
      { id: 'location-catch-stats', name: 'Location Catch Stats', default: true, description: 'Adds an item under the "Mouse" menu to see your catch stats for the current location.', load: catchStats },
      { id: 'location-huds', name: 'Location HUD Improvements', default: true, description: 'Add additional information to the HUD for each location.', load: locationHud },
      // { id: 'minluck-and-cre', name: ' Minluck & Catch Rate Estimate', default: true, description: 'Shows you the minluck and your estimated catch rate right on the camp page.', load: minluckAndCre },
      { id: 'quick-filters-and-sort', name: 'Quick Filters and Sort', default: true, description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.', load: quickFiltersAndSort },
      { id: 'quick-send-supplies', name: 'Quick Send Supplies', default: true, description: 'Hover over the send supplies button to easily send any quantity of SUPER|brie+ or another item..', load: quickSendSupplies, settings: quickSendSuppliesSettings },
      { id: 'taller-windows', name: 'Taller Windows', default: true, description: 'Makes popup windows taller.', load: tallerWindows },
      { id: 'tem-crowns', name: 'TEM Crowns', default: true, description: 'Adds crowns and catches to the the Trap Effectiveness Meter.', load: temCrowns },
      { id: 'travel-tweaks', name: 'Travel Tweaks', default: true, description: 'Add a variety of features to the travel page.', load: travelTweaks },
      { id: 'ultimate-checkmark', name: 'Ultimate Checkmark', default: false, description: 'Adds more things collect on the items view of your Hunter profile.', load: ultimateCheckmark },
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
      { id: 'required', load: required, alwaysLoad: true },
      { id: 'testing', load: testing, alwaysLoad: true },
    ],
  }
];

const main = () => {
  debug('Starting MH UI');

  addSettingsTab('better-mh-settings', 'Better MH');

  // Add the settings for each module.
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      if (subModule.alwaysLoad) {
        return;
      }

      debug(`Adding settings for ${subModule.name}`);

      addSetting(
        subModule.name,
        subModule.id,
        subModule.default,
        subModule.description,
        { id: module.id, name: module.name, description: module.description },
        'better-mh-settings'
      );

      debug(`Added settings for ${subModule.name}`);

      if (subModule.settings && (subModule.alwaysLoad || getSetting(subModule.id, subModule.default))) {
        debug(`Adding settings for ${subModule.name}`);
        subModule.settings(subModule, module);
      }
    });
  });

  eventRegistry.doEvent('better-mh-before-load');
  // Load the modules.
  modules.forEach((module) => {
    debug(`Loading module ${module.name}`);
    module.modules.forEach((subModule) => {
      debug(`Loading sub-module ${subModule.name}`);
      if (subModule.alwaysLoad) {
        debug(`Loading always-load sub-module ${subModule.name}`);
        subModule.load();
      } else if (getSetting(subModule.id, subModule.default)) {
        debug(`Loading enabled sub-module ${subModule.name}`);
        subModule.load();
      }
    });
  });

  eventRegistry.doEvent('better-mh-after-load');
};

// Start it up.
main();
