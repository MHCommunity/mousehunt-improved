/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-journal.styles',
      title: 'Style and UI changes',
      default: true
    },
    {
      id: 'better-journal.replacements',
      title: 'Text replacements',
      default: true
    },
    {
      id: 'better-journal.gold-and-points',
      title: 'Gold and Points icons',
      default: true
    },
    {
      id: 'better-journal.list',
      title: 'Loot as list',
    },
    {
      id: 'better-journal.icons',
      title: 'Loot icons',
    },
    {
      id: 'better-journal.icons-minimal',
      title: 'Loot icons (minimal)',
    },
    {
      id: 'better-journal.item-colors',
      title: 'Unique item colors (Map clues, Ful\'Mina\'s gifts, etc.)',
      default: true
    },
    {
      id: 'better-journal.journal-history',
      title: 'Journal History',
      default: true
    },
    {
      id: 'better-journal.full-mice-images',
      title: 'Full mice images',
      default: false
    },
    {
      id: 'better-journal.highlight-rare-mice',
      title: 'Highlight rare mice catches (currently only Black Widow)',
      default: false
    },
  ];
};
