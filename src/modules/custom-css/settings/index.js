/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'override-styles',
      live: true,
      title: 'Custom CSS Styles',
      default: '',
      description: 'Add your own <a href="https://github.com/MHCommunity/mousehunt-improved/wiki/Custom-CSS" target="_blank" rel="noreferrer">custom CSS</a> to the game.',
      settings: {
        type: 'textarea',
      },
    },
  ];
};
