/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-daily-draw.sort-oldest-first',
      title: 'Sort by oldest first',
      default: false,
      description: 'Sort Daily Draw raffle tickets by oldest first instead of newest first.',
      settings: {
        type: 'boolean',
      }
    }
  ];
};
