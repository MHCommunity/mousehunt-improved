import { deleteSetting, getSetting, saveSetting } from '@utils';

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

export default replaceSettingsWithFlags;
