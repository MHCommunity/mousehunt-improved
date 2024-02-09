import {
  addStyles,
  getCurrentPage,
  getUserItems,
  makeElement,
  onRequest,
  onTurn
} from '@utils';

const hasSsdbEquipped = () => {
  return (3023 === Number.parseInt(user.base_item_id, 10));
};

const main = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  if (! hasSsdbEquipped()) {
    const existingCounter = document.querySelector('.mhui-ssdb-teeth-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    return;
  }

  const teethDetails = await getUserItems(['fulmina_charged_tooth_stat_item'], true);
  const teeth = teethDetails[0]?.quantity || 0;

  const counter = document.querySelector('.mh-ui-ssdb-teeth-counter-text');
  if (counter) {
    counter.textContent = teeth;
  }

  const trapContainer = document.querySelector('.campPage-trap-armedItem.base .campPage-trap-armedItem-image');
  if (! trapContainer) {
    return;
  }

  const newCounter = makeElement('div', ['mhui-ssdb-teeth-counter', 'quantity']);
  makeElement('span', 'mh-ui-ssdb-teeth-counter-text', teeth.toLocaleString(), newCounter);

  trapContainer.append(newCounter);
};

export default async () => {
  addStyles(`.mhui-ssdb-teeth-counter {
    right: 1px;
    bottom: -8px;
  }`, 'ssdb-teeth');

  main();
  onRequest('users/changetrap.php', main);
  onTurn(main, 150);
};
