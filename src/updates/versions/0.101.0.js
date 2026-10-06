import { deleteSetting, getMultiSelectCount, getMultiSelectSetting, getSetting, saveSetting } from '@utils';

/**
 * Merge Hover Profiles, Emotes, Scoreboard Search on Profiles, and Better UI's friend and
 * profile options into Better Friends.
 */
const migrateBetterFriends = () => {
  // The Better UI options did nothing while Better UI was off.
  const betterUiEnabled = getSetting('better-ui', true);
  const moves = [
    ['hover-profiles', 'better-friends.hover-profiles', true],
    ['emotes', 'better-friends.emotes', true],
    ['better-ui.profile-changes', 'better-friends.egg-master', betterUiEnabled],
    ['better-ui.friends-on-maps', 'better-friends.friends-on-maps', betterUiEnabled],
  ];

  for (const [oldKey, newKey, keepValue] of moves) {
    const value = getSetting(oldKey, null);
    if (!keepValue) {
      saveSetting(newKey, false);
    } else if (null !== value) {
      saveSetting(newKey, value);
    }

    deleteSetting(oldKey);
  }

  deleteSetting('profile-scoreboard-search');
};

/**
 * Suggest the square profile pictures flag to anyone who had the setting on.
 */
const migrateSquareProfilePics = () => {
  const flag = 'better-ui-square-profile-pics';
  const flags = getSetting('override-flags', '')
    .split(',')
    .map((item) => item.trim());
  const suggestions = getSetting('update-suggested-flags', []);

  if (
    getSetting('better-ui', true) &&
    true === getSetting('better-ui.square-profile-pics', null) &&
    !flags.includes(flag) &&
    !suggestions.some((suggestion) => suggestion.flag === flag)
  ) {
    suggestions.push({ flag, label: 'Use square profile pictures' });
    saveSetting('update-suggested-flags', suggestions);
  }

  deleteSetting('better-ui.square-profile-pics');
};

/**
 * Turn the old Quick Items menu into a Custom Menu pin, keeping its place in the menu and how it was shown.
 *
 * The pin keeps the old tab's id, so it stays where it was in Custom Menu. If the old menu was turned
 * off, there's nothing pinned.
 */
const migrateQuickItemsMenu = () => {
  const id = 'quick-items-menu';
  const itemKey = `${id}.item`;

  // The old menu pinned the Kilohertz Processor until another item was picked.
  const items = getMultiSelectSetting(itemKey, ['kilohertz_processor_convertible']);
  const itemCount = getMultiSelectCount(itemKey);

  if (getSetting(id, false)) {
    saveSetting('quick-items-menu.pins', [{ id, items: [...new Set(items.filter((item) => item && 'none' !== item))] }]);

    // It was shown as an icon by default, with its quantity.
    const layout = getSetting('custom-menu.layout', null) || {};
    saveSetting('custom-menu.layout', {
      ...layout,
      styles: { ...layout.styles, [id]: layout.styles?.[id] || 'icon' },
      options: { ...layout.options, [id]: { quantity: layout.options?.[id]?.quantity ?? true } },
    });
  }

  // Pins are always available now, so the old toggle and item picker are gone.
  deleteSetting(id);
  for (let slot = 0; slot < itemCount; slot++) {
    deleteSetting(`${itemKey}-${slot}`);
  }

  deleteSetting(`${itemKey}-count`);
};

export default {
  version: '0.101.0',
  update: async () => {
    // Quick Send Supplies is now a setting in Better Send Supplies.
    const quickSend = getSetting('quick-send-supplies', null);
    if (null !== quickSend) {
      saveSetting('better-send-supplies.quick-send', quickSend);
    }

    // Quick send only runs with Better Send Supplies, so turn it on for anyone still using quick send.
    if (false !== quickSend && false === getSetting('better-send-supplies', true)) {
      saveSetting('better-send-supplies', true);
    }

    deleteSetting('quick-send-supplies');

    migrateBetterFriends();
    migrateSquareProfilePics();
    migrateQuickItemsMenu();

    // Item Abbreviation Search no longer has per-page options.
    for (const surface of ['inventory', 'trap-selector', 'marketplace', 'send-supplies']) {
      deleteSetting(`enhanced-search.${surface}`);
    }
  },
};
