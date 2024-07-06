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
    description: 'Comma separated list of <a href="https://github.com/MHCommunity/mousehunt-improved/blob/main/docs/feature-flags.md" target="_blank" rel="noopener noreferrer">feature flags</a> to enable.',
    settings: {
      type: 'input',
    },
  }];
};
