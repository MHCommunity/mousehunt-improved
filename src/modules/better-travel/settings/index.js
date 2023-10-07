export default function (subModule, module) {
  const options = [
    {
      name: 'Default Tab',
      value: 'default',
    },
    {
      name: 'Simple Travel',
      value: 'simple',
    },
    {
      name: 'Simple Travel with Alphabetical Sorting',
      value: 'simple-alpha',
    },
  ];

  addSetting(
    'Default Travel Tab',
    'better-travel-default-tab',
    [options[0]],
    'Which tab to show by default on the travel page. The alphabetical sorting option will show above the simple travel list.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings',
    {
      type: 'multi-select',
      number: 1,
      options,
    }
  );

  addSetting(
    'Show Travel Reminders',
    'better-travel-reminders',
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
