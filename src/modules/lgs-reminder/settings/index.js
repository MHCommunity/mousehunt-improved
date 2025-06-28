/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'lgs-reminder.new-style',
      title: 'Use new layout style',
    },
    {
      id: 'lgs-reminder.days-and-lower',
      title: 'Display time in days only',
    }
  ];
};
