import { addTrapQuantity } from '@utils';

/**
 * Initialize the module.
 */
const init = async () => {
  addTrapQuantity({
    baseIds: [3023, 2647],
    baseSlugs: ['upgraded_denture_base', 'denture_base'],
    itemId: 'fulmina_charged_tooth_stat_item'
  });
};

export default {
  id: 'ssdb-teeth-counter',
  name: 'SSDB Toothlet Counter',
  type: 'feature',
  default: true,
  description: 'Shows the number of toothlets you have when SSDB is equipped.',
  load: init,
};
