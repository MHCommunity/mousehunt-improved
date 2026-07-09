import {
  addStyles,
  createPopup,
  dbGetAll,
  dbSet,
  formatNumber,
  getCurrentPage,
  getSetting,
  lsGet,
  makeElement,
  onDeactivation,
  onNavigation,
  onRequest,
  onTurn,
  parseNumber,
  saveSetting
} from '@utils';

import settings from './settings';

import styles from './styles.css';

const MODULE_ID = 'journal-log-tracker';
const DB_STORE = 'journal-log-tracker';

/**
 * The localStorage key used by hannadDev's original "MH - Journal Log Tracker"
 * userscript. We read from it once to migrate existing data, but never modify it.
 */
const USERSCRIPT_KEY = 'mh-journal-log-tracker';

/**
 * The interval, in hours, between journal log summaries.
 *
 * The game posts a new "Hunter's Journal Summary" entry every 36 hours.
 */
const LOG_INTERVAL_HOURS = 36;

let cachedLogs = [];
let buttonInterval = null;
let currentPopup = null;

/**
 * Whether the journal currently shown belongs to the logged-in user.
 *
 * @return {boolean} True if it's the user's own journal.
 */
const isOwnJournal = () => {
  const container = document.querySelector('#journalContainer');
  if (! container) {
    return false;
  }

  const owner = container.getAttribute('data-owner');
  return ! owner || `${owner}` === `${user.user_id}`;
};

/**
 * Whether the journal is showing its first (most recent) page.
 *
 * Entry timestamps are reconstructed from the visible time-of-day, which is
 * only valid for entries posted within the last day — older pages would be
 * stored with today's date.
 *
 * @return {boolean} True if the first page (or no pager) is shown.
 */
const isFirstJournalPage = () => {
  // The current section renders "Page N of M", so read just the N span —
  // parsing the whole section's text would mash the two numbers together.
  const current = document.querySelector('#journalContainer .pagerView-section-currentPage');
  if (! current) {
    return true;
  }

  const page = Number.parseInt(current.textContent.replaceAll(/\D/g, ''), 10);
  return Number.isNaN(page) || page <= 1;
};

/**
 * Refresh the in-memory cache of logs from the database, newest first.
 *
 * @return {Promise<Array>} The cached logs.
 */
const refreshLogsCache = async () => {
  const all = await dbGetAll(DB_STORE);

  cachedLogs = all
    .map((row) => row.data)
    .filter(Boolean)
    .sort((a, b) => b.id - a.id);

  return cachedLogs;
};

/**
 * Parse a single journal log-summary entry into a stored log object.
 *
 * @param {HTMLElement} entry The `.entry.log_summary` element.
 *
 * @return {Object|null} The parsed log, or null if it couldn't be parsed.
 */
const parseEntry = (entry) => {
  const id = Number.parseInt(entry.dataset.entryId, 10);
  if (! id) {
    return null;
  }

  const dateEl = entry.querySelector('.journaldate');
  if (! dateEl) {
    return null;
  }

  let timestamp;
  try {
    const dateString = dateEl.innerHTML.split('-')[0].trim().replaceAll(' ', '');
    const hours = dateString.split(':')[0];
    const minutes = dateString.split(':')[1].replace('am', '').replace('pm', '');
    const period = dateString.split(':')[1].includes('am') ? 'am' : 'pm';

    const date = new Date();
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setHours(Number.parseInt(hours, 10));
    date.setMinutes(Number.parseInt(minutes, 10));

    if (12 !== date.getHours() && 'pm' === period) {
      date.setHours(date.getHours() + 12);
    } else if (12 === date.getHours() && 'am' === period) {
      date.setHours(date.getHours() - 12);
    }

    // The journal only shows a time, so a future time means it was yesterday.
    if (date.getTime() > Date.now()) {
      date.setDate(date.getDate() - 1);
    }

    timestamp = date.getTime();
  } catch {
    return null;
  }

  const log = {
    id,
    timestamp,
    duration: '',
    catches: null,
    ftc: null,
    fta: null,
    gold: null,
    points: null,
    openMethod: null,
  };

  const subtitle = entry.querySelector('.reportSubtitle');
  if (subtitle) {
    log.duration = subtitle.textContent.replace('Last ', '').trim();
  }

  const tableBody = entry.querySelector('.journalbody .journaltext table tbody');
  if (tableBody) {
    const cells = tableBody.querySelectorAll('.leftSide, .rightSide');
    cells.forEach((cell) => {
      const next = cell.nextSibling;
      if (! next || ! next.innerHTML) {
        return;
      }

      const value = parseNumber(next.innerHTML);
      const isLeft = cell.classList.contains('leftSide');

      if (cell.innerHTML.includes('Catches:')) {
        log.catches = value;
      } else if (cell.innerHTML.includes('Misses:')) {
        log.ftc = value;
      } else if (cell.innerHTML.includes('Fail to Attract:')) {
        log.fta = value;
      } else if (cell.innerHTML.includes('Total:')) {
        // The left column is gold, the right column is points.
        if (isLeft) {
          log.gold = value;
        } else {
          log.points = value;
        }
      }
    });

    // Capture the original "view summary" link so we can replay it later.
    const link = tableBody.querySelector('a');
    if (link) {
      log.openMethod = link.getAttribute('onclick');
    }
  }

  return log;
};

