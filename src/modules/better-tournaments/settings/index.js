/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'better-tournaments.time-inline',
    title: 'Display localized times inline, rather than on hover',
    default: false,
  }];
};
