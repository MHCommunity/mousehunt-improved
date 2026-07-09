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
  saveSetting,
  setMultipleTimeout
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
const LOG_INTERVAL_MS = LOG_INTERVAL_HOURS * 60 * 60 * 1000;

/**
 * How many exact entry timestamps to keep in memory at once.
 */
const EXACT_TIMESTAMP_LIMIT = 250;

let cachedLogs = [];
let buttonInterval = null;
let currentPopup = null;

/**
 * Exact entry timestamps, keyed by entry id.
 *
 * The rendered journal only shows a time of day, but turn responses include an
 * `entry_timestamp` for every entry they add. We keep those so entries seen
 * this session can be dated precisely instead of reconstructed.
 *
 * @type {Map<number, number>}
 */
const exactTimestamps = new Map();

/**
 * The last (oldest) entry timestamp derived for each journal page, keyed by
 * page number, so paging backwards can anchor each page to the one before it.
 *
 * @type {Map<number, {timestamp: number, anchored: boolean}>}
 */
const pageAnchors = new Map();

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
 * The journal page currently being shown.
 *
 * @return {number|null} The 1-indexed page number, or null when there's no
 * pager — the camp journal, which shows only the newest a few entries.
 */
const getJournalPage = () => {
  // The current section renders "Page N of M", so read just the N span —
  // parsing the whole section's text would mash the two numbers together.
  const current = document.querySelector('#journalContainer .pagerView-section-currentPage');
  if (! current) {
    return null;
  }

  const page = Number.parseInt(current.textContent.replaceAll(/\D/g, ''), 10);
  return (Number.isNaN(page) || page < 1) ? 1 : page;
};

/**
 * Record the exact timestamps the game sends along with new journal entries.
 *
 * @param {Object} data The request response.
 */
const captureExactTimestamps = (data) => {
  if (! data?.journal_markup?.length) {
    return;
  }

  for (const markup of data.journal_markup) {
    const id = Number.parseInt(markup?.render_data?.entry_id, 10);
    const timestamp = Number.parseInt(markup?.render_data?.entry_timestamp, 10);
    if (! id || ! timestamp) {
      continue;
    }

    // The game sends seconds; anything smaller than a year-2100 millisecond
    // value is therefore a second-precision timestamp.
    exactTimestamps.set(id, timestamp < 100_000_000_000 ? timestamp * 1000 : timestamp);
  }

  while (exactTimestamps.size > EXACT_TIMESTAMP_LIMIT) {
    exactTimestamps.delete(exactTimestamps.keys().next().value);
  }
};

/**
 * Read the time of day shown on a journal entry.
 *
 * @param {HTMLElement} entry The `.entry` element.
 *
 * @return {Object|null} `{ hours, minutes }` in 24-hour time, or null.
 */
const parseTimeOfDay = (entry) => {
  const dateEl = entry.querySelector('.journaldate');
  if (! dateEl) {
    return null;
  }

  const text = dateEl.textContent.split('-')[0].trim().toLowerCase().replaceAll(' ', '');
  const parts = /^(\d{1,2}):(\d{2})(am|pm)$/.exec(text);
  if (! parts) {
    return null;
  }

  let hours = Number.parseInt(parts[1], 10);
  if (12 === hours) {
    hours = 0;
  }

  if ('pm' === parts[3]) {
    hours += 12;
  }

  return { hours, minutes: Number.parseInt(parts[2], 10) };
};

/**
 * Place a time of day on the most recent day that doesn't run past a bound.
 *
 * Journal entries are listed newest first, so walking down the list with the
 * previous entry's timestamp as the bound moves the date back a day each time
 * the entries cross midnight.
 *
 * @param {Object} time       The time of day, as `{ hours, minutes }`.
 * @param {number} upperBound The timestamp the result must not exceed.
 *
 * @return {number} The resulting timestamp.
 */
