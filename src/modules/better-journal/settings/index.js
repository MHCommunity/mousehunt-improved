import { getFlag } from '@utils';

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
      description: '',
    },
    {
      id: 'better-journal.replacements',
      title: 'Journal text replacements',
      default: true,
      description: '',
    },
    {
      id: 'better-journal.icons',
      title: 'Show loot icons',
      default: getFlag('journal-icons-all'),
      description: '',
    },
    {
      id: 'better-journal.icons-minimal',
      title: 'Show loot icons (minimal)',
      default: getFlag('journal-icons'),
      description: '',
    },
    {
      id: 'better-journal.list',
      title: 'Show loot as list',
      default: getFlag('journal-list'),
      description: '',
    }
  ];
};
