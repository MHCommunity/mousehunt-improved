/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'lgs-reminder.new-style',
      live: true,
      title: 'Use new layout style',
    },
    {
      id: 'lgs-reminder.days-and-lower',
      live: true,
      title: 'Display time in days only',
    },
  ];
};
