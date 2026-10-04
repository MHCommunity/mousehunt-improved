import { addTrapQuantity } from '@utils/shared/trap-quantity';

const COUNTERS = [
  {
    baseIds: [3628, 3683],
    baseSlugs: ['naughty_list_printing_press_base', 'folklore_printing_press_base'],
    itemId: 'printing_press_charge_stat_item',
  },
  {
    baseIds: [3023, 2647],
    baseSlugs: ['upgraded_denture_base', 'denture_base'],
    itemId: 'fulmina_charged_tooth_stat_item',
  },
];

/**
 * Add the supported base item counters.
 */
const init = async () => {
  for (const counter of COUNTERS) {
    await addTrapQuantity(counter);
  }
};

export default init;