/**
 * Scrape the journal for any new log-summary entries and store them.
 *
 * @return {Promise<boolean>} Whether any new logs were stored.
 */
const scrapeJournal = async () => {
  if (! isOwnJournal() || ! isFirstJournalPage()) {
    return false;
  }

  const known = new Set(cachedLogs.map((log) => log.id));
  const entries = document.querySelectorAll('.entry.log_summary');

  let added = false;
  for (const entry of entries) {
    const id = Number.parseInt(entry.dataset.entryId, 10);
    if (! id || known.has(id)) {
      continue;
    }

    const log = parseEntry(entry);
    if (log) {
      await dbSet(DB_STORE, log);
      known.add(id);
      added = true;
    }
  }

  if (added) {
    await refreshLogsCache();
    showButton();
    refreshOpenPopup();
  }

  return added;
};

/**
 * Work out when the next log is due based on the most recent stored log.
 *
 * @return {Object|null} `{ nextTimestamp, msUntil, isDue }` or null if no logs.
 */
const getNextLogInfo = () => {
  const latest = cachedLogs[0];
  if (! latest || ! latest.timestamp) {
    return null;
  }

  const nextTimestamp = latest.timestamp + (LOG_INTERVAL_HOURS * 60 * 60 * 1000);
  const msUntil = nextTimestamp - Date.now();

  return {
    nextTimestamp,
    msUntil,
    isDue: msUntil <= 0,
  };
};

/**
 * Format a millisecond duration as a short countdown string.
 *
 * @param {number}  ms    Milliseconds remaining.
 * @param {boolean} short Whether to use a short format (e.g. "5h 23m") or long (e.g. "5 hours 23 minutes").
 *
 * @return {string} A string like "5h 23m" or "12m".
 */
const formatCountdown = (ms, short = true) => {
  const totalMinutes = Math.round(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0 && minutes <= 0) {
    return 'Almost ready';
  }

  const parts = [];
  if (hours > 0) {
    parts.push(short ? `${hours}h` : `${hours} hours`);
  }

  if (minutes > 0) {
    parts.push(short ? `${minutes}m` : `${minutes} minutes`);
  }

  return parts.join(' ');
};

/**
 * Get the label to show on the journal button.
 *
 * @return {string} The button label.
 */
const getButtonLabel = () => {
  if (! getSetting(`${MODULE_ID}.show-countdown`, true)) {
    return 'Journal Logs';
  }

  const info = getNextLogInfo();
  if (! info) {
    return 'Journal Logs';
  }

  if (info.isDue) {
    return 'Next Log: due now';
  }

  return `Next Log: ${formatCountdown(info.msUntil)}`;
};

/**
 * Format a timestamp as a short, locale-aware date and time.
 *
 * @param {number} timestamp The timestamp to format.
 *
 * @return {string} The formatted date.
 */
const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Replay the original journal "view summary" link to open a stored log.
 *
 * The game renders an inline `onclick` handler on the summary link. Rather
 * than evaluating it, we re-create an anchor with the same handler and click
 * it, letting the browser run it in the normal way.
 *
 * @param {string} onclick The stored onclick attribute string.
 */
