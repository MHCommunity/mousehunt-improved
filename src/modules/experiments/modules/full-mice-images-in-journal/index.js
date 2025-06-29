import { addStyles, getData, onJournalEntry } from '@utils';

import styles from './styles.css';

let mice;

const main = () => {
  onJournalEntry(async (entry) => {
    const isCatchEntry = entry.classList.contains('catchsuccessloot') ||
      entry.classList.contains('catchsuccess') ||
      entry.classList.contains('catchsuccessprize');

    if (! isCatchEntry) {
      return;
    }

    const mouseType = entry.getAttribute('data-mouse-type');
    if (! mouseType) {
      return;
    }

    const image = entry.querySelector('.journalimage img');
    if (! image) {
      return;
    }

    const mouse = mice.find((m) => m.type === mouseType);
    if (! mouse) {
      return;
    }

    if (mouse?.images?.square) {
      image.src = mouse.images.square;
    }
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'full-mice-images-in-journal');

  mice = await getData('mice');
  main();
};

export default {
  id: 'experiments.full-mice-images-in-journal',
  name: 'Full Mice Images in Journal',
  load: init,
};
