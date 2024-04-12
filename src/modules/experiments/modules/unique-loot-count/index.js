import { makeElement, onDialogShow, setMultipleTimeout } from '@utils';

const addUniqueLootCount = () => {
  const existing = document.querySelector('#overlayPopup.hunting_summary .lootContainer .label .uniqueLootCount');
  if (existing) {
    return;
  }

  const lootTitle = document.querySelector('#overlayPopup.hunting_summary .lootContainer .label');
  if (! lootTitle) {
    return;
  }

  const loots = document.querySelectorAll('#overlayPopup.hunting_summary .lootContainer a');

  makeElement('span', 'uniqueLootCount', `(${loots.length} unique)`, lootTitle);
};

export default async () => {
  onDialogShow('hunting_summary', () => setMultipleTimeout(addUniqueLootCount, 500, 1000, 3000));
};
