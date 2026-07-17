import { addStyles, getCurrentPage, getData, getSetting, onJournalEntry, onNavigation } from '@utils';

import styles from './styles.css';

/**
 * Silhouette data, keyed by mouse type.
 *
 * @type {Map<string, Object>}
 */
let silhouettes = new Map();

let listObserver = null;
let isQueued = false;

let sheet = null;
const declared = new Set();

/**
 * Declare a mouse's silhouettes as custom properties in a stylesheet of our own.
 *
 * These deliberately never go in the element's style attribute. `upscaled-mice-images.css`
 * upgrades images with ~1300 rules shaped like
 * `[style*="<silhouette_medium url>"] { background-image: url(<silhouette_large>) !important }`,
 * so an inline `--mh-silhouette` holding a silhouette URL makes the tile match its own
 * upscaling rule: the art gets replaced by the silhouette, and the overlay then blends the
 * silhouette against itself. Keying the declaration off the mouse type instead keeps every
 * URL out of the attribute those selectors read.
 *
 * @param {Object} mouse Mouse to declare, from the mice-silhouettes data.
 */
const declareSilhouette = (mouse) => {
  if (declared.has(mouse.type) || !mouse.large) {
    return;
  }

  declared.add(mouse.type);

  if (!sheet) {
    const element = document.createElement('style');
    element.id = 'mh-improved-styles-native-dark-mode-silhouettes';
    document.head.append(element);
    sheet = element.sheet;
  }

  sheet.insertRule(
    `[data-mh-mouse="${mouse.type}"] {
    --mh-silhouette-large: url("${mouse.large}");
    --mh-silhouette-medium: url("${mouse.medium}");
    --mh-art: url("${mouse.art}");
  }`,
    sheet.cssRules.length
  );
};

/**
 * Point an element at its mouse's silhouette.
 *
 * The stylesheet only touches elements carrying this attribute, so a mouse we can't
 * resolve a silhouette for is simply left alone.
 *
 * @param {Element} element Element with the mouse image as its background.
 * @param {Object}  mouse   Mouse to resolve, from the mice-silhouettes data.
 */
const setSilhouette = (element, mouse) => {
  // Mice with no silhouette to overlay are only here for their uncaught blend mode.
  if (!mouse.large) {
    return;
  }

  declareSilhouette(mouse);
  element.setAttribute('data-mh-mouse', mouse.type);
};

/**
 * Resolve the silhouette for every mouse tile in the mouse list.
 *
 * The tile's mouse type comes from its onclick handler, which the game renders as
 * `hg.views.MouseView.show('mouse_type')`. Keying off the type rather than the image
 * URL means this keeps working when the game re-uploads a mouse image.
 */
const updateMouseList = () => {
  // The popup observer fires for every kind of popup, so bail before searching the
  // whole document on pages that have no mouse list at all.
  if (!document.querySelector('.mouseListView')) {
    return;
  }

  const tiles = document.querySelectorAll('.mouseListView-categoryContent-subgroup-mouse.gallery:not([data-mh-checked])');

  for (const tile of tiles) {
    // Mark first, so a mouse we have no data for isn't looked at again.
    tile.setAttribute('data-mh-checked', '');

    const type = tile.getAttribute('onclick')?.match(/MouseView\.show\('([^']+)'/)?.[1];
    if (!type) {
      continue;
    }

    const mouse = silhouettes.get(type);
    if (!mouse) {
      continue;
    }

    const image = tile.querySelector('.mouseListView-categoryContent-subgroup-mouse-margin');
    if (!image) {
      continue;
    }

    if (mouse.uncaughtBlend) {
      image.setAttribute('data-mh-blend', mouse.uncaughtBlend);
    }

    setSilhouette(image, mouse);

    // Only a caught tile shows the real art. An uncaught one is already showing the
    // silhouette, so repainting it with the art would give the mouse away.
    if (mouse.art && tile.classList.contains('caught')) {
      image.setAttribute('data-mh-mask', '');
    }
  }
};

/**
 * Resolve the silhouette for the mouse shown in the MouseView popup.
 */
const updateMouseView = () => {
  const view = document.querySelector('#overlayPopup .mouseView[data-type]');
  if (!view) {
    return;
  }

  const image = view.querySelector('.mouseView-imageContainer .mouseView-image:not([data-mh-mouse])');
  if (!image) {
    return;
  }

  // The popup renders in a loading state before the mouse itself arrives, and has a
  // spinner rather than the art until it does. It's left alone until there's something
  // to knock the background out of, and picked up on the re-render.
  if (!image.style.backgroundImage) {
    return;
  }

  const mouse = silhouettes.get(view.getAttribute('data-type'));
  if (!mouse?.large) {
    return;
  }

  setSilhouette(image, mouse);

  image.setAttribute('data-mh-mask', '');
};

