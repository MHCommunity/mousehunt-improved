/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'journal-privacy.transparent',
      title: 'Hide text instead of blurring it',
      default: false,
    },
  ];
};
