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
      title: 'Use the new layout',
    },
    {
      id: 'lgs-reminder.days-and-lower',
      live: true,
      title: 'Show time in days only',
    },
  ];
};
