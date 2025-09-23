import { migrateSetting } from '@utils';

export default {
  version: '0.89.0',
  update: async () => {
    migrateSetting('open-all', 'inventory-buttons.open-all');
    migrateSetting('open-all-but-one', 'inventory-buttons.open-all-but-one');
    migrateSetting('only-open-multiple', 'inventory-buttons.only-open-extras');
  }
};
