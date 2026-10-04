/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const codexOptions = [
    { name: 'At the bottom', value: 'bottom' },
    { name: 'Where the game puts it', value: 'original' },
    { name: 'Hidden', value: 'hidden' },
  ];

  return [
    {
      id: 'better-trap-selector.quick-filters-and-sort',
      title: 'Show quick filters and sort buttons',
      description: 'Filter by power type and sort by power, luck, and more in one click.',
      default: true,
    },
    {
      id: 'better-trap-selector.special-effects',
      title: 'Mark items with special effects',
      description: 'Add a dot to items with special effects, including ones that only work at your current location.',
      default: true,
    },
    {
      id: 'better-trap-selector.hide-tooltips',
      title: 'Hide item description tooltips',
      default: false,
    },
    {
      id: 'better-trap-selector.larger-skin-images',
      title: 'Skins: Show larger images',
      default: true,
    },
    {
      id: 'better-trap-selector.show-unowned-skins',
      title: 'Skins: Show unowned skins',
      default: true,
    },
    {
      id: 'better-trap-selector.trap-gradient-background',
      title: 'Add a background gradient to your trap',
      default: false,
    },
    {
      id: 'better-trap-selector.larger-codices',
      title: 'Codex: Show larger images',
      default: true,
    },
    {
      id: 'better-trap-selector.codex-position',
      title: 'Codex: Position',
      default: [codexOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: codexOptions,
      },
    },
    {
      id: 'better-trap-selector.real-base-stats',
      title: 'Bases: Show the real stats for variable bases',
      description: 'Prestige, Hailstone, Denture, and Printing Press bases.',
      default: true,
    },
    {
      id: 'better-trap-selector.base-item-counters',
      title: 'Bases: Show toothlet and printing paper counts',
      default: true,
    },
  ];
};
