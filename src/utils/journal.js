import { dbGet, dbSet } from './db';
import { getCurrentLocationName } from './location';
import { onEvent } from './event-registry';

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
  entry.before(newEntry);
  replaceJournalEntry(newEntry, opts);
};

const getLatestJournalEntryId = () => {
  const entries = document.querySelectorAll('.journalEntries .entry');

  const entry = [...entries].find((search) => search.getAttribute('data-entry-id'));
  return entry ? entry.getAttribute('data-entry-id') : 0;
};

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

  onEvent('journal-entry', (entry) => {
    if (entry && entry.getAttribute('data-entry-id') === previousEntryId) {
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

export {
  replaceJournalEntry,
  makeJournalEntry,
  addJournalEntry
};
