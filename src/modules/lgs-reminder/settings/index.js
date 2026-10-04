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
      title: 'Show the timer in a tab below the shield',
    },
    {
      id: 'lgs-reminder.days-and-lower',
      live: true,
      title: 'Use days, hours, and minutes',
    },
  ];
};
