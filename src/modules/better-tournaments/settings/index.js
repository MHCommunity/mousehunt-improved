/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'better-tournaments.time-inline',
    title: 'Show localized times inline (instead of on hover)',
    default: false,
  }];
};
