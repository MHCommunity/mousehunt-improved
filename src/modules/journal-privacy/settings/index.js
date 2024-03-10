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
  ];
};
