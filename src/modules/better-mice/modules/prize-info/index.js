import { addStyles, getData, makeElement, onNavigation, sessionGet, sessionSet } from '@utils';

import styles from './styles.css';

/**
 * The mice that appear on the Prize History page, keyed by mouse ID.
 */
const prizeMice = {
  113: { name: 'Leprechaun Mouse', type: 'leprechaun' },
  128: { name: 'Mobster Mouse', type: 'mobster' },
  285: { name: 'High Roller Mouse', type: 'high_roller' },
  286: { name: 'Snooty Mouse', type: 'snooty' },
  287: { name: 'Treasurer Mouse', type: 'treasurer' },
};

/**
 * Check if a mouse is one of the Prize History prize mice.
 *
 * @param {string|number} mouseId The ID of the mouse.
 *
 * @return {boolean} Whether the mouse is a prize mouse.
 */
const isPrizeMouse = (mouseId) => {
  return Boolean(prizeMice[Number.parseInt(mouseId, 10)]);
};

const dayInMs = 24 * 60 * 60 * 1000;

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Parse a date string from the Prize History page into a timestamp.
 *
 * @param {string} text A date like "Wednesday, July 8th 2026 @ 10:02:41 PM (UTC)".
 *
 * @return {number|null} The timestamp, or null if the text isn't a date.
 */
const parsePrizeDate = (text) => {
  const match = text.match(/(\w+) (\d{1,2})(?:st|nd|rd|th)? (\d{4}) @ (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)/);
  if (!match) {
    return null;
  }

  const [, month, day, year, hour, minute, second, meridiem] = match;
  const monthIndex = monthNames.indexOf(month);
  if (-1 === monthIndex) {
    return null;
  }

  let hour24 = Number.parseInt(hour, 10) % 12;
  if ('PM' === meridiem) {
    hour24 += 12;
  }

  return Date.UTC(Number.parseInt(year, 10), monthIndex, Number.parseInt(day, 10), hour24, Number.parseInt(minute, 10), Number.parseInt(second, 10));
};

/**
 * Normalize a mouse name from the Prize History page for lookups.
 *
 * @param {string} name The mouse name, e.g. "Mobster Mouse" or "Mobster".
 *
 * @return {string} The normalized name.
 */
const normalizeName = (name) => {
  return name
    .replace(/\s+mouse\s*$/i, '')
    .trim()
    .toLowerCase();
};

/**
 * Parse the Prize History page markup.
 *
 * @param {Document} page The Prize History page document.
 *
 * @return {Object} Cooldown lengths and catch history keyed by normalized mouse name.
 */
const parsePrizeHistory = (page) => {
  const data = {
    cooldowns: {},
    mice: {},
  };

  // "The Mobster mouse has a cooldown of 120 days." The name is limited to
  // word characters so the match can't cross a sentence boundary when
  // adjacent paragraphs run together in textContent.
  const cooldownMatches = (page.body?.textContent || '').matchAll(/The ([\w' -]+?) mouse has a cooldown of (\d+) days?/gi);
  for (const match of cooldownMatches) {
    data.cooldowns[normalizeName(match[1])] = Number.parseInt(match[2], 10);
  }

  const rows = page.querySelectorAll('table tbody tr');
  rows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 4) {
      return;
    }

    data.mice[normalizeName(cells[0].textContent)] = {
      catches: Number.parseInt(cells[1].textContent.replaceAll(',', ''), 10) || 0,
      lastCaught: parsePrizeDate(cells[2].textContent),
      cooldownExpires: parsePrizeDate(cells[3].textContent),
    };
  });

  return data;
};

/**
 * Fetch and parse the Prize History page.
 *
 * @return {Promise<Object|null>} Cooldown lengths and catch history keyed by normalized mouse name.
 */
const getPrizeHistory = async () => {
  const cached = sessionGet('prize-history');
  if (cached && cached.time && Date.now() - cached.time < 5 * 60 * 1000) {
    return cached.data;
  }

  let text;
  try {
    const response = await fetch('https://www.mousehuntgame.com/prizeclaim.php');
    text = await response.text();
  } catch {
    return null;
  }

  const data = parsePrizeHistory(new DOMParser().parseFromString(text, 'text/html'));

  sessionSet('prize-history', { time: Date.now(), data });

  return data;
};

