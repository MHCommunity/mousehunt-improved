// Utilities
import { addUIStyles } from './utils';

// Global styles
import globalStyles from './styles.css';

// Core 'Better' modules
import inventory from './modules/inventory';
import journal from './modules/journal';
import maps from './modules/maps';
import quests from './modules/quests';
import shops from './modules/shops';
import ui from './modules/ui';

// Feature modules.
import onlyOpenMultiple from './modules/only-open-multiple';
import dashboard from './modules/dashboard';
import wiki from './modules/wiki';
import misc from './modules/misc';
import travelReminders from './modules/travel-reminders';

// Copies of standalone userscripts.
import imageUpscaling from './modules/external/image-upscaling';
import noFooter from './modules/external/no-footer';
import noShare from './modules/external/no-share';
import noSidebar from './modules/external/no-sidebar';
import tallerWindows from './modules/external/taller-windows';

// Location HUD improvements.
import iceberg from './modules/areas/iceberg';
import labyrinth from './modules/areas/labyrinth';
import vrift from './modules/areas/vrift';

// Core 'Better' modules.
const modules = [
  {
    id: 'better-mh-core-modules',
    name: 'Core Modules',
    description: 'Interface and functionality improvements',
    modules: [
      { id: 'better-mh-better-inventory', name: 'Better Inventory', default: true, description: '', load: inventory },
      { id: 'better-mh-better-journal', name: 'Better Journal', default: true, description: 'Modify the journal text, layout, and styling.', load: journal },
      { id: 'better-mh-better-maps', name: 'Better Maps', default: true, description: '', load: maps },
      { id: 'better-mh-quests', name: 'Better Quests', default: false, description: '', load: quests },
      { id: 'better-mh-better-shops', name: 'Better Shops', default: true, description: '', load: shops },
      { id: 'better-mh-better-ui', name: 'Better UI', default: true, description: '', load: ui },
      { id: 'better-mh-misc-styles', name: 'Minor Style Changes', default: true, description: '', load: misc },
    ]
  },
  {
    id: 'better-mh-feature-modules',
    name: 'Feature Modules',
    description: 'Additional features',
    modules: [
      { id: 'better-mh-dashboard', name: 'Location Dashboard', default: true, description: 'Show a location information dashboard in the top dropdown menu.', load: dashboard },
      { id: 'better-mh-inventory-only-open-multiple', name: 'Inventory - Only open multiple', default: false, description: 'Lock opening things in your inventory unless you have multiple of them.', load: onlyOpenMultiple },
      { id: 'better-mh-taller-windows', name: 'Taller Windows', default: true, description: '', load: tallerWindows },
      { id: 'better-mh-travel-reminders', name: 'Travel Reminders', default: true, description: 'Show a reminder of activated resources when you travel to a location.', load: travelReminders },
      { id: 'better-mh-misc-image-upscaling', name: 'Image Upscaling', default: true, description: '', load: imageUpscaling },
    ]
  },
  {
    id: 'better-mh-remove-elements',
    name: 'Remove elements',
    modules: [
      { id: 'better-mh-no-footer', name: 'Remove Footer', default: true, description: '', load: noFooter },
      { id: 'better-mh-no-share', name: 'Remove Share Buttons', default: true, description: '', load: noShare },
      { id: 'better-mh-no-sidebar', name: 'Remove Sidebar', default: false, description: '', load: noSidebar },
    ],
  },
  {
    id: 'better-mh-location-hud',
    name: 'Location HUD improvements',
    description: 'Add additional information to the HUD for each location.',
    modules: [
      { id: 'better-mh-iceberg', name: 'Iceberg HUD Improvements', default: true, description: '', load: iceberg },
      { id: 'better-mh-labyrinth', name: 'Labyrinth HUD Improvements', default: true, description: '', load: labyrinth },
      { id: 'better-mh-vrift', name: 'Valour Rift HUD Improvements', default: true, description: '', load: vrift },
    ],
  },
  {
    // Always loaded modules.
    id: 'better-mh-always-loaded',
    modules: [
      { id: 'better-mh-wiki', load: wiki, alwaysLoad: true },
    ],
  },
];

addSettingsTab('better-mh-settings', 'UI Settings');
// enableDebugMode();

debug('Starting MH UI');
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
  debug(`Loading module: ${module.id}`);
  module.modules.forEach((subModule) => {
    if (subModule.alwaysLoad) {
      subModule.load();
      debug(`Autoloaded submodule: ${subModule.id}`);
    } else if (getSetting(subModule.id, subModule.default)) {
      subModule.load();
      debug(`Loaded submodule ${subModule.id}`);
    } else {
      debug(`Skipped submodule ${subModule.id}`);
    }
  });
});

addUIStyles(globalStyles);
