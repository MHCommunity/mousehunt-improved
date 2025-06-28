/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-shops.hide-max-owned',
      title: 'Hide items when you’ve reached the maximum owned',
      default: false,
    },
    {
      id: 'better-shop.qty-buttons',
      title: 'Show quantity buttons',
      default: true,
    }
  ];
};