/**
 * Format a timestamp as a short UTC date string.
 *
 * @param {number} timestamp The timestamp to format.
 *
 * @return {string} The formatted date.
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

/**
 * Get the cooldown status for a prize mouse.
 *
 * @param {Object} history The parsed Prize History data.
 * @param {string} name    The mouse name.
 *
 * @return {Object} The cooldown length, catch details, and current status.
 */
const getPrizeStatus = (history, name) => {
  const cooldownDays = history.cooldowns[normalizeName(name)];
  const caught = history.mice[normalizeName(name)];

  let status = null;
  let expires = null;
  let daysLeft = 0;

  if (cooldownDays) {
    expires = caught?.cooldownExpires || (caught?.lastCaught ? caught.lastCaught + cooldownDays * dayInMs : null);

    if (expires && expires > Date.now()) {
      status = 'cooldown';
      daysLeft = Math.ceil((expires - Date.now()) / dayInMs);
    } else {
      status = 'ready';
    }
  }

  return { cooldownDays, caught, status, expires, daysLeft };
};

/**
 * Add prize cooldown details to the mouse view for prize mice.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addPrizeInfo = async (mouseId, mouseView) => {
  const mouse = prizeMice[Number.parseInt(mouseId, 10)];
  if (!mouse) {
    return;
  }

  const history = await getPrizeHistory();
  if (!history) {
    return;
  }

  const appendTo = mouseView.querySelector('.mouseView-movedContainer') || mouseView.querySelector('.mouseView-contentContainer');
  if (!appendTo || appendTo.querySelector('.mouseview-prize-info')) {
    return;
  }

  const { caught, status, daysLeft } = getPrizeStatus(history, mouse.name);

  const wrapper = makeElement('div', 'mouseview-prize-info');
  const details = makeElement('div', 'mouseview-prize-info-details');

  if (caught?.lastCaught) {
    makeElement('div', 'mouseview-prize-info-row', `Last caught: ${formatDate(caught.lastCaught)}`, details);
  }

  if (!caught?.lastCaught && !status) {
    makeElement('div', 'mouseview-prize-info-row', 'You haven’t caught this prize mouse yet.', details);
  }

  wrapper.append(details);

  const footer = makeElement('div', 'mouseview-prize-info-footer');

  if ('cooldown' === status) {
    makeElement('div', ['mouseview-prize-info-row', 'mouseview-prize-info-cooldown'], `On cooldown for ${daysLeft} more day${1 === daysLeft ? '' : 's'}`, footer);
  } else if ('ready' === status) {
    makeElement('div', ['mouseview-prize-info-row', 'mouseview-prize-info-ready'], 'Ready to attract', footer);
  }

  const link = makeElement('a', 'mouseview-prize-info-link', 'View Prize History →');
  link.href = 'https://www.mousehuntgame.com/prizeclaim.php';
  footer.append(link);

  wrapper.append(footer);

  appendTo.append(wrapper);
};

/**
 * Build a stat row for a Prize History card.
 *
 * @param {string}      label    The row label.
 * @param {string}      value    The row value.
 * @param {HTMLElement} appendTo The element to append the row to.
 */
const makeCardRow = (label, value, appendTo) => {
  const row = makeElement('div', 'mh-improved-prize-history-card-row');
  makeElement('span', 'mh-improved-prize-history-card-row-label', label, row);
  makeElement('span', 'mh-improved-prize-history-card-row-value', value, row);
  appendTo.append(row);
};

/**
 * Build a Prize History card for a prize mouse.
 *
 * @param {Object} mouse      The prize mouse definition.
 * @param {Object} history    The parsed Prize History data.
 * @param {Array}  thumbnails The mice thumbnail data.
 *
 * @return {HTMLElement|null} The card, or null if the mouse hasn't been caught and has no cooldown.
 */
