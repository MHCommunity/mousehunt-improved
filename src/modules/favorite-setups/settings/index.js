/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'favorite-setups.show-mobile-favorites',
      title: 'Include mobile favorites',
      default: false,
    },
    {
      id: 'favorite-setups.show-location-favorites',
      title: 'Highlight setups for current location at the top',
      default: true,
    },
    {
      id: 'favorite-setups.use-generated-names',
      title: 'Use generated names for setups',
      description: 'If enabled, setups will be named based on their components and location via an AI model.',
      default: true,
    }
  ];
};
