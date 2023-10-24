export default function (subModule, module) {
  addSetting(
    'Paste ID anywhere to go to a Hunter Profile',
    'better-ui-friends-paste-id',
    true,
    'Paste a Hunter ID anywhere to go to that Hunter\'s profile.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );
}
