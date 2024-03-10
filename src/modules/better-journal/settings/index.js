/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-journal.styles',
      title: 'Journal styles',
      default: true,
    },
    {
      id: 'better-journal.replacements',
      title: 'Journal text replacements',
      default: true,
    },
    {
      id: 'better-journal.icons',
      title: 'Show loot icons',
    },
    {
      id: 'better-journal.icons-minimal',
      title: 'Show loot icons (minimal)',
    },
    {
      id: 'better-journal.list',
      title: 'Show loot as list',
    }
  ];
};
