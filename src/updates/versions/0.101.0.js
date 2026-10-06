import { deleteSetting, getSetting, saveSetting } from '@utils';

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

    // Item Abbreviation Search no longer has per-page options.
    for (const surface of ['inventory', 'trap-selector', 'marketplace', 'send-supplies']) {
      deleteSetting(`enhanced-search.${surface}`);
    }
  },
};