/**
 * Resolve the silhouette for a full-size mouse image in a journal entry.
 *
 * This runs after the journal's image stage, where Better Journal replaces the
 * thumbnail with the full-size art.
 *
 * @param {Object} model Journal entry model.
 */
const updateJournalMouseImage = (model) => {
  const entry = model.el;
  const isCatchEntry = entry.classList.contains('catchsuccessloot') || entry.classList.contains('catchsuccess') || entry.classList.contains('catchsuccessprize');

  if (!isCatchEntry || !model.mouseType) {
    return;
  }

  const image = entry.querySelector('.journalimage img');
  const mouse = silhouettes.get(model.mouseType);
  if (!image || !mouse?.large) {
    return;
  }

  setSilhouette(image, mouse);
  image.setAttribute('data-mh-mask', '');
};

/**
 * Re-resolve both surfaces on the next frame.
 *
 * Both are cheap and idempotent, as they skip anything already resolved, so they're
 * batched together rather than tracking which one actually changed.
 */
const queueUpdate = () => {
  if (isQueued) {
    return;
  }

  isQueued = true;

  requestAnimationFrame(() => {
    isQueued = false;
    updateMouseList();
    updateMouseView();
  });
};

/**
 * Watch the mouse list for re-renders.
 *
 * Clicking a category or subgroup rebuilds the list without a navigation event, so
 * the container is observed rather than hooking each of the game's handlers. Only
 * childList is watched, so setting our own attributes doesn't retrigger it.
 */
const watchMouseList = () => {
  // The list may already be rendered by the time we get here, so it's always resolved
  // rather than waiting on the observer to report a change that has already happened.
  queueUpdate();

  if (listObserver) {
    return;
  }

  const container = document.querySelector('#mousehuntContainer');
  if (!container) {
    return;
  }

  listObserver = new MutationObserver(queueUpdate);
  listObserver.observe(container, { childList: true, subtree: true });
};

/**
 * Stop watching the mouse list.
 *
 * The observer covers the whole page container, so leaving it attached after navigating
 * away means every DOM change the game makes anywhere — the journal especially — keeps
 * queueing updates for a list that isn't on the page.
 */
const unwatchMouseList = () => {
  if (!listObserver) {
    return;
  }

  listObserver.disconnect();
  listObserver = null;
};

/**
 * Overlay mouse images with their silhouette so they sit on a dark background.
 */
export default async () => {
  addStyles(styles, 'native-dark-mode-mice-images');

  let mice = await getData('mice-silhouettes');
  if (!Array.isArray(mice)) {
    return;
  }

  // The mouse list masks the art, so it needs the art URL, which was added to this file
  // after it first shipped. A copy cached before then still satisfies the popup (which
  // only needs the silhouette) but would quietly drop the list back to the old blend, so
  // it's refetched rather than left to expire on its own.
  if (mice.some((mouse) => mouse.large && !mouse.art)) {
    mice = await getData('mice-silhouettes', true);
  }

  silhouettes = new Map(mice.map((mouse) => [mouse.type, mouse]));

  // Full-size mouse art is supplied by Better Journal's images stage. Register in
  // the following stage so only that optional presentation receives the mask.
  if (getSetting('better-journal.full-mice-images', false)) {
    onJournalEntry(updateJournalMouseImage, {
      id: 'native-dark-mode-journal-mice-images',
      stage: 'interactions',
    });
  }

  // The popup can be opened from any page, so it's always watched. The list only
  // exists on the mice pages, so the observer for it is only attached there.
  const popup = document.querySelector('#overlayPopup');
  if (popup) {
    new MutationObserver(queueUpdate).observe(popup, { childList: true, subtree: true });
  }

  onNavigation(watchMouseList, { page: 'adversaries' });
  onNavigation(watchMouseList, { page: 'hunterprofile' });

  // Tear the list observer back down on the way out, so it doesn't keep firing on every DOM
  // change for the rest of the session once one of those pages has been visited.
  onNavigation(() => {
    const page = getCurrentPage();
    if ('adversaries' !== page && 'hunterprofile' !== page) {
      unwatchMouseList();
    }
  });

  queueUpdate();
};