const openLogSummary = (onclick) => {
  if (! onclick) {
    return;
  }

  const trigger = makeElement('a');
  trigger.setAttribute('href', '#');
  trigger.setAttribute('onclick', onclick);
  trigger.style.display = 'none';

  document.body.append(trigger);
  trigger.click();
  trigger.remove();
};

/**
 * Add (or refresh) the tracker button in the journal header.
 */
const showButton = () => {
  const page = getCurrentPage();
  if ('camp' !== page && 'journal' !== page) {
    return;
  }

  if (! isOwnJournal()) {
    return;
  }

  const target = document.querySelector('#journalContainer .top');
  if (! target) {
    return;
  }

  let button = target.querySelector('.mh-jlt-button');
  if (! button) {
    button = makeElement('a', ['journalContainer-selectTheme', 'mh-jlt-button']);
    button.href = '#';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      showPopup();
    });
    target.append(button);
  }

  button.textContent = getButtonLabel();

  // Keep the countdown updated while the button is on screen. Timers only
  // show minutes, so updating once a minute is enough.
  if (! buttonInterval) {
    buttonInterval = setInterval(() => {
      const current = document.querySelector('.mh-jlt-button');
      if (current) {
        current.textContent = getButtonLabel();
      } else {
        clearInterval(buttonInterval);
        buttonInterval = null;
      }
    }, 60 * 1000);
  }
};

/**
 * Build the markup for the next-log summary banner.
 *
 * @return {string} The summary markup, or an empty string when nothing is tracked.
 */
const makeSummaryMarkup = () => {
  const info = getNextLogInfo();
  if (! info) {
    return '';
  }

  const time = info.isDue ? 'Due now' : formatCountdown(info.msUntil, false);
  const sub = info.isDue ? 'Soon!' : `${formatDate(info.nextTimestamp)}`;

  return `<div class="mh-jlt-summary${info.isDue ? ' is-due' : ''}">
    <div class="mh-jlt-summary-label">Next log in about </div>
    <div class="mh-jlt-summary-time">${time}</div>
    <div class="mh-jlt-summary-sub">${sub}</div>
  </div>`;
};

/**
 * Escape a value for safe interpolation into HTML markup. Stored values can
 * come from imported userscript data, so they can't be trusted as markup.
 *
 * @param {*} value The value to escape.
 *
 * @return {string} The escaped string.
 */
const escapeHtml = (value) => {
  return `${value}`
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
};

/**
 * Render a plain table cell, showing a dash for missing values.
 *
 * @param {*} value The cell value.
 *
 * @return {string} The cell markup.
 */
const makeCell = (value) => {
  return `<td>${(null === value || undefined === value) ? '-' : escapeHtml(value)}</td>`;
};

/**
 * Render a number table cell with locale formatting and a dash fallback.
 *
 * @param {?number} value The cell value.
 *
 * @return {string} The cell markup.
 */
const makeNumberCell = (value) => {
  return `<td>${(null === value || undefined === value) ? '-' : formatNumber(value)}</td>`;
};

/**
 * Build the markup for the logs table.
 *
 * @return {string} The table markup.
 */
