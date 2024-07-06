import { addStyles, makeElement, onDialogShow, setMultipleTimeout } from '@utils';

import styles from './styles.css';

/**
 * Update the section with the unique loot count.
 *
 * @param {string} selector The selector for the section.
 */
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

/**
 * Add the unique loot count to the sections.
 */
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
const init = async () => {
  addStyles(styles, 'unique-loot-count');

  onDialogShow('hunting_summary', () => setMultipleTimeout(addUniqueLootCount, 500, 1000, 3000));
};

export default {
  id: 'unique-loot-count',
  name: 'Unique loot count in progress log',
  type: 'feature',
  default: true,
  description: 'Shows the number of unique loot items in the progress log',
  load: init,
};
