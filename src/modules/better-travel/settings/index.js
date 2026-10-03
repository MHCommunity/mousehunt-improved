/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-travel.default-to-simple-travel',
      title: 'Always open Simple Travel tab',
      default: false,
    },
    {
      id: 'better-travel.show-alphabetized-list',
      title: 'Show alphabetized list on Simple Travel tab',
      default: false,
    },
    {
      id: 'better-travel.show-reminders',
      title: 'Show travel reminders',
      default: true,
    },
    {
      id: 'better-travel.travel-window',
      title: 'Add a Travel Window to the Travel menu',
      default: true,
    },
    {
      id: 'better-travel.travel-window-environment-icon',
      title: 'Open Travel Window when clicking the environment icon',
      default: true,
    },
  ];
};
