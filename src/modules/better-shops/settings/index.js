/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'better-shops.hide-max-owned',
      title: 'Hide items with maximum quantity owned',
      default: false,
    },
    {
      id: 'better-shop.qty-buttons',
      title: 'Show quantity buttons',
      default: true,
    }
  ];
};
