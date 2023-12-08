import { addMhuiSetting } from '@/utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
  addMhuiSetting(
    'better-tournaments-tournament-time-display-inline',
    'Display localized times inline',
    false,
    'By default, the localized tournament times are displayed on hover. This setting will display them inline instead.',
    module
  );
}
