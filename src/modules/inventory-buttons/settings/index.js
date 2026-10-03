/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
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
      title: 'Show "Open All But One" button',
      default: false,
    },
    {
      id: 'inventory-buttons.only-open-extras',
      title: 'Only allow "Open All But One"',
      default: false,
    },
  ];
};
