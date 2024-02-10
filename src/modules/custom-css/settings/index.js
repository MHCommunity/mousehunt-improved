/**
 * Add settings for the module.
 */
export default async () => {
  return [{
    id: 'style-overrides',
    title: 'Custom Styles',
    default: '',
    description: '<a href="https://github.com/MHCommunity/mousehunt-improved/wiki/Custom-CSS" target="_blank">Custom CSS</a> to apply to MouseHunt.',
    settings: {
      type: 'textarea',
    },
  }];
};
