/**
 * Add settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-journal-styles',
      title: 'Asterios Mode',
      default: true,
      description: '',
    },
    {
      id: 'better-journal-no-replacements',
      title: 'No Replacements',
      default: false,
      description: '',
    }
  ];
};