const makePrizeHistoryCard = (mouse, history, thumbnails) => {
  const { cooldownDays, caught, status, expires, daysLeft } = getPrizeStatus(history, mouse.name);

  if (!caught && !cooldownDays) {
    return null;
  }

  const card = makeElement('div', 'mh-improved-prize-history-card');

  const catches = caught?.catches || 0;
  const crownTier = [
    [2500, 'diamond'],
    [1000, 'platinum'],
    [500, 'gold'],
    [100, 'silver'],
    [10, 'bronze'],
  ].find(([threshold]) => catches >= threshold)?.[1];
  if (crownTier) {
    card.classList.add(`crown-${crownTier}`);
  }

  /**
   * Open the mouse view for this mouse.
   *
   * @param {Event} event The click event.
   */
  const showMouseView = (event) => {
    event.preventDefault();
    hg?.views?.MouseView?.show?.(mouse.type);
  };

  const imageWrapper = makeElement('div', 'mh-improved-prize-history-card-image-wrapper');
  const thumbnail = thumbnails.find((thumb) => thumb.type === mouse.type);
  if (thumbnail?.large || thumbnail?.square) {
    const image = makeElement('img', 'mh-improved-prize-history-card-image');
    image.src = thumbnail.large || thumbnail.square;
    image.alt = mouse.name;
    imageWrapper.append(image);
  }

  const badge = makeElement('div', 'mh-improved-prize-history-card-catches', catches.toLocaleString());
  badge.title = `${catches.toLocaleString()} ${1 === catches ? 'catch' : 'catches'}`;
  imageWrapper.append(badge);

  imageWrapper.addEventListener('click', showMouseView);
  card.append(imageWrapper);

  const name = makeElement('a', 'mh-improved-prize-history-card-name', mouse.name);
  name.href = '#';
  name.addEventListener('click', showMouseView);
  card.append(name);

  if ('cooldown' === status) {
    makeElement('div', ['mh-improved-prize-history-card-status', 'is-cooldown'], `On cooldown · ${daysLeft} day${1 === daysLeft ? '' : 's'}`, card);
  }

  const stats = makeElement('div', 'mh-improved-prize-history-card-stats');

  if (caught?.lastCaught) {
    makeCardRow('Last caught', formatDate(caught.lastCaught), stats);
  }

  if (cooldownDays) {
    makeCardRow('Cooldown', `${cooldownDays} days`, stats);
  }

  if ('cooldown' === status && expires) {
    makeCardRow('Available', formatDate(expires), stats);
  }

  if (stats.childNodes.length) {
    card.append(stats);
  }

  return card;
};

/**
 * Replace the Prize History page table with a nicer card layout.
 */
const enhancePrizeClaimPage = async () => {
  const table = document.querySelector('table.defaultTable');
  if (!table || document.querySelector('.mh-improved-prize-history')) {
    return;
  }

  const history = parsePrizeHistory(document);
  if (!Object.keys(history.mice).length && !Object.keys(history.cooldowns).length) {
    return;
  }

  // Refresh the session cache with the freshly rendered page.
  sessionSet('prize-history', { time: Date.now(), data: history });

  const thumbnails = (await getData('mice-thumbnails')) || [];

  const cards = makeElement('div', 'mh-improved-prize-history');

  // Sort by catches so the layout matches the original table order, with
  // uncaught cooldown mice at the end.
  const sorted = Object.values(prizeMice).sort((a, b) => {
    return (history.mice[normalizeName(b.name)]?.catches || 0) - (history.mice[normalizeName(a.name)]?.catches || 0);
  });

  sorted.forEach((mouse) => {
    const card = makePrizeHistoryCard(mouse, history, thumbnails);
    if (card) {
      cards.append(card);
    }
  });

  if (!cards.childNodes.length) {
    return;
  }

  table.before(cards);
  table.classList.add('mh-improved-prize-history-hidden');
};

/**
 * Initialize the prize info features.
 */
const prizeInfo = () => {
  addStyles(styles, 'better-mice-prize-info');

  onNavigation(enhancePrizeClaimPage, { page: 'prizeclaim' });
};

export { addPrizeInfo, isPrizeMouse, prizeInfo };
