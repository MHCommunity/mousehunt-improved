import { addStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import styles from './styles.css';

const updateSection = async (selector) => {
  const section = document.querySelector(`#overlayPopup.hunting_summary .${selector} .label`);
  if (! section) {
    return;
  }

  const existing = section.querySelector('.uniqueLootCount');
  if (existing) {
    return;
  }

  const loots = section.querySelectorAll('a');
  makeElement('span', 'uniqueLootCount', `(${loots.length} unique)`, section);
};

const addUniqueLootCount = async () => {
  const sections = [
    'environmentContainer',
    'baitContainer',
    'lootContainer',
  ];

  sections.forEach((section) => updateSection(section));
};

export default async () => {
  addStyles(styles, 'unique-loot-count');

  onDialogShow('hunting_summary', () => setMultipleTimeout(addUniqueLootCount, 500, 1000, 3000));
};
