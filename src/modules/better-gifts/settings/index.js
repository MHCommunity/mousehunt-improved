/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  const orderOptions = [
    {
      name: 'Newest to oldest',
      value: 'default',
    },
    {
      name: 'Oldest to newest',
      value: 'reverse',
    },
  ];

  const skipBadGiftOptions = [
    {
      name: 'All except Gift of the Day',
      value: 'skip',
    },
    {
      name: 'None',
      value: 'no-skip',
    },
    {
      seperator: true,
    },
    {
      name: 'Mozzarella Cheese',
      value: 'mozzarella',
    },
    {
      name: 'Stale Cheese',
      value: 'stale',
    },
    {
      name: 'Radioactive Sludge',
      value: 'sludge',
    },
    {
      name: 'Mozzarella Cheese & Stale Cheese',
      value: 'mozzarella-stale',
    },
    {
      name: 'Mozzarella Cheese & Radioactive Sludge',
      value: 'mozzarella-sludge',
    },
    {
      name: 'Stale Cheese & Radioactive Sludge',
      value: 'stale-sludge',
    },
  ];

  return [
    {
      id: 'better-gifts.send-order',
      live: true,
      title: 'Gift order',
      default: [orderOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: orderOptions,
      },
    },
    {
      id: 'better-gifts.ignore-bad-gifts',
      live: true,
      title: 'Skipped gifts',
      default: [skipBadGiftOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: skipBadGiftOptions,
      },
    },
  ];
};
