import { getSetting } from '@utils';

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
    },
    {
      id: 'better-journal.gold-and-points',
      title: 'Show gold and points icons',
      default: true,
    },
    {
      id: 'better-journal.item-colors',
      title: 'Unique item colors (Map clues, Ful\'Mina\'s gifts, etc.)',
      default: true,
    },
    {
      id: 'better-journal.journal-history',
      title: 'Journal History',
      default: getSetting('experiments.journal-history', true),
    },
  ];
};