const makeTableMarkup = () => {
  if (! cachedLogs.length) {
    return '<div class="mh-jlt-empty">No journal logs tracked yet. Visit your journal to start tracking your log summaries.</div>';
  }

  const headings = ['Date & Time', 'Duration', 'Catches', 'FTC', 'FTA', 'Gold', 'Points'];
  const headerCells = headings.map((heading) => `<th>${heading}</th>`).join('');

  const rows = cachedLogs.map((log) => {
    let row = '<tr>';
    row += `<td><a href="#" class="mh-jlt-open" data-log-id="${log.id}">${formatDate(log.timestamp)}</a></td>`;
    row += makeCell(log.duration || '-');
    row += makeCell(log.catches);
    row += makeCell(log.ftc);
    row += makeCell(log.fta);
    row += makeNumberCell(log.gold);
    row += makeNumberCell(log.points);
    row += '</tr>';
    return row;
  }).join('');

  return `<table class="mh-jlt-table">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
};

/**
 * Build the full popup content markup.
 *
 * @return {string} The popup markup.
 */
const makePopupMarkup = () => {
  return `<div class="mh-jlt-popup">
    ${makeSummaryMarkup()}
    <div class="mh-jlt-body">${makeTableMarkup()}</div>
  </div>`;
};

/**
 * Bind the row click handlers in the current popup.
 */
const bindPopupEvents = () => {
  const popup = document.querySelector('.mh-jlt-popup');
  if (! popup) {
    return;
  }

  // Open a stored log summary.
  popup.querySelectorAll('.mh-jlt-open').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = Number.parseInt(link.getAttribute('data-log-id'), 10);
      const log = cachedLogs.find((item) => item.id === id);
      if (log && log.openMethod) {
        currentPopup?.hide();
        openLogSummary(log.openMethod);
      }
    });
  });
};

/**
 * Re-render the popup contents if it's currently open.
 */
const refreshOpenPopup = () => {
  const content = document.querySelector('.mh-jlt-popup');
  if (! content) {
    return;
  }

  content.outerHTML = makePopupMarkup();
  bindPopupEvents();
};

/**
 * Show the tracker popup.
 */
const showPopup = () => {
  currentPopup = createPopup({
    title: 'Journal Log Tracker',
    content: makePopupMarkup(),
    className: 'mh-jlt-overlay',
    show: true,
  });

  bindPopupEvents();
};

/**
 * Normalize a log from an imported file into this module's shape.
 *
 * @param {number} id  The log id.
 * @param {Object} log The raw imported log.
 *
 * @return {Object} The normalized log.
 */
const normalizeImportedLog = (id, log) => {
  return {
    id,
    timestamp: log.timestamp ?? log.Timestamp ?? 0,
    duration: log.duration ?? log.Duration ?? '',
    catches: log.catches ?? log.Catches ?? null,
    ftc: log.ftc ?? log.Ftc ?? null,
    fta: log.fta ?? log.Fta ?? null,
    gold: log.gold ?? log.GoldTotal ?? null,
    points: log.points ?? log.PointsTotal ?? null,
    openMethod: log.openMethod ?? log.OpenSummaryMethod ?? null,
  };
};

/**
 * Seamlessly migrate logs from hannadDev's original userscript.
 *
 * Reads the original `localStorage` data once, merges any logs we don't already
 * have, and leaves the original storage completely untouched so both can coexist.
 * A setting flag ensures this only runs once, so logs you later delete here
 * won't reappear.
 */
const migrateFromUserscript = async () => {
  if (getSetting(`${MODULE_ID}.migrated`, false)) {
    return;
  }

  const parsed = lsGet(USERSCRIPT_KEY, null);

  // Mark as migrated even when there's nothing to import, so we don't keep checking.
  if (! parsed) {
    saveSetting(`${MODULE_ID}.migrated`, true);
    return;
  }

  const known = new Set(cachedLogs.map((log) => log.id));
  let added = false;

  for (const [key, value] of Object.entries(parsed.logs || {})) {
    const id = Number.parseInt(key, 10);
    if (! id || known.has(id)) {
      continue;
    }

    await dbSet(DB_STORE, normalizeImportedLog(id, value));
    known.add(id);
    added = true;
  }

  if (added) {
    await refreshLogsCache();
  }

  saveSetting(`${MODULE_ID}.migrated`, true);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, MODULE_ID);

  await refreshLogsCache();
  await migrateFromUserscript();

  showButton();
  scrapeJournal();

  onRequest('pages/journal.php', scrapeJournal);
  onNavigation(() => {
    showButton();
    scrapeJournal();
  });
  onTurn(scrapeJournal);

  onDeactivation(MODULE_ID, () => {
    if (buttonInterval) {
      clearInterval(buttonInterval);
      buttonInterval = null;
    }

    document.querySelector('.mh-jlt-button')?.remove();
  });
};

export default {
  id: MODULE_ID,
  name: 'Journal Progress Log Tracker',
  type: 'journal-progress-stats',
  default: false,
  description: 'Tracks when your next journal log summary is due and gives you quick access to your past logs.',
  load: init,
  settings,
};
