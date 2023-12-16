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

export default [
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
