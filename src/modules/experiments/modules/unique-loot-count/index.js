import { addStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import styles from './styles.css';

const updateSection = async (selector) => {
  const section = document.querySelector(`#overlayPopup.hunting_summary .${selector}`);
  if (! section) {
    return;
  }

  const existing = section.querySelector('.uniqueLootCount');
  if (existing) {
    return;
  }

  const loots = section.querySelectorAll('a');
  const count = makeElement('span', 'uniqueLootCount', `(${loots.length} unique)`);

  const header = section.querySelector('.label');
  header.append(count);
};

const addUniqueLootCount = async () => {
  const sections = [
    'environmentContainer',
    'baitContainer',
    'lootContainer',
  ];

  sections.forEach((section) => updateSection(section));
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'unique-loot-count');

  onDialogShow('hunting_summary', () => setMultipleTimeout(addUniqueLootCount, 500, 1000, 3000));
};
