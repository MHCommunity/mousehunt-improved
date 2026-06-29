/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'journal-log-tracker.show-countdown',
      title: 'Show next-log countdown in the journal button',
      default: true,
    },
  ];
};
