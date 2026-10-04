/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const layoutOptions = [
    { name: 'Grid', value: 'grid' },
    { name: 'List', value: 'list' },
    { name: 'Icons only', value: 'icons' },
  ];

  return [
    {
      id: 'show-auras.layout',
      title: 'Aura layout',
      default: [layoutOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: layoutOptions,
      },
    },
  ];
};
