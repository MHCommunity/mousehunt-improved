/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'native-dark-mode.enable-mice-page-image-changes',
      title: 'Mice Page Image enhancements',
      description: 'Modify the image display on the mice page',
      default: true,
    },
  ];
};
