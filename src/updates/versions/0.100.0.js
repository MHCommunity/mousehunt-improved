import { defaultHiddenMenuItems, deleteSetting, getSetting, saveSetting } from '@utils';

/**
 * Move a setting to a new key, keeping its value only if it was saved.
 *
 * @param {string} oldKey The old key.
 * @param {string} newKey The new key.
 */
const moveSetting = (oldKey, newKey) => {
  const value = getSetting(oldKey, null);
  if (null !== value) {
    saveSetting(newKey, value);
  }

  deleteSetting(oldKey);
};

/**
 * Remove settings that are now feature flags. If a setting was saved with the given value, the
 * flag is suggested in the update summary rather than added, since the saved value may not have
 * been a deliberate choice.
 *
 * @param {Array} replacements The [setting, flag, label, value] sets. The value defaults to false.
 */
const replaceSettingsWithFlags = (replacements) => {
  const flags = new Set(
    getSetting('override-flags', '')
      .split(',')
      .map((flag) => flag.trim())
      .filter(Boolean)
  );

  const suggestions = getSetting('update-suggested-flags', []);
  for (const [setting, flag, label, value = false] of replacements) {
    if (value === getSetting(setting, null) && !flags.has(flag) && !suggestions.some((suggestion) => suggestion.flag === flag)) {
      suggestions.push({ flag, label });
    }

    deleteSetting(setting);
  }

  if (suggestions.length) {
    saveSetting('update-suggested-flags', suggestions);
  }
};

/**
 * Move the Journal Privacy, Location HUD, and Adventure Book toggles into Custom Menu.
 */
const migrateMenuItems = () => {
  const layout = getSetting('custom-menu.layout', null);
  const hidden = new Set(Array.isArray(layout?.hidden) ? layout.hidden : defaultHiddenMenuItems);

  if (false === getSetting('journal-privacy.show-toggle-icon', true)) {
    hidden.add('mousehunt-improved-journal-privacy');
  }

  if (getSetting('location-huds.location-hud-toggle', false)) {
    hidden.delete('mousehunt-improved-location-huds');
  } else {
    hidden.add('mousehunt-improved-location-huds');
  }

  if (getSetting('show-adventure-book', false)) {
    hidden.delete('mousehunt-improved-adventure-book');
  } else {
    hidden.add('mousehunt-improved-adventure-book');
  }

  // Only save a layout if there's one already, or the result isn't just the defaults.
  const isDefault = hidden.size === defaultHiddenMenuItems.length && defaultHiddenMenuItems.every((id) => hidden.has(id));
  if (layout || !isDefault) {
    saveSetting('custom-menu.layout', { ...layout, hidden: [...hidden] });
  }

  deleteSetting('journal-privacy.show-toggle-icon');
  deleteSetting('location-huds.location-hud-toggle');
  deleteSetting('show-adventure-book');
};

/**
 * Merge the separate Hide modules into Hide page elements.
 */
const migrateHidePageElements = () => {
  const ads = getSetting('adblock', null);
  const share = getSetting('no-share', null);

  // Hide ads used to hide the share buttons too.
  if (ads || null !== share) {
    saveSetting('hide-page-elements.hide-share', Boolean(ads) || share);
  }

  deleteSetting('no-share');
  moveSetting('adblock', 'hide-page-elements.hide-ads');
  moveSetting('no-footer', 'hide-page-elements.hide-footer');
  moveSetting('hide-game-info-bar', 'hide-page-elements.hide-game-info-bar');
  moveSetting('hide-news-ticker', 'hide-page-elements.hide-news-ticker');
  moveSetting('hide-daily-draw', 'hide-page-elements.hide-daily-draw');
  moveSetting('hide-daily-reward-popup', 'hide-page-elements.hide-daily-reward-popup');
  moveSetting('no-sidebar', 'hide-page-elements.hide-sidebar');
};

/**
 * Merge Delayed Menus and Delayed Tooltips into Hover delays.
 */
const migrateHoverDelays = () => {
  moveSetting('delayed-menus', 'hover-delays.menus');
  moveSetting('delayed-tooltips', 'hover-delays.tooltips');
};

/**
 * Merge Copy ID Button and Paste Hunter ID into Hunter ID shortcuts.
 */
const migrateHunterIdShortcuts = () => {
  const copy = getSetting('copy-id', null);
  const hideButton = getSetting('copy-id-button.hide-button', null);

  if (false === copy) {
    saveSetting('hunter-id-shortcuts.copy-0', 'off');
  } else if (hideButton) {
    saveSetting('hunter-id-shortcuts.copy-0', 'profile-picture');
  }

  deleteSetting('copy-id');
  deleteSetting('copy-id-button.hide-button');
  moveSetting('paste-hunter-id', 'hunter-id-shortcuts.paste');
};

/**
 * Merge the trap selector modules and Better UI's trap selector options into Better Trap Selector.
 */
