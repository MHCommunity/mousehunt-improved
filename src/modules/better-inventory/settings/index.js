export default function (subModule, module) {
  addSetting(
    'Add \'Open All but One\' Buttons',
    'better-inventory-open-all-but-one',
    true,
    'Add \'Open All but One\' buttons to convertible items in the inventory.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );

  addSetting(
    'Only Open Multiple',
    'better-inventory-lock-open-all',
    false,
    'Lock opening things in your inventory unless you have more than one',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );
}
