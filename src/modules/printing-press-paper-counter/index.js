import { addTrapQuantity } from '@utils';

const init = async () => {
  addTrapQuantity({
    baseIds: [3628],
    baseSlugs: ['naughty_list_printing_press_base'],
    itemId: 'printing_press_charge_stat_item'
  });
};

export default {
  id: 'printing-press-paper-counter',
  name: 'Printing Press Paper Counter',
  type: 'feature',
  default: true,
  description: 'Shows the number of Prolific Printing Papers you have when Naughty List Printing Press Base is equipped.',
  load: init,
};
