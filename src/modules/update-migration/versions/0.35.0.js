import { databaseDelete, debuglog } from '@utils';
import { moveFlagToSetting, moveSetting } from '../utils';

const settingsToMigrate = [
  { from: 'inventory-lock-and-hide', to: 'inventory-lock-and-hide.items', setTrue: true },
  { from: 'favorite-setups', to: 'favorite-setups.setups', setTrue: true },
  { from: 'better-travel-default-to-simple-travel', to: 'better-travel.default-to-simple-travel' },
  { from: 'better-travel-show-alphabetized-list', to: 'better-travel.show-alphabetized-list' },
  { from: 'better-travel-show-reminders', to: 'better-travel.show-reminders' },
  { from: 'better-travel-travel-window', to: 'better-travel.travel-window' },
  { from: 'better-travel-travel-window-environment-icon', to: 'better-travel.travel-window-environment-icon' },
  { from: 'gift-buttons-send-order-0', to: 'better-gifts.send-order-0' },
  { from: 'gift-buttons-ignore-bad-gifts-0', to: 'better-gifts.ignore-bad-gifts-0' },
  { from: 'better-inventory-one-item-per-row', to: 'better-inventory.one-item-per-row' },
  { from: 'better-inventory-larger-images', to: 'better-inventory.larger-images' },
  { from: 'better-journal-styles', to: 'better-journal.styles' },
  { from: 'better-journal-replacements', to: 'better-journal.replacements' },
  { from: 'better-journal-icons', to: 'better-journal.icons' },
  { from: 'better-journal-icons-minimal', to: 'better-journal.icons-minimal' },
  { from: 'better-journal-list', to: 'better-journal.list' },
  { from: 'better-marketplace-search-all', to: 'better-marketplace.search-all' },
  { from: 'better-marketplace-small-images', to: 'better-marketplace.small-images' },
  { from: 'better-quests-m400-helper', to: 'better-quests.m400-helper' },
  { from: 'send-supplies-pinned-items-0', to: 'better-send-supplies.pinned-items-0' },
  { from: 'send-supplies-pinned-items-1', to: 'better-send-supplies.pinned-items-1' },
  { from: 'send-supplies-pinned-items-2', to: 'better-send-supplies.pinned-items-2' },
  { from: 'send-supplies-pinned-items-3', to: 'better-send-supplies.pinned-items-3' },
  { from: 'send-supplies-pinned-items-4', to: 'better-send-supplies.pinned-items-4' },
  { from: 'better-tournaments-tournament-time-display-inline', to: 'better-tournaments.time-inline' },
  { from: 'journal-changer-change-daily', to: 'journal-changer.change-daily\'' },
  { from: 'journal-changer-change-location', to: 'journal-changer.change-location\'' },
  { from: 'journal-privacy-show-toggle-icon', to: 'journal-privacy.show-toggle-icon\'' },
  { from: 'keyboard-shortcuts', to: 'keyboard-shortcuts.shortcuts', setTrue: true },
  { from: 'lgs-new-style', to: 'lgs-reminder.new-style\'' },
  { from: 'quick-send-supplies-items-0', to: 'quick-send-supplies.items-0' },
  { from: 'quick-send-supplies-items-1', to: 'quick-send-supplies.items-1' },
  { from: 'quick-send-supplies-items-2', to: 'quick-send-supplies.items-2' },
  { from: 'quick-send-supplies-items-3', to: 'quick-send-supplies.items-3' },
  { from: 'ultimate-checkmark-categories-airships', to: 'ultimate-checkmark.show-airships' },
  { from: 'ultimate-checkmark-categories-codex', to: 'ultimate-checkmark.show-codex' },
  { from: 'ultimate-checkmark-categories-currency', to: 'ultimate-checkmark.show-currency' },
  { from: 'ultimate-checkmark-categories-equipment', to: 'ultimate-checkmark.show-equipment' },
  { from: 'ultimate-checkmark-categories-plankrun', to: 'ultimate-checkmark.show-plankrun' },
  { from: 'ultimate-checkmark-categories-treasure_chests', to: 'ultimate-checkmark.show-treasure_chests' },
  { from: 'wisdom-in-stat-bar-auto-refresh', to: 'wisdom-in-stat-bar.auto-refresh' },
  { from: 'has-seen-update-banner', to: 'updates.banner' },
  { from: 'acolyte_realm', to: 'location-huds-enabled.acolyte_realm' },
  { from: 'ancient_city', to: 'location-huds-enabled.ancient_city' },
  { from: 'balacks_cove', to: 'location-huds-enabled.balacks_cove' },
  { from: 'bazaar', to: 'location-huds-enabled.bazaar' },
  { from: 'bountiful_beanstalk', to: 'location-huds-enabled.bountiful_beanstalk' },
  { from: 'calm_clearing', to: 'location-huds-enabled.calm_clearing' },
  { from: 'cape_clawed', to: 'location-huds-enabled.cape_clawed' },
  { from: 'catacombs', to: 'location-huds-enabled.catacombs' },
  { from: 'clawshot_city', to: 'location-huds-enabled.clawshot_city' },
  { from: 'derr_dunes', to: 'location-huds-enabled.derr_dunes' },
  { from: 'desert_city', to: 'location-huds-enabled.desert_city' },
  { from: 'desert_warpath', to: 'location-huds-enabled.desert_warpath' },
  { from: 'dojo', to: 'location-huds-enabled.dojo' },
  { from: 'dracano', to: 'location-huds-enabled.dracano' },
  { from: 'elub_shore', to: 'location-huds-enabled.elub_shore' },
  { from: 'floating_islands', to: 'location-huds-enabled.floating_islands' },
  { from: 'forbidden_grove', to: 'location-huds-enabled.forbidden_grove' },
  { from: 'foreword_farm', to: 'location-huds-enabled.foreword_farm' },
  { from: 'fort_rox', to: 'location-huds-enabled.fort_rox' },
  { from: 'fungal_cavern', to: 'location-huds-enabled.fungal_cavern' },
  { from: 'great_gnarled_tree', to: 'location-huds-enabled.great_gnarled_tree' },
  { from: 'iceberg', to: 'location-huds-enabled.iceberg' },
  { from: 'jungle_of_dread', to: 'location-huds-enabled.jungle_of_dread' },
  { from: 'kings_arms', to: 'location-huds-enabled.kings_arms' },
  { from: 'kings_gauntlet', to: 'location-huds-enabled.kings_gauntlet' },
  { from: 'laboratory', to: 'location-huds-enabled.laboratory' },
  { from: 'labyrinth', to: 'location-huds-enabled.labyrinth' },
  { from: 'lagoon', to: 'location-huds-enabled.lagoon' },
  { from: 'meditation_room', to: 'location-huds-enabled.meditation_room' },
  { from: 'mountain', to: 'location-huds-enabled.mountain' },
  { from: 'mousoleum', to: 'location-huds-enabled.mousoleum' },
  { from: 'moussu_picchu', to: 'location-huds-enabled.moussu_picchu' },
  { from: 'nerg_plains', to: 'location-huds-enabled.nerg_plains' },
  { from: 'pinnacle_chamber', to: 'location-huds-enabled.pinnacle_chamber' },
  { from: 'pollution_outbreak', to: 'location-huds-enabled.pollution_outbreak' },
  { from: 'prologue_pond', to: 'location-huds-enabled.prologue_pond' },
  { from: 'rift_bristle_woods', to: 'location-huds-enabled.rift_bristle_woods' },
  { from: 'rift_burroughs', to: 'location-huds-enabled.rift_burroughs' },
  { from: 'rift_furoma', to: 'location-huds-enabled.rift_furoma' },
  { from: 'rift_gnawnia', to: 'location-huds-enabled.rift_gnawnia' },
  { from: 'rift_valour', to: 'location-huds-enabled.rift_valour' },
  { from: 'rift_whisker_woods', to: 'location-huds-enabled.rift_whisker_woods' },
  { from: 'seasonal_garden', to: 'location-huds-enabled.seasonal_garden' },
  { from: 'slushy_shoreline', to: 'location-huds-enabled.slushy_shoreline' },
  { from: 'ss_huntington_ii', to: 'location-huds-enabled.ss_huntington_ii' },
  { from: 'sunken_city', to: 'location-huds-enabled.sunken_city' },
  { from: 'table_of_contents', to: 'location-huds-enabled.table_of_contents' },
  { from: 'tournament_hall', to: 'location-huds-enabled.tournament_hall' },
  { from: 'town_of_digby', to: 'location-huds-enabled.town_of_digby' },
  { from: 'town_of_gnawnia', to: 'location-huds-enabled.town_of_gnawnia' },
  { from: 'train_station', to: 'location-huds-enabled.train_station' },
  { from: 'windmill', to: 'location-huds-enabled.windmill' },
  { from: 'zugzwang_tower', to: 'location-huds-enabled.zugzwang_tower' },
  { from: 'region-living-garden', to: 'location-huds-enabled.region-living-garden' },
  { from: 'region-queso', to: 'location-huds-enabled.region-queso' },
  { from: 'event-locations', to: 'location-huds-enabled.event-locations' },
  { from: 'visibility-toggles', to: 'location-huds.folklore-forest-visibility-toggles' }
];

const flagsToMigrate = [
  { from: 'raffle', to: 'experiments.raffle' },
  { from: 'lol-gottem', to: 'experiments.lol-gottem' },
  { from: 'favorite-setups-toggle', to: 'experiments.favorite-setups-toggle' },
  { from: 'journal-icons-all', to: 'better-journal.icons' },
  { from: 'journal-icons', to: 'better-journal.icons-minimal' },
  { from: 'journal-list', to: 'better-journal.list' },
  { from: 'lgs-reminder-exact', to: 'lgs-reminder.show-seconds' }
];

const update = async () => {
  debuglog('update-migration', 'Migrating settings');
  for (const setting of settingsToMigrate) {
    moveSetting(setting);
  }

  debuglog('update-migration', 'Migrating flags');
  for (const flag of flagsToMigrate) {
    moveFlagToSetting(flag);
  }

  // Moved to 'mh-improved-<id>' databases in v0.35.0.
  debuglog('update-migration', 'Deleting old databases');
  await databaseDelete('mh-improved');

  localStorage.removeItem('mh-improved-update-notifications');
};

export default {
  id: '0.35.0',
  update,
};
