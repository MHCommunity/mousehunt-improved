import {
  getCurrentPage,
  getUserItems,
  makeElement,
  onRequest,
  onTurn
} from '@utils';

/**
 * Main function.
 */
const main = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const existingCounter = document.querySelector('.mhui-paper-counter');
  if (existingCounter) {
    existingCounter.remove();
  }

  if (3628 !== Number.parseInt(user.base_item_id, 10)) {
    return;
  }

  const paperDetails = await getUserItems(['printing_press_charge_stat_item'], true);
  const paper = paperDetails[0]?.quantity || 0;

  const counter = document.querySelector('.mh-ui-paper-counter-text');
  if (counter) {
    counter.textContent = paper;
  }

  const trapContainer = document.querySelector('.trapSelectorView__armedItem[data-item-classification="base"] .trapSelectorView__armedItemImage');
  if (! trapContainer) {
    return;
  }

  const newCounter = makeElement('div', ['mhui-paper-counter', 'trapSelectorView__armedItemQuantity']);
  makeElement('span', 'mh-ui-paper-counter-text', paper.toLocaleString(), newCounter);

  trapContainer.append(newCounter);
};

/**
 * Initialize the module.
 */
const init = async () => {
  main();
  onRequest('users/changetrap.php', main);
  onTurn(main, 150);
};

export default {
  id: 'printing-press-paper-counter',
  name: 'Printing Press Paper Counter',
  type: 'feature',
  default: true,
  description: 'Shows the number of Prolific Printing Papers you have when Naughty List Printing Press Base is equipped.',
  load: init,
};
