export default function (subModule, module) {
  addSetting(
    'Show Simple Travel tab by default',
    'better-travel-default-to-simple-travel',
    false,
    'Show the Simple Travel tab by default instead of the map when going to the Travel page.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );

  addSetting(
    'Show Alphabetized List',
    'better-travel-show-alphabetized-list',
    false,
    'Show an alphabetized list of locations on the top of the Simple Travel page.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );

  addSetting(
    'Show Travel Reminders',
    'better-travel-show-reminders',
    true,
    'Show reminders about active resources when visiting certain locations.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );
}
