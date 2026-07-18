/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'skyport-star-tracker.crownstar-mode',
      title: 'Crownstar mode: track 10 catches of each mouse instead of 1',
      default: false,
    },
  ];
};
