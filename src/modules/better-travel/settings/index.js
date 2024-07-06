/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-travel.default-to-simple-travel',
      title: 'Show Simple Travel tab by default',
      default: false,
    },
    {
      id: 'better-travel.show-alphabetized-list',
      title: 'Show alphabetized list on Simple Travel tab',
      default: false,
    },
    {
      id: 'better-travel.show-reminders',
      title: 'Show Travel Reminders',
      default: true,
    },
    {
      id: 'better-travel.travel-window',
      title: 'Travel Window',
      default: true,
    },
    {
      id: 'better-travel.travel-window-environment-icon',
      title: 'Environment icon opens Travel Window',
      default: true,
    }
  ];
};
