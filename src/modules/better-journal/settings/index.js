/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-journal.styles',
      title: 'Apply style and UI changes',
      default: true,
    },
    {
      id: 'better-journal.replacements',
      title: 'Apply text replacements',
      default: true,
    },
    {
      id: 'better-journal.gold-and-points',
      title: 'Show gold and points icons',
      default: true,
    },
    {
      id: 'better-journal.list',
      title: 'Show loot as a list',
      default: true,
    },
    {
      id: 'better-journal.icons',
      title: 'Show loot icons',
      default: true,
    },
    {
      id: 'better-journal.item-colors',
      title: "Color special items (map clues, Ful'Mina's gifts, etc.)",
      default: true,
    },
    {
      id: 'better-journal.journal-history',
      title: 'Show journal history',
      default: true,
    },
    {
      id: 'better-journal.full-mice-images',
      title: 'Show full mouse images',
      default: false,
    },
  ];
};
