/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-marketplace-search-all',
      title: 'Default to showing all items in search',
      default: false,
      description: '',
    },
    {
      id: 'better-marketplace-small-images',
      title: 'Use smaller images in marketplace',
      default: false,
      description: '',
    }
  ];
};
