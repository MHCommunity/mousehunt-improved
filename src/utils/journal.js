import { dbGet, dbSet } from './db';
import { getCurrentLocationName } from './location-current';

/**
 * Replace a journal entry with new content.
 *
 * @param {Element}  entry         The entry to replace.
 * @param {Object}   opts          The options for the new entry.
 * @param {Array}    opts.classes  The classes to add to the entry.
 * @param {string}   opts.image    The image to display.
 * @param {string}   opts.text     The text to display.
 * @param {string}   opts.time     The time to display.
 * @param {string}   opts.location The location to display.
 * @param {Function} opts.callback The callback to run after replacing the entry.
 */
const replaceJournalEntry = (entry, opts = {}) => {
  const {
    classes = ['short'],
    image = false,
    text = 'Hello, world!',
    time = false,
    location = false,
    callback = () => {},
  } = opts;

  let date = false;

  if (time && location) {
    date = `${time} - ${location}`;
  } else if (time) {
    date = time;
  } else if (location) {
    date = location;
  }

  entry.outerHTML = `<div class="entry ${classes.join(' ')}" data-entry-id="journal-entry-${opts.id}">
    ${image ? `<div class="journalimage"><img src="${image}" border="0"></div>` : ''}
    <div class="journalbody">
      ${date ? `<div class="journaldate">${date}</div>` : ''}
      <div class="journaltext">${text}</div>
    </div>
  </div>`;

  callback(entry);
};

/**
 * Create a new journal entry.
 *
 * @param {Object}  opts          The options for the new entry.
 * @param {string}  opts.id       The ID of the new entry.
 * @param {Array}   opts.classes  The classes to add to the entry.
 * @param {string}  opts.image    The image to display.
 * @param {string}  opts.text     The text to display.
 * @param {string}  opts.time     The time to display.
 * @param {string}  opts.location The location to display.
 * @param {boolean} opts.noDate   Whether to include a date or not.
 */
const makeJournalEntry = (opts = {}) => {
  const existingEntry = document.querySelector(`.journalEntries .entry[data-entry-id="journal-entry-${opts.id}"]`);
  if (existingEntry) {
    return;
  }

  const entry = document.querySelector(`.journalEntries .entry${opts.before ? `[data-entry-id="${opts.before}"]` : ''}`);
  if (! entry) {
    return;
  }

  const newEntry = entry.cloneNode(true);
  newEntry.classList.remove('animated', 'newEntry');
  entry.before(newEntry);
  replaceJournalEntry(newEntry, opts);
};

/**
 * Get the ID of the latest journal entry.
 *
 * @return {string} The ID of the latest journal entry.
 */
const getLatestJournalEntryId = () => {
  const entries = document.querySelectorAll('.journalEntries .entry');

  const entry = [...entries].find((search) => search.getAttribute('data-entry-id'));
  return entry ? entry.getAttribute('data-entry-id') : 0;
};

/**
 * Add a new journal entry.
 *
 * @param {Object}  opts          The options for the new entry.
 * @param {string}  opts.id       The ID of the new entry.
 * @param {Array}   opts.classes  The classes to add to the entry.
 * @param {string}  opts.image    The image to display.
 * @param {string}  opts.text     The text to display.
 * @param {string}  opts.time     The time to display.
 * @param {string}  opts.location The location to display.
 * @param {boolean} opts.noDate   Whether to include a date or not.
 * @param {string}  opts.before   The ID of the entry to insert the new entry before.
 */
const addJournalEntry = async (opts = {}) => {
  const previousEntryData = await dbGet('data', `journal-entry-${opts.id}`);
  const previousEntryId = previousEntryData ? previousEntryData.data?.previous : null;

  if (! previousEntryId) {
    const data = {
      id: `journal-entry-${opts.id}`,
      previous: getLatestJournalEntryId(),
    };

    if (! opts.noDate) {
      if (! opts.time) {
        const now = new Date();
        opts.time = `${now.getHours()}:${now.getMinutes()} ${now.getHours() >= 12 ? 'pm' : 'am'}`;
      }

      if (! opts.location) {
        opts.location = getCurrentLocationName();
      }
    }

    makeJournalEntry(opts);

    await dbSet('data', data);
  }

  document.addEventListener('journal-entry', (e) => {
    if (e.detail && e.detail.getAttribute('data-entry-id') === previousEntryId) {
      const existingEntry = document.querySelector(`.journalEntries .entry[data-entry-id="journal-entry-${opts.id}"]`);
      if (existingEntry) {
        return;
      }

      makeJournalEntry({
        ...opts,
        ...previousEntryData.data,
        id: `journal-entry-${opts.id}`,
        before: previousEntryId,
      });
    }
  });
};

const callbacks = [];
let hasAddedJournalEventListener = false;

/**
 * Add the event listener for journal entries.
 */
const addJournalEventListener = () => {
  document.addEventListener('journal-entry', (e) => {
    for (const { callback } of callbacks) {
      callback(e.detail);
    }
  });
};

/**
 * Helper function to add a callback to the journal entry event with a weight.
 *
 * @param {Function} callback The callback to run when the event is fired.
 * @param {number}   weight   The weight of the callback.
 */
const onJournalEntry = (callback, weight = 0) => {
  if (! hasAddedJournalEventListener) {
    addJournalEventListener();
    hasAddedJournalEventListener = true;
  }

  callbacks.push({ callback, weight });

  callbacks.sort((a, b) => a.weight - b.weight);
};

export {
  replaceJournalEntry,
  makeJournalEntry,
  addJournalEntry,
  onJournalEntry
};
