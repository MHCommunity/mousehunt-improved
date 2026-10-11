/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const allButOneOptions = [
    { name: 'Off', value: 'off' },
    { name: 'Show', value: 'show' },
    { name: 'Show, and lock the other open buttons', value: 'only' },
  ];

  return [
    {
      id: 'inventory-buttons.open-one',
      title: 'Show "Open One" button',
      default: true,
    },
    {
      id: 'inventory-buttons.open-all',
      title: 'Show "Open All" button',
      default: true,
    },
    {
      id: 'inventory-buttons.open-all-but-one',
      title: '"Open All But One" button',
      default: [allButOneOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: allButOneOptions,
      },
    },
  ];
};
