/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [{
    id: 'override-flags',
    title: 'Feature Flags',
    default: '',
    description: 'Comma separated list of <a href="https://github.com/MHCommunity/mousehunt-improved/wiki/List-of-Feature-Flags" target="_blank">feature flags</a> to enable.',
    settings: {
      type: 'input',
    },
  }];
};
