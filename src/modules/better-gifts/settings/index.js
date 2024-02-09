import { addMhuiSetting } from '@utils';

/**
 * Add settings for the module.
 *
 * @param {Object} module The module to add settings for.
 */
export default function (module) {
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

  return addMhuiSetting(
    'gift-buttons-send-order',
    'Order to send',
    [orderOptions[0]],
    'Whether to send gifts from newest received to oldest received or the other way around.',
    module,
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

  return addMhuiSetting(
    'gift-buttons-ignore-bad-gifts',
    'Ignore gifts that aren\'t the Gift of the Day',
    [skipBadGiftOptions[0]],
    'Skip sending over Mozzarella Cheese, Stale Cheese, and Radioactive Sludge.',
    module,
    {
      type: 'multi-select',
      number: 1,
      options: skipBadGiftOptions,
    }
  );
}
