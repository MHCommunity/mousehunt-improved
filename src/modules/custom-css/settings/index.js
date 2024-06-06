/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'override-styles',
    title: 'Custom Styles',
    default: '',
    description: '<a href="https://github.com/MHCommunity/mousehunt-improved/wiki/Custom-CSS" target="_blank" rel="noopener noreferrer">Custom CSS</a> to apply',
    settings: {
      type: 'textarea',
    },
  }];
};
