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

  const existingCounter = document.querySelector('.mhui-ssdb-teeth-counter');
  if (existingCounter) {
    existingCounter.remove();
  }

  if (3023 !== Number.parseInt(user.base_item_id, 10)) {
    return;
  }

  const teethDetails = await getUserItems(['fulmina_charged_tooth_stat_item'], true);
  const teeth = teethDetails[0]?.quantity || 0;

  const counter = document.querySelector('.mh-ui-ssdb-teeth-counter-text');
  if (counter) {
    counter.textContent = teeth;
  }

  const trapContainer = document.querySelector('.trapSelectorView__armedItem[data-item-classification="base"] .trapSelectorView__armedItemImage');
  if (! trapContainer) {
    return;
  }

  const newCounter = makeElement('div', ['mhui-ssdb-teeth-counter', 'trapSelectorView__armedItemQuantity']);
  makeElement('span', 'mh-ui-ssdb-teeth-counter-text', teeth.toLocaleString(), newCounter);

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
  id: 'ssdb-teeth-counter',
  name: 'SSDB Toothlet Counter',
  type: 'feature',
  default: true,
  description: 'Shows the number of toothlets you have when SSDB is equipped.',
  load: init,
};
