/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'show-auras.list',
      title: 'Show auras as a list',
      default: false,
      description: '',
    },
    {
      id: 'show-auras.icons',
      title: 'Only show icons',
      default: false,
      description: '',
    },
  ];
};
