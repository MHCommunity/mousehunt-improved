// Utilities
import { addUIStyles } from './utils';

// Global styles
import globalStyles from './styles.css';

// Core 'Better' modules
import inventory from './modules/inventory';
import journal from './modules/journal';
import camp from './modules/camp';
import shops from './modules/shops';
import maps from './modules/maps';

// Features
import imageUpscaling from './modules/image-upscaling';
import tallerWindows from './modules/taller-windows';
import onlyOpenMultiple from './modules/only-open-multiple';
import metric from './modules/metric';

// Removal of things.
import noFooter from './modules/no-footer';
import noShare from './modules/no-share';
import noSidebar from './modules/no-sidebar';

// Bundled misc fixes and things
import misc from './modules/misc';
import wiki from './modules/wiki';

const modules = [
  {
    id: 'mh-ui-better-inventory',
    name: 'Better Inventory',
    default: true,
    description: '',
    load: inventory,
  },
  {
    id: 'mh-ui-better-journal',
    name: 'Better Journal',
    default: true,
    description: '',
    load: journal,
  },
  {
    id: 'mh-ui-better-maps',
    name: 'Better Maps',
    default: true,
    description: '',
    load: maps,
  },
  {
    id: 'mh-ui-better-shops',
    name: 'Better Shops',
    default: true,
    description: '',
    load: shops,
  },
  {
    id: 'mh-ui-better-camp',
    name: 'Better Camp',
    default: true,
    description: '',
    load: camp,
  },
  {
    id: 'mh-ui-inventory-only-open-multiple',
    name: 'Inventory - Only open multiple',
    default: false,
    description: '',
    load: onlyOpenMultiple,
  },
  {
    id: 'mh-ui-no-footer',
    name: 'Remove Footer',
    default: true,
    description: '',
    load: noFooter,
  },
  {
    id: 'mh-ui-no-share',
    name: 'Remove Share Buttons',
    default: true,
    description: '',
    load: noShare,
  },
  {
    id: 'mh-ui-no-sidebar',
    name: 'Remove Sidebar',
    default: false,
    description: '',
    load: noSidebar,
  },
  {
    id: 'mh-ui-taller-windows',
    name: 'Taller Windows',
    default: true,
    description: '',
    load: tallerWindows,
  },
  {
    id: 'mh-ui-misc-image-upscaling',
    name: 'Image Upscaling',
    default: true,
    description: '',
    load: imageUpscaling,
  },
  {
    id: 'mh-ui-misc-fixes',
    name: 'Minor Fixes',
    default: true,
    description: '',
    load: misc,
  },
  {
    id: 'mh-ui-metric',
    name: 'Use Metric Measurements',
    default: false,
    description: '',
    load: metric,
  },
];

addSettingsTab('mh-ui-settings', 'UI Settings');

modules.forEach((module) => {
  addSetting(
    module.name,
    module.id,
    module.default,
    `${module.name} description goes here`,
    { id: 'mh-ui', name: 'MH UI Settings' },
    'mh-ui-settings'
  );
});

modules.forEach((module) => {
  const isEnabled = getSetting(module.id, module.default);
  if (isEnabled) {
    module.load();
  }
});

addUIStyles(globalStyles);

// Load modules that we don't add options for.
wiki();
