/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'better-tournaments-tournament-time-display-inline',
    title: 'Display localized times inline',
    default: false,
    description: 'Display localized tournament times inline, rather than on hover.',
  }];
};
