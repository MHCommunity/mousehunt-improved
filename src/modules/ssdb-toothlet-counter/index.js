import { addTrapQuantity } from '@utils';

/**
 * Add the trap quantity.
 */
const init = async () => {
  addTrapQuantity({
    baseIds: [3023, 2647],
    baseSlugs: ['upgraded_denture_base', 'denture_base'],
    itemId: 'fulmina_charged_tooth_stat_item'
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'ssdb-teeth-counter',
  name: 'SSDB Toothlet Counter',
  type: 'feature',
  default: true,
  description: 'Show the number of toothlets you have when SSDB is equipped.',
  load: init,
};
