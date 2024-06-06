/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'journal-changer.change-daily',
      title: 'Randomize daily',
      default: false,
    },
    {
      id: 'journal-changer.change-location',
      title: 'Change based on location',
      default: false,
    },
  ];
};
