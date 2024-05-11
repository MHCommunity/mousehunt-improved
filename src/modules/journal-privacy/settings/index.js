/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'journal-privacy.show-toggle-icon',
      title: 'Show toggle icon in top menu',
      default: true,
    },
    {
      id: 'journal-privacy.transparent',
      title: 'Make text transparent, rather than blurred',
      default: false,
    }
  ];
};
