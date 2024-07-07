import { initOpenButtons } from '@utils';

/**
 * Initialize the module.
 */
export default {
  id: 'open-all-but-one',
  name: 'Inventory - Open All but One',
  type: 'feature',
  default: true,
  description: 'Add an “Open All But One” button to convertible items in your inventory.',
  load: initOpenButtons,
};
