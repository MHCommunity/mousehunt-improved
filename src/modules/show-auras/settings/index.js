/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'show-auras.list',
      title: 'Show auras as a horizontal list',
      default: false,
    },
    {
      id: 'show-auras.icons',
      title: 'Only show aura icons (no text)',
      default: false,
    },
  ];
};
