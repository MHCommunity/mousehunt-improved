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
    description: 'Enable <a href="https://github.com/MHCommunity/mousehunt-improved/blob/main/docs/feature-flags.md" target="_blank" rel="noreferrer">feature flags</a>. Separate flags with commas.',
    settings: {
      type: 'input',
    },
  }];
};
