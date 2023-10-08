export default function (subModule, module) {
  const orderOptions = [
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
    [orderOptions[0]],
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
      options: orderOptions,
    }
  );

  const skipBadGiftOptions = [
    {
      name: 'Skip all non-GOTD gifts',
      value: 'skip',
    },
    {
      name: 'Don\'t skip any gifts',
      value: 'no-skip',
    },
    {
      name: 'Skip Mozzarella Cheese only',
      value: 'mozzarella',
    },
    {
      name: 'Skip Stale Cheese only',
      value: 'stale',
    },
    {
      name: 'Skip Radioactive Sludge only',
      value: 'sludge',
    },
    {
      name: 'Skip Mozz. Cheese & Stale Cheese',
      value: 'mozzarella-stale',
    },
    {
      name: 'Skip Mozz. Cheese & Radioactive Sludge',
      value: 'mozzarella-sludge',
    },
    {
      name: 'Skip Stale Cheese & Radioactive Sludge',
      value: 'stale-sludge',
    },
  ];

  addSetting(
    'Ignore gifts that aren\'t the Gift of the Day',
    'gift-buttons-ignore-bad-gifts',
    [skipBadGiftOptions[0]],
    'Skip sending over Mozzarella Cheese, Stale Cheese, and Radioactive Sludge.',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings',
    {
      type: 'multi-select',
      number: 1,
      options: skipBadGiftOptions,
    }
  );

  addSetting(
    'Close popup after sending',
    'gift-buttons-close-on-send',
    true,
    'Automatically close the Gift popup after sending gifts',
    {
      id: module.id,
      name: module.name,
      description: module.description
    },
    'mousehunt-improved-settings'
  );
}
