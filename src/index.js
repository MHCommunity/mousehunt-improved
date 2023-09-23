// Core 'Better' modules.
import betterUi from './modules/better-ui';
import betterInventory from './modules/better-inventory';
import betterItemView from './modules/better-item-view';
import betterJournal from './modules/better-journal';
import betterMaps from './modules/better-maps';
import betterMarketplace from './modules/better-marketplace';
import betterMouseView from './modules/better-mouse-view';
import betterQuests from './modules/better-quests';
import betterSendSupplies from './modules/better-send-supplies';
import betterSendSuppliesSettings from './modules/better-send-supplies/settings';
import betterShops from './modules/better-shops';
import betterTournaments from './modules/better-tournaments';
import betterTravel from './modules/better-travel';
import betterTravelSettings from './modules/better-travel/settings';

// Feature modules.
import catchStats from './modules/external/catch-stats';
import copyId from './modules/copy-id';
import customShield from './modules/custom-shield';
import customShieldSettings from './modules/custom-shield/settings';
import dashboard from './modules/dashboard';
import giftButtons from './modules/gift-buttons';
import giftButtonsSettings from './modules/gift-buttons/settings';
import hoverProfiles from './modules/hover-profiles';
import imageUpscaling from './modules/image-upscaling';
import inlineWiki from './modules/inline-wiki';
import journalPrivacy from './modules/external/journal-privacy';
import onlyOpenMultiple from './modules/only-open-multiple';
import quickFiltersAndSort from './modules/quick-filters-and-sort';
import quickSendSupplies from './modules/quick-send-supplies';
import quickSendSuppliesSettings from './modules/quick-send-supplies/settings';
import tallerWindows from './modules/external/taller-windows';
import temCrowns from './modules/tem-crowns';
import ultimateCheckmark from './modules/ultimate-checkmark';

// Location HUD module.
import locationHud from './modules/location-hud';
import locationHudSettings from './modules/location-hud/settings.js';

// Element hiding modules.
import adblock from './modules/adblock';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';

// Global styles and fixes.
import required from './modules/_required';

