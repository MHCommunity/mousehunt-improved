/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'lgs-reminder.new-style',
      title: 'Use "new" style',
    },
    {
      id: 'lgs-reminder.show-seconds',
      title: 'Show exact time',
      description: 'Show exact time, including seconds',
    },
    {
      id: 'lgs-reminder.days-and-lower',
      title: 'Convert weeks and months to days',
    }
  ];
};
