export default function (subModule, module) {
  const options = [
    {
      name: 'Newest to Oldest',
      value: 'default',
    },
    {
      name: 'Oldest to Newest',
      value: 'reverse',
    },
  ];

  addSetting(
    'Order to send',
    'gift-buttons-send-order',
    [options[0]],
    'Whether to send gifts from newest received to oldest received or the other way around.',
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
}