const migrateBetterTrapSelector = () => {
  // Better UI's trap selector options did nothing while Better UI was off.
  const betterUiEnabled = getSetting('better-ui', true);
  const betterUiOptions = [
    ['better-ui.larger-skin-images', 'better-trap-selector.larger-skin-images'],
    ['better-ui.show-unowned-skins', 'better-trap-selector.show-unowned-skins'],
    ['better-ui.trap-gradient-background', 'better-trap-selector.trap-gradient-background'],
    ['better-ui.larger-codices', 'better-trap-selector.larger-codices'],
  ];

  for (const [oldKey, newKey] of betterUiOptions) {
    if (betterUiEnabled) {
      moveSetting(oldKey, newKey);
    } else {
      saveSetting(newKey, false);
      deleteSetting(oldKey);
    }
  }

  if (getSetting('hide-codices', false)) {
    saveSetting('better-trap-selector.codex-position-0', 'hidden');
  } else if (!betterUiEnabled || false === getSetting('better-ui.codex-at-bottom', true)) {
    saveSetting('better-trap-selector.codex-position-0', 'original');
  }

  deleteSetting('hide-codices');
  deleteSetting('better-ui.codex-at-bottom');

  moveSetting('quick-filters-and-sort', 'better-trap-selector.quick-filters-and-sort');
  moveSetting('trap-selector-special-effects', 'better-trap-selector.special-effects');
  deleteSetting('hide-trap-selector-tooltips');
  moveSetting('real-base-stats', 'better-trap-selector.real-base-stats');

  // Base Item Counters replaced two older counter modules.
  const legacyCounters = ['printing-press-paper-counter', 'ssdb-teeth-counter'].map((key) => getSetting(key, null)).filter((value) => null !== value);
  const counters = getSetting('base-item-counters', null) ?? (legacyCounters.length ? legacyCounters.some(Boolean) : null);
  if (null !== counters) {
    saveSetting('better-trap-selector.base-item-counters', counters);
  }

  deleteSetting('base-item-counters');
  deleteSetting('printing-press-paper-counter');
  deleteSetting('ssdb-teeth-counter');
};

/**
 * Combine the two Sorted tab toggles, and the two aura layout toggles, into pickers.
 */
const migratePickers = () => {
  if (getSetting('better-maps.default-to-sorted', false)) {
    saveSetting('better-maps.open-sorted-tab-0', 'always');
  } else if (false === getSetting('better-maps.default-to-sorted-if-map-group-exists', true)) {
    saveSetting('better-maps.open-sorted-tab-0', 'never');
  }

  deleteSetting('better-maps.default-to-sorted');
  deleteSetting('better-maps.default-to-sorted-if-map-group-exists');

  // Icons only took priority over the list.
  if (getSetting('show-auras.icons', false)) {
    saveSetting('show-auras.layout-0', 'icons');
  } else if (getSetting('show-auras.list', false)) {
    saveSetting('show-auras.layout-0', 'list');
  }

  deleteSetting('show-auras.icons');
  deleteSetting('show-auras.list');
};

export default {
  version: '0.100.0',
  update: async () => {
    migrateMenuItems();
    migrateHidePageElements();
    migrateHoverDelays();
    migrateHunterIdShortcuts();
    migrateBetterTrapSelector();
    migratePickers();

    // The large horn timer is now always available in Better UI.
    deleteSetting('big-timer');

    moveSetting('replace-favicon', 'better-ui.replace-favicon');

    // Inline Wiki and the rare mouse highlight have been removed.
    deleteSetting('inline-wiki');
    deleteSetting('better-journal.highlight-rare-mice');

    // The Journal Progress Log Tracker countdown is always shown now.
    deleteSetting('journal-log-tracker.show-countdown');

    replaceSettingsWithFlags([
      ['better-marketplace.value-column', 'better-marketplace-no-value-column', 'Hide the marketplace value column'],
      ['better-marketplace.highlight-last-viewed', 'better-marketplace-no-highlight-last-viewed', "Don't highlight the last viewed marketplace item"],
      ['better-shops.hide-max-owned', 'better-shops-hide-max-owned', 'Hide shop items at their inventory limit', true],
      ['better-journal.icons-minimal', 'better-journal-icons-minimal', 'Use minimal loot icons in the journal', true],
      ['better-travel.travel-window', 'better-travel-no-travel-window', 'Turn off the Travel Window'],
      ['better-travel.travel-window-environment-icon', 'better-travel-no-travel-window-environment-icon', 'Turn off the environment icon Travel Window shortcut'],
      ['better-maps.community', 'better-maps-show-inactive-community-maps', 'Show inactive maps in Community Maps'],
      ['better-maps.show-map-solver-links', 'better-maps-no-solver-links', 'Hide map solver links'],
      ['better-quests.m400-helper', 'better-quests-no-m400-helper', 'Turn off the M400 helper'],
      ['better-tournaments.time-inline', 'better-tournaments-time-on-hover', 'Show tournament times on hover instead of inline'],
      ['favorite-setups.show-location-favorites', 'favorite-setups-no-location-favorites', "Don't show setups for your current location at the top"],
    ]);
  },
};
