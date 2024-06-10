import { initOpenButtons } from '@utils';

/**
 * Initialize the module.
 */
export default {
  id: 'open-all',
  name: 'Inventory - Open All',
  type: 'feature',
  default: true,
  description: 'Adds an \'Open All\' button to convertible items in your inventory',
  load: initOpenButtons,
};
