import {
  clearCaches,
  debug,
  getSetting,
  getSettings,
  saveSetting
} from '@utils';

import { cleanupCacheArSettings, cleanupSettings, removeOldEventFavoriteLocations } from './settings-cleanup';
import { migrateJournalChangerDate, migrateQuestsCache, migrateSettings, migrateWisdomStat } from './settings-migrate';

/**
 * Check if the version is new.
 *
 * @param {string} version The version to check.
 *
 * @return {boolean} True if it's a new version, false otherwise.
 */
const isNewVersion = (version) => {
  const currentVersion = mhImprovedVersion;

  // If it's not set, then it's a new install (or an update from before this was added).
  if (version === null) {
    return true;
  }

  // If it's not the same, then it's an update.
  if (version !== currentVersion) {
    return true;
  }

  // Otherwise, it's the same version.
  return false;
};

/**
 * Clean up settings on update.
 *
 * @param {string} previousVersion The previous version.
 */
const cleanOnUpdate = (previousVersion) => {
  const current = getSettings();
  localStorage.setItem('mh-improved-settings-backup', JSON.stringify(current));

  migrateSettings([
    {
      from: 'inventory-lock-and-hide', // Updated in v0.35.0.
      to: 'inventory-lock-and-hide.items',
      setTrue: true,
    },
    {
      from: 'favorite-setups', // Updated in v0.35.0.
      to: 'favorite-setups.setups',
      setTrue: true,
    },
    {
      from: 'better-travel-default-to-simple-travel',
      to: 'better-travel.default-to-simple-travel'
    },
    {
      from: 'better-travel-show-alphabetized-list',
      to: 'better-travel.show-alphabetized-list'
    },
    {
      from: 'better-travel-show-reminders',
      to: 'better-travel.show-reminders'
    },
    {
      from: 'better-travel-travel-window',
      to: 'better-travel.travel-window'
    },
    {
      from: 'better-travel-travel-window-environment-icon',
      to: 'better-travel.travel-window-environment-icon'
    },
    {
      from: 'gift-buttons-send-order-0',
      to: 'better-gifts.send-order-0'
    },
    {
      from: 'gift-buttons-ignore-bad-gifts-0',
      to: 'better-gifts.ignore-bad-gifts-0'
    },
    {
      from: 'better-inventory-one-item-per-row',
      to: 'better-inventory.one-item-per-row'
    },
    {
      from: 'better-inventory-larger-images',
      to: 'better-inventory.larger-images'
    },
    {
      from: 'better-journal-styles',
      to: 'better-journal.styles'
    },
    {
      from: 'better-journal-replacements',
      to: 'better-journal.replacements'
    },
    {
      from: 'better-journal-icons',
      to: 'better-journal.icons'
    },
    {
      from: 'better-journal-icons-minimal',
      to: 'better-journal.icons-minimal'
    },
    {
      from: 'better-journal-list',
      to: 'better-journal.list'
    },
    {
      from: 'better-marketplace-search-all',
      to: 'better-marketplace.search-all'
    },
    {
      from: 'better-marketplace-small-images',
      to: 'better-marketplace.small-images'
    },
    {
      from: 'better-quests-m400-helper',
      to: 'better-quests.m400-helper'
    },
    {
      from: 'send-supplies-pinned-items-0',
      to: 'better-send-supplies.pinned-items-0'
    },
    {
      from: 'send-supplies-pinned-items-1',
      to: 'better-send-supplies.pinned-items-1'
    },
    {
      from: 'send-supplies-pinned-items-2',
      to: 'better-send-supplies.pinned-items-2'
    },
    {
      from: 'send-supplies-pinned-items-3',
      to: 'better-send-supplies.pinned-items-3'
    },
    {
      from: 'send-supplies-pinned-items-4',
      to: 'better-send-supplies.pinned-items-4'
    },
    {
      from: 'better-tournaments-tournament-time-display-inline',
      to: 'better-tournaments.tournament-time-display-inline'
    },
    {
      from: 'journal-changer-change-daily',
      to: 'journal-changer.change-daily',
    },
    {
      from: 'journal-changer-change-location',
      to: 'journal-changer.change-location',
    },
    {
      from: 'journal-privacy-show-toggle-icon',
      to: 'journal-privacy.show-toggle-icon',
    },
    {
      from: 'keyboard-shortcuts',
      to: 'keyboard-shortcuts.shortcuts',
      setTrue: true,
    },
    {
      from: 'lgs-new-style',
      to: 'lgs-reminder.new-style',
    },
    {
      from: 'quick-send-supplies-items-0',
      to: 'quick-send-supplies.items-0'
    },
    {
      from: 'quick-send-supplies-items-1',
      to: 'quick-send-supplies.items-1'
    },
    {
      from: 'quick-send-supplies-items-2',
      to: 'quick-send-supplies.items-2'
    },
    {
      from: 'quick-send-supplies-items-3',
      to: 'quick-send-supplies.items-3'
    },
    {
      from: 'ultimate-checkmark-categories-airships',
      to: 'ultimate-checkmark.show-airships'
    },
    {
      from: 'ultimate-checkmark-categories-codex',
      to: 'ultimate-checkmark.show-codex'
    },
    {
      from: 'ultimate-checkmark-categories-currency',
      to: 'ultimate-checkmark.show-currency'
    },
    {
      from: 'ultimate-checkmark-categories-equipment',
      to: 'ultimate-checkmark.show-equipment'
    },
    {
      from: 'ultimate-checkmark-categories-plankrun',
      to: 'ultimate-checkmark.show-plankrun'
    },
    {
      from: 'ultimate-checkmark-categories-treasure_chests',
      to: 'ultimate-checkmark.show-treasure_chests'
    },
    {
      from: 'wisdom-in-stat-bar-auto-refresh',
      to: 'wisdom-in-stat-bar.auto-refresh'
    },
    {
      from: 'has-seen-onboarding',
      to: 'updates.onboarding',
    },
    {
      from: 'has-seen-update-banner',
      to: 'updates.banner'
    }
  ]);

  migrateQuestsCache();
  migrateWisdomStat();
  migrateJournalChangerDate();

  cleanupCacheArSettings();

  removeOldEventFavoriteLocations();

  cleanupSettings([
    `mh-improved-cached-ar-v${previousVersion}`,
    'mh-improved-update-notifications', // Updated in v0.28.0.
  ]);
};

/**
 * Initialize the update migration.
 */
const init = async () => {
  const installedVersion = getSetting('mh-improved-version', null);
  if (! isNewVersion(installedVersion)) {
    return;
  }

  debug(`New version: ${mhImprovedVersion}, updating from ${installedVersion}`);

  cleanOnUpdate(installedVersion);

  clearCaches();

  saveSetting('mh-improved-version', mhImprovedVersion);
  saveSetting('mh-improved-platform', mhImprovedPlatform);
};

export default {
  id: 'update-migration',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
