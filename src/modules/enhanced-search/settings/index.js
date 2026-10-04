/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'enhanced-search.inventory',
      title: 'Inventory',
      default: true,
    },
    {
      id: 'enhanced-search.trap-selector',
      title: 'Trap Selector',
      default: true,
    },
    {
      id: 'enhanced-search.marketplace',
      title: 'Marketplace',
      default: true,
    },
    {
      id: 'enhanced-search.send-supplies',
      title: 'Send Supplies',
      default: true,
    },
  ];
};
