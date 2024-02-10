import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default async (module) => {
  const localTime = await addMhuiSetting(
    'better-tournaments-tournament-time-display-inline',
    'Display localized times inline',
    false,
    'Display localized tournament times are inline, rather than on hover.',
    module
  );

  return [localTime];
};
