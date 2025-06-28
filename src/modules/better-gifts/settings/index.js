/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
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
      seperator: true,
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
      name: 'Skip Mozzarella & Stale Cheese',
      value: 'mozzarella-stale',
    },
    {
      name: 'Skip Mozzarella & Radioactive Sludge',
      value: 'mozzarella-sludge',
    },
    {
      name: 'Skip Stale Cheese & Radioactive Sludge',
      value: 'stale-sludge',
    },
  ];

  return [
    {
      id: 'better-gifts.send-order',
      title: 'Order to accept/send',
      default: [orderOptions[0]],
      description: '',
      settings: {
        type: 'multi-select',
        number: 1,
        options: orderOptions,
      }
    },
    {
      id: 'better-gifts.ignore-bad-gifts',
      title: 'Ignore gifts',
      default: [skipBadGiftOptions[0]],
      description: '',
      settings: {
        type: 'multi-select',
        number: 1,
        options: skipBadGiftOptions,
      }
    }
  ];
};
