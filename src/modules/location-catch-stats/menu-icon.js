import { addIconToMenu, isMenuItemHidden, makeElement, onEvent, onTravel, onTurn, parseNumber } from '@utils';

import { getMouseStats } from './stats';

const ICON_ID = 'mousehunt-improved-location-catch-stats';

// Names of the mice at the current location that haven't been caught yet.
let uncaughtNames = [];
let refreshGeneration = 0;
let hasLoaded = false;

/**
 * Strip the trailing "Mouse" so stats names match how the journal writes them.
 *
 * @param {string} name The mouse name.
 *
 * @return {string} The name without the suffix.
 */
const normalizeName = (name) => `${name || ''}`.replace(/ Mouse$/, '').trim();

/**
 * Update the icon with the uncaught count.
 *
 * @param {number|null} uncaught The number of uncaught mice, or null while loading.
 * @param {number}      total    The number of mice at the location.
 */
const renderIcon = (uncaught, total = 0) => {
  const icon = document.querySelector(`#${ICON_ID}`);
  if (!icon) {
    return;
  }

  let count = icon.querySelector('.mh-catch-stats-menu-count');
  if (!count) {
    count = makeElement('span', 'mh-catch-stats-menu-count');
    icon.append(count);
  }

  icon.classList.toggle('mh-catch-stats-menu-complete', 0 === uncaught && total > 0);
  icon.classList.toggle('mh-catch-stats-menu-loading', null === uncaught);

  if (null === uncaught) {
    count.textContent = '';
    icon.title = 'Location Catch Stats';
  } else if (0 === uncaught) {
    count.textContent = '✓';
    icon.title = `You've caught all ${total} mice in ${user.environment_name}`;
  } else {
    count.textContent = uncaught;
    icon.title = `${uncaught} of ${total} mice uncaught in ${user.environment_name}`;
  }
};

/**
 * Fetch the stats for the current location and update the icon.
 */
const refreshCount = async () => {
  // The icon is hidden until it's added with Custom Menu, so don't fetch stats nobody sees.
  if (isMenuItemHidden(ICON_ID)) {
    return;
  }

  hasLoaded = true;
  const generation = ++refreshGeneration;

  const mice = await getMouseStats();

  // A travel while the request was out makes this result stale.
  if (generation !== refreshGeneration) {
    return;
  }

  if (!mice.length) {
    uncaughtNames = [];
    renderIcon(null);
    return;
  }

  const uncaught = mice.filter((mouse) => parseNumber(mouse.num_catches) <= 0);
  uncaughtNames = uncaught.map((mouse) => normalizeName(mouse.name)).filter(Boolean);

  renderIcon(uncaught.length, mice.length);
};

/**
 * Check a hunt's journal entries for a first catch, and refresh if there was one.
 *
 * Refetching on every horn would be a request per hunt for a number that rarely changes, so only
 * do it when the journal mentions one of the mice we haven't caught.
 *
 * @param {Object} response The active turn response.
 */
const maybeRefreshAfterTurn = (response) => {
  if (!uncaughtNames.length) {
    return;
  }

  const entries = response?.journal_markup || [];
  const text = entries
    .map((entry) => entry?.render_data?.text || '')
    .join(' ')
    .replaceAll(/<[^>]*>/g, ' ');

  const decoded = new DOMParser().parseFromString(text, 'text/html').documentElement.textContent || '';

  if (uncaughtNames.some((name) => decoded.includes(name))) {
    refreshCount();
  }
};

/**
 * Add the uncaught count icon to the top menu.
 *
 * @param {Function} showModal Opens the catch stats modal.
 */
const addMenuIcon = (showModal) => {
  addIconToMenu({
    id: ICON_ID,
    classname: 'mh-catch-stats-menu-icon',
    title: 'Location Catch Stats',
    position: 'prepend',
    action: (e) => {
      e.preventDefault();

      const open = document.querySelector('#mh-catch-stats, #mh-catch-stats-summary');
      if (open) {
        open.remove();
        return;
      }

      showModal();
    },
  });

  renderIcon(null);
  refreshCount();

  onTravel(null, { callback: refreshCount });
  onTurn(maybeRefreshAfterTurn);

  // Load the count the first time the icon is shown.
  onEvent('mh-improved-custom-menu-changed', () => {
    if (!hasLoaded) {
      refreshCount();
    }
  });
};

export default addMenuIcon;