const timestampAtOrBefore = (time, upperBound) => {
  const date = new Date(upperBound);
  date.setHours(time.hours, time.minutes, 0, 0);

  if (date.getTime() > upperBound) {
    date.setDate(date.getDate() - 1);
  }

  return date.getTime();
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
 * @param {HTMLElement} entry     The `.entry.log_summary` element.
 * @param {number}      timestamp The timestamp derived for the entry.
 * @param {boolean}     estimated Whether that timestamp is only an estimate.
 *
 * @return {Object|null} The parsed log, or null if it couldn't be parsed.
 */
const parseEntry = (entry, timestamp, estimated) => {
  const id = Number.parseInt(entry.dataset.entryId, 10);
  if (! id) {
    return null;
  }

  const log = {
    id,
    timestamp,
    estimated,
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
 * Entries only show a time of day, so each page is walked from newest to
 * oldest, moving a cursor back a day whenever the times cross midnight. The
 * cursor starts at "now" on the first page, and otherwise at the oldest entry
 * of the page before it, so paging backwards keeps dating entries accurately.
 * Exact timestamps from turn responses re-anchor the cursor whenever we have
 * one. A log that can't be anchored, or that lands further back than a single
 * log interval, is still stored but flagged as estimated.
 *
 * @return {Promise<boolean>} Whether any logs were stored or updated.
 */
const scrapeJournal = async () => {
  const container = document.querySelector('#journalContainer');
  if (! container || ! isOwnJournal()) {
    return false;
  }

  // The camp journal holds only the newest few entries, so its oldest entry is
  // nowhere near the bottom of the real first page and must never be stored as
  // that page's anchor. It's still safe to scrape, anchored at "now".
  const pagedPage = getJournalPage();
  const page = pagedPage ?? 1;
  const previous = pageAnchors.get(page - 1);

  let cursor = previous?.timestamp ?? Date.now();
  let anchored = 1 === page || Boolean(previous?.anchored);

  const known = new Map(cachedLogs.map((log) => [log.id, log]));
  const entries = container.querySelectorAll('.entry[data-entry-id]');

  let added = false;
  for (const entry of entries) {
    const id = Number.parseInt(entry.dataset.entryId, 10);
    if (! id) {
      continue;
    }

    const exact = exactTimestamps.get(id);
    const existing = known.get(id);

    if (exact) {
      cursor = exact;
      anchored = true;
    } else if (existing && ! existing.estimated) {
      cursor = existing.timestamp;
      anchored = true;
    } else {
      const time = parseTimeOfDay(entry);
      if (time) {
        cursor = timestampAtOrBefore(time, cursor);
      }
    }

    if (! entry.classList.contains('log_summary')) {
      continue;
    }

    // Without an anchor the walk can only ever under-count the days it spans,
    // and reconstruction past one log interval needs entries dense enough to
    // show every midnight. Neither is something we can verify here.
    const estimated = ! exact && (! anchored || (Date.now() - cursor) > LOG_INTERVAL_MS);

    // Never downgrade a log we already dated confidently.
    if (existing && (! existing.estimated || estimated)) {
      continue;
    }

    const log = parseEntry(entry, cursor, estimated);
    if (log) {
      await dbSet(DB_STORE, log);
      known.set(id, log);
      added = true;
    }
  }

  if (null !== pagedPage) {
    pageAnchors.set(page, { timestamp: cursor, anchored });
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
 * Estimated logs are skipped — an uncertain date would give a countdown that's
 * confidently wrong.
 *
 * @return {Object|null} `{ nextTimestamp, msUntil, isDue }` or null if no logs.
 */
const getNextLogInfo = () => {
  const latest = cachedLogs.find((log) => log.timestamp && ! log.estimated);
  if (! latest) {
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
    return cachedLogs.length ? '<div class="mh-jlt-summary is-unknown"><div class="mh-jlt-summary-sub">The next log time is unknown until a new log summary is tracked.</div></div>' : '';
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
    const dateClass = log.estimated ? 'mh-jlt-open mh-jlt-estimated' : 'mh-jlt-open';
    const dateTitle = log.estimated ? ' title="This date is an estimate — the journal only shows a time of day."' : '';

    let row = '<tr>';
    row += `<td><a href="#" class="${dateClass}" data-log-id="${log.id}"${dateTitle}>${formatDate(log.timestamp)}</a></td>`;
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
    estimated: false,
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

  // Registered first, and with `skipSuccess`, so the exact timestamps a turn
  // response carries are available before anything scrapes the entries it adds.
  onRequest('*', captureExactTimestamps, true);

  // The journal page request resolves before the game swaps the new entries in,
  // so wait for the DOM to catch up before reading the pager and the entries.
  onRequest('pages/journal.php', () => setMultipleTimeout(scrapeJournal, [100, 500, 1000]));

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
