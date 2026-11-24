import { dbDelete, deleteSetting } from '@utils';

export default {
  version: '0.106.0',
  update: async () => {
    // The game now shows toothlet and printing paper counts on the base itself.
    deleteSetting('better-trap-selector.base-item-counters');
    await Promise.all(['printing_press_charge_stat_item-quantity', 'fulmina_charged_tooth_stat_item-quantity'].map((key) => dbDelete('data', key)));
  },
};
