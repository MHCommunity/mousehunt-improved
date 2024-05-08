import { addTrapQuantity } from '@utils';

const init = async () => {
  addTrapQuantity({
    baseIds: [3628, 3683],
    baseSlugs: ['naughty_list_printing_press_base', 'folklore_printing_press_base'],
    itemId: 'printing_press_charge_stat_item'
  });
};

export default {
  id: 'printing-press-paper-counter',
  name: 'Printing Press Paper Counter',
  type: 'feature',
  default: true,
  description: 'Shows the number of Prolific Printing Papers you have for the Printing Press bases.',
  load: init,
};
