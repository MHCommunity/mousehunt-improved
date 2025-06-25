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
    }
  ];
};
