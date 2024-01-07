// Core 'Better' modules.
import betterGifts from '@/better-gifts';
import betterInventory from '@/better-inventory';
import betterItemView from '@/better-item-view';
import betterJournal from '@/better-journal';
import betterKingsReward from '@/better-kings-reward';
import betterMaps from '@/better-maps';
import betterMarketplace from '@/better-marketplace';
import betterMice from '@/better-mice';
import betterQuests from '@/better-quests';
import betterSendSupplies from '@/better-send-supplies';
import betterShops from '@/better-shops';
import betterTournaments from '@/better-tournaments';
import betterTravel from '@/better-travel';
import betterUi from '@/better-ui';

// Feature modules.
import catchRateEstimate from '@/catch-rate-estimate';
import copyId from '@/copy-id';
import customShield from '@/custom-shield';
import darkMode from '@/dark-mode';
import dataExporters from '@/data-exporters';
import delayedTooltips from '@/delayed-tooltips';
import flrtHelper from '@/flrt-helper';
import hoverProfiles from '@/hover-profiles';
import imageUpscaling from '@/image-upscaling';
import inlineWiki from '@/inline-wiki';
import keyboardShortcuts from '@/keyboard-shortcuts';
import lgsReminder from '@/lgs-reminder';
import locationCatchStats from '@/location-catch-stats';
import locationDashboard from '@/location-dashboard';
import metric from '@/metric';
import onlyOpenMultiple from '@/only-open-multiple';
import openAllButOne from '@/open-all-but-one';
import pasteHunterId from '@/paste-hunter-id';
import prestigeBaseStats from '@/prestige-base-stats';
import quickFiltersAndSort from '@/quick-filters-and-sort';
import quickSendSupplies from '@/quick-send-supplies';
import tallerWindows from '@/taller-windows';
import temCrowns from '@/tem-crowns';
import ultimateCheckmark from '@/ultimate-checkmark';

// Location HUD module.
import locationHud from '@/location-hud';

// Element hiding modules.
import adblock from '@/adblock';
import journalPrivacy from '@/journal-privacy';
import noFooter from '@/no-footer';
import noShare from '@/no-share';
import noSidebar from '@/no-sidebar';

// All the always loaded modules.
import dev from '@/dev';
import featureFlags from '@/beta-features';
import fixes from '@/fixes';
import globalStyles from '@/global-styles';
import links from '@/links';
import required from '@/required';
import updateMigration from '@/update-migration';
import updateNotifications from '@/update-notifications';
import userHighlighting from '@/user-highlighting';

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
  catchRateEstimate,
  copyId,
  customShield,
  darkMode,
  dataExporters,
  delayedTooltips,
  flrtHelper,
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
  userHighlighting,
  links,
  required,
  updateMigration,
  updateNotifications,
];