// Core 'Better' modules.
const modules = [
  {
    id: 'mousehunt-improved',
    name: 'MouseHunt Improved',
    description: 'Interface and functionality improvements',
    modules: [
      { id: 'better-ui', name: 'Better UI', default: true, description: 'Updates the MH interface with a variety of UI and style changes.', load: betterUi },
      { id: 'better-inventory', name: 'Better Inventory', default: true, description: 'Updates the inventory layout and appearance and adds a variety of small features.', load: betterInventory },
      { id: 'better-item-view', name: 'Better Item View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing drop rates.', load: betterItemView },
      { id: 'better-journal', name: 'Better Journal', default: true, description: 'Modify the journal text, layout, and styling.', load: betterJournal },
      { id: 'better-maps', name: 'Better Maps', default: true, description: 'Updates the map layout and appearance and adds a variety of small features.', load: betterMaps },
      { id: 'better-marketplace', name: 'Better Marketplace', default: true, description: 'Updates the marketplace layout and appearance and adds a variety of small features.', load: betterMarketplace },
      { id: 'better-mouse-view', name: 'Better Mouse View', default: true, description: 'Add links to MHCT & MHWiki in mouse popups as well as showing attraction rates.', load: betterMouseView },
      { id: 'better-quests', name: 'Better Quests', default: true, description: 'Allows you to open the assignments popup anywhere, improves the UI of the quests tab, and bundles the M400 helper.', load: betterQuests },
      { id: 'better-send-supplies', name: 'Better Send Supplies', default: true, description: 'Adds a variety of features to the Send Supplies page.', load: betterSendSupplies, settings: betterSendSuppliesSettings },
      { id: 'better-shops', name: 'Better Shops', default: true, description: 'Updates the Shop layout and appearance, minimizes owned items that have an inventory limit of 1, and more.', load: betterShops },
      { id: 'better-tournaments', name: 'Better Tournaments', default: true, description: 'Updates the Tournaments UI to show information on hover and a variety of small interface tweaks.', load: betterTournaments },
      { id: 'better-travel', name: 'Better Travel', default: true, description: 'Updates the travel page.', load: betterTravel, settings: betterTravelSettings },
    ]
  },
  {
    id: 'feature-modules',
    name: 'Features',
    description: 'Additional features',
    modules: [
      { id: 'copy-id', name: 'Copy ID Button', default: true, description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.', load: copyId },
      { id: 'custom-shield', name: 'Custom Shield', default: false, description: 'Change your shield in the HUD to a variety of different options.', load: customShield, alwaysLoad: true, settings: customShieldSettings }, // set to always load so that rather than enable/disable, you can just change the shield back to default.
      { id: 'dashboard', name: 'Location Dashboard', default: true, description: 'See location HUD information in a dashboard available in the top dropdown menu.', load: dashboard },
      { id: 'gift-buttons', name: 'Gift Buttons', default: true, description: 'Quickly accept and return all your gifts', load: giftButtons, settings: giftButtonsSettings },
      { id: 'hover-profiles', name: 'Hover Profiles', default: true, description: 'Hover over a friend\'s name in your journal, inbox, or elsewhere and get a mini-profile popup.', load: hoverProfiles },
      { id: 'image-upscaling', name: 'Image Upscaling', default: true, description: 'Uses high-res images with transparent backagrounds across the entire MH interface.', load: imageUpscaling },
      { id: 'inline-wiki', name: 'Inline Wiki', default: true, description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.', load: inlineWiki },
      { id: 'inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'journal-privacy', name: 'Hide player names in journal entries', default: false, description: 'Hides player names in the journal.', load: journalPrivacy },
      { id: 'location-catch-stats', name: 'Location Catch Stats', default: true, description: 'Adds an item under the "Mouse" menu to see your catch stats for the current location.', load: catchStats },
      // { id: 'minluck-and-cre', name: ' Minluck & Catch Rate Estimate', default: true, description: 'Shows you the minluck and your estimated catch rate right on the camp page.', load: minluckAndCre },
      { id: 'quick-filters-and-sort', name: 'Quick Filters and Sort', default: true, description: 'Add quick filters and sorting to the trap, base, charm, and cheese selectors.', load: quickFiltersAndSort },
      { id: 'quick-send-supplies', name: 'Quick Send Supplies', default: true, description: 'Hover over the send supplies button to easily send any quantity of SUPER|brie+ or another item..', load: quickSendSupplies, settings: quickSendSuppliesSettings },
      { id: 'taller-windows', name: 'Taller Windows', default: true, description: 'Makes popup windows taller.', load: tallerWindows },
      { id: 'tem-crowns', name: 'TEM Crowns', default: true, description: 'Adds crowns and catches to the the Trap Effectiveness Meter.', load: temCrowns },
      { id: 'ultimate-checkmark', name: 'Ultimate Checkmark', default: false, description: 'Adds more things collect on the items view of your Hunter profile.', load: ultimateCheckmark },
    ]
  },
  {
    id: 'location-hud',
    name: 'Location HUDs',
    description: 'Location-specific HUD improvements',
    modules: [
      { id: 'location-huds', name: 'Location HUD Improvements', default: true, description: '', load: locationHud, alwaysLoad: true, settings: locationHudSettings },
    ],
  },
  {
    id: 'remove-elements',
    name: 'Hide Page Elements',
    modules: [
      { id: 'adblock', name: 'Adblock', default: false, description: 'Hides advertisements for Feedback Friday, mobile apps, news ticker, etc.', load: adblock },
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
    ],
  }
];

const main = () => {
  addSettingsTab('mousehunt-improved-settings', 'MH Improved');

  // Add the settings for each module.
  modules.forEach((module) => {
    module.modules.forEach((subModule) => {
      if (! subModule.alwaysLoad) {
        addSetting(
          subModule.name,
          subModule.id,
          subModule.default,
          subModule.description,
          { id: module.id, name: module.name, description: module.description },
          'mousehunt-improved-settings'
        );
      }

      if (subModule.settings && (subModule.alwaysLoad || getSetting(subModule.id, subModule.default))) {
        subModule.settings(subModule, module);
      }
    });
  });

  eventRegistry.doEvent('mousehunt-improved-settings-before-load');
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

  addMouseripLink();

  eventRegistry.doEvent('mousehunt-improved-settings-after-load');
};

// Start it up.
main();
