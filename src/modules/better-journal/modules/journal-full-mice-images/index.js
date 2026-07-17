import { addStyles, getData, onJournalEntry } from '@utils';

import styles from './styles.css';

let mice;
let silhouettes = new Map();

let sheet = null;
const declared = new Set();

/**
 * Declare a mouse's silhouette as a custom property in a stylesheet of our own.
 *
 * The URL is deliberately kept out of the element's style attribute — see the note
 * on declareSilhouette in native-dark-mode/mice-images, which uses the same pattern.
 *
 * @param {Object} mouse Mouse to declare, from the mice-silhouettes data.
 */
const declareSilhouette = (mouse) => {
  if (declared.has(mouse.type)) {
    return;
  }

  declared.add(mouse.type);

  if (!sheet) {
    const element = document.createElement('style');
    element.id = 'mh-improved-styles-better-journal-silhouettes';
    document.head.append(element);
    sheet = element.sheet;
  }

  sheet.insertRule(`[data-mh-mouse="${mouse.type}"] { --mh-silhouette-large: url("${mouse.large}"); }`, sheet.cssRules.length);
};

/**
 * Mask the white background out of a full-size mouse image.
 *
 * A mouse with no silhouette data is left alone and keeps the plain white
 * background from the stylesheet.
 *
 * @param {Element} image     The journal entry's image element.
 * @param {string}  mouseType The mouse type to resolve.
 */
const maskMouseImage = (image, mouseType) => {
  const silhouette = silhouettes.get(mouseType);
  if (!silhouette?.large) {
    return;
  }

  declareSilhouette(silhouette);
  image.setAttribute('data-mh-mouse', silhouette.type);
  image.setAttribute('data-mh-mask', '');
};

const makeFullMouseImage = async (model) => {
  const entry = model.el;
  if (!entry || !entry.classList) {
    return;
  }

  const isCatchEntry = entry.classList.contains('catchsuccessloot') || entry.classList.contains('catchsuccess') || entry.classList.contains('catchsuccessprize');

  let mouseType = null;
  if (!isCatchEntry) {
    const isRh = entry.classList.contains('relicHunter_catch');
    if (isRh) {
      const journalImage = entry.querySelector('.journalimage img');
      if (journalImage) {
        journalImage.src = 'https://i.mouse.rip/rh-transparent.png';
        return;
      }
    }
    return;
  }

  mouseType = model.mouseType;
  if (!mouseType) {
    return;
  }

  const image = entry.querySelector('.journalimage img');
  if (!image) {
    return;
  }

  const mouse = mice.find((m) => m.type === mouseType);
  if (!mouse) {
    return;
  }

  if (mouse?.images?.large) {
    image.src = mouse.images.large;
    maskMouseImage(image, mouseType);
  }
};

const main = () => {
  onJournalEntry(makeFullMouseImage, {
    id: 'journal-full-mice-images',
    stage: 'images',
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-full-mice-images');

  const [miceData, silhouetteData] = await Promise.all([getData('mice'), getData('mice-silhouettes')]);

  mice = miceData;
  if (Array.isArray(silhouetteData)) {
    silhouettes = new Map(silhouetteData.map((mouse) => [mouse.type, mouse]));
  }

  main();
};
