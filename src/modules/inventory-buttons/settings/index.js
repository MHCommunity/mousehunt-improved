/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'inventory-buttons.open-one',
      title: '"Open One" button',
      default: true,
    },
    {
      id: 'inventory-buttons.open-all',
      title: '"Open All" button',
      default: true,
    },
    {
      id: 'inventory-buttons.open-all-but-one',
      title: '"Open All But One" button',
      default: false,
    },
    {
      id: 'inventory-buttons.only-open-extras',
      title: 'Lock opening items unless you have more than one',
      default: false,
    },
  ];
};
