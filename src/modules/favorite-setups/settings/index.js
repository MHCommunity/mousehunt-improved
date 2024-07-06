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
  ];
};
