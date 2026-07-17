import { dbGet, dbSet } from './db';
import { getCurrentLocationName } from './location-current';

/**
 * Replace a journal entry with new content.
 *
 * @param {Element}  entry           The entry to replace.
 * @param {Object}   [opts]          The options for the new entry.
 * @param {Array}    [opts.classes]  The classes to add to the entry.
 * @param {string}   [opts.image]    The image to display.
 * @param {string}   [opts.text]     The text to display.
 * @param {string}   [opts.time]     The time to display.
 * @param {string}   [opts.location] The location to display.
 * @param {Function} [opts.callback] The callback to run after replacing the entry.
 */
const replaceJournalEntry = (entry, opts = {}) => {
  const { classes = ['short'], image = false, text = 'Hello, world!', time = false, location = false, callback = () => {} } = opts;

  let date = false;

  if (time && location) {
    date = `${time} - ${location}`;
  } else if (time) {
    date = time;
  } else if (location) {
    date = location;
  }

  entry.outerHTML = `<div class="entry ${classes.join(' ')}" data-entry-id="journal-entry-${opts.id}">
    ${image ? `<div class="journalimage"><img src="${image}" alt="" /></div>` : ''}
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
 * @param {Object}  [opts]          The options for the new entry.
 * @param {string}  opts.id         The ID of the new entry.
 * @param {Array}   [opts.classes]  The classes to add to the entry.
 * @param {string}  [opts.image]    The image to display.
 * @param {string}  [opts.text]     The text to display.
 * @param {string}  [opts.time]     The time to display.
 * @param {string}  [opts.location] The location to display.
 * @param {boolean} [opts.noDate]   Whether to include a date or not.
 */
const makeJournalEntry = (opts = {}) => {
  const existingEntry = document.querySelector(`.journalEntries .entry[data-entry-id="journal-entry-${opts.id}"]`);
  if (existingEntry) {
    return;
  }

  const entry = document.querySelector(`.journalEntries .entry${opts.before ? `[data-entry-id="${opts.before}"]` : ''}`);
  if (!entry) {
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
  if (!entries || entries.length === 0) {
    return 0;
  }

  const entry = [...entries].find((search) => search.getAttribute('data-entry-id'));
  return entry ? entry.getAttribute('data-entry-id') : 0;
};

/**
 * Add a new journal entry.
 *
 * @param {Object}  [opts]          The options for the new entry.
 * @param {string}  opts.id         The ID of the new entry.
 * @param {Array}   [opts.classes]  The classes to add to the entry.
 * @param {string}  [opts.image]    The image to display.
 * @param {string}  [opts.text]     The text to display.
 * @param {string}  [opts.time]     The time to display.
 * @param {string}  [opts.location] The location to display.
 * @param {boolean} [opts.noDate]   Whether to include a date or not.
 * @param {string}  [opts.before]   The ID of the entry to insert the new entry before.
 */
const addJournalEntry = async (opts = {}) => {
  const previousEntryData = await dbGet('data', `journal-entry-${opts.id}`);
  const previousEntryId = previousEntryData ? previousEntryData.data?.previous : null;

  if (!previousEntryId) {
    const data = {
      id: `journal-entry-${opts.id}`,
      previous: getLatestJournalEntryId(),
    };

    if (!opts.noDate) {
      if (!opts.time) {
        const now = new Date();
        opts.time = `${now.getHours()}:${now.getMinutes()} ${now.getHours() >= 12 ? 'pm' : 'am'}`;
      }

      if (!opts.location) {
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

const JOURNAL_STAGES = ['history-save', 'text', 'listify', 'style-classes', 'links', 'images', 'interactions'];

const TEXT_STAGES = new Set(['text', 'listify']);
const callbacks = new Map(JOURNAL_STAGES.map((stage) => [stage, []]));
const finishedProcessingCallbacks = [];
const processedEntries = new WeakSet();
const processingEntries = new WeakMap();
const queuedEntries = new Set();
let journalObserver = null;
let processingQueue = false;
let finishedProcessingPromise = Promise.resolve();

/**
 * Build the shared model passed through the journal pipeline.
 *
 * @param {HTMLElement} entry The journal entry.
 *
 * @return {Object|null} The journal entry model.
 */
const makeJournalEntryModel = (entry) => {
  if (!entry?.classList) {
    return null;
  }

  const textEl = entry.querySelector('.journalbody .journaltext');

  return {
    el: entry,
    id: entry.getAttribute('data-entry-id'),
    classes: new Set(entry.classList),
    mouseType: entry.getAttribute('data-mouse-type'),
    textEl,
    html: textEl?.innerHTML || '',
    dirty: false,
    setHtml(html) {
      if (this.html !== html) {
        this.html = html;
        this.dirty = true;
      }
    },
  };
};

/**
 * Commit text-stage changes to the live DOM once.
 *
 * @param {Object} model The journal entry model.
 */
const commitJournalEntryText = (model) => {
  if (!model.dirty || !model.textEl) {
    return;
  }

  model.textEl.innerHTML = model.html;
  model.dirty = false;
};

/**
 * Process one journal entry through all named stages.
 *
 * @param {HTMLElement} entry The journal entry.
 *
 * @return {Promise<Object|null>} The processed entry model.
 */
const processJournalEntry = async (entry) => {
  if (!entry?.isConnected || processedEntries.has(entry)) {
    return null;
  }

  if (processingEntries.has(entry)) {
    return processingEntries.get(entry);
  }

  const processing = (async () => {
    // Preserve the legacy event as the compatibility seam. It must run before
    // taking the text snapshot so its changes are not overwritten on commit.
    document.dispatchEvent(new CustomEvent('journal-entry', { detail: entry }));

    const model = makeJournalEntryModel(entry);
    if (!model) {
      return null;
    }

    processedEntries.add(entry);

    for (const stage of JOURNAL_STAGES) {
      if (!TEXT_STAGES.has(stage)) {
        commitJournalEntryText(model);
      }

      for (const { callback, id } of callbacks.get(stage)) {
        try {
          await callback(model);
        } catch (error) {
          console.error(`Error in journal stage "${stage}" (${id}):`, error); // eslint-disable-line no-console
        }
      }
    }

    commitJournalEntryText(model);
    return model;
  })();

  processingEntries.set(entry, processing);

  try {
    return await processing;
  } finally {
    processingEntries.delete(entry);
  }
};

/**
 * Run callbacks that depend on a completed journal batch.
 */
const runFinishedProcessingCallbacks = async () => {
  for (const callback of finishedProcessingCallbacks) {
    try {
      await callback();
    } catch (error) {
      console.error('Error in journal finished processing callback:', error); // eslint-disable-line no-console
    }
  }
};

const finishJournalProcessing = () => {
  finishedProcessingPromise = finishedProcessingPromise.then(() => runFinishedProcessingCallbacks());
  return finishedProcessingPromise;
};

/**
 * Process every new journal entry within a root element.
 *
 * @param {Document|Element} root The root to search.
 *
 * @return {Promise<Array>} The processed entry models.
 */
const processJournalEntries = async (root = document) => {
  const entries = [];

  if (root?.matches?.('.journal .entry, .journalEntries .entry, .jsingle .entry')) {
    entries.push(root);
  }

  if (root?.querySelectorAll) {
    entries.push(...root.querySelectorAll('.journal .entry, .journalEntries .entry, .jsingle .entry'));
  }

  const newEntries = [...new Set(entries)].filter((entry) => !processedEntries.has(entry));
  if (!newEntries.length) {
    return [];
  }

  const models = await Promise.all(newEntries.map((entry) => processJournalEntry(entry)));
  await finishJournalProcessing();
  return models.filter(Boolean);
};

/**
 * Flush journal entries collected by the mutation observer.
 */
const flushJournalQueue = async () => {
  processingQueue = false;
  const entries = [...queuedEntries];
  queuedEntries.clear();

  if (!entries.length) {
    return;
  }

  const models = await Promise.all(entries.map((entry) => processJournalEntry(entry)));
  if (models.some(Boolean)) {
    await finishJournalProcessing();
  }
};

/**
 * Queue a journal entry discovered by the observer.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const queueJournalEntry = (entry) => {
  if (!processedEntries.has(entry)) {
    queuedEntries.add(entry);
  }

  if (!processingQueue) {
    processingQueue = true;
    queueMicrotask(flushJournalQueue);
  }
};

/**
 * Find journal entries in an added DOM node.
 *
 * @param {Node} node The added node.
 */
const queueEntriesFromNode = (node) => {
  if (!(node instanceof Element)) {
    return;
  }

  if (node.matches('.journal .entry, .journalEntries .entry, .jsingle .entry')) {
    queueJournalEntry(node);
  }

  node.querySelectorAll('.journal .entry, .journalEntries .entry, .jsingle .entry').forEach((entry) => queueJournalEntry(entry));
};

/**
 * Observe the page for journal entries added by the game or journal history.
 */
const observeJournalEntries = () => {
  if (journalObserver || !document.body) {
    return;
  }

  journalObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => queueEntriesFromNode(node));
    }
  });

  journalObserver.observe(document.body, { childList: true, subtree: true });
  processJournalEntries();
};

/**
 * Register a callback in a named journal stage.
 *
 * @param {Function} callback  The callback to run when the event is fired.
 * @param {Object}   [options] The callback options.
 */
const onJournalEntry = (callback, options = {}) => {
  const stage = options.stage || 'interactions';
  const id = options.id || (callback.name ? `journal-callback-${callback.name}` : `journal-callback-${Math.random().toString(36).slice(2, 15)}`);

  if (!callbacks.has(stage)) {
    throw new Error(`Unknown journal stage: ${stage}`);
  }

  callbacks.get(stage).push({ callback, id });
};

const onJournalEntriesProcessed = (callback) => {
  finishedProcessingCallbacks.push(callback);

  return () => {
    const index = finishedProcessingCallbacks.indexOf(callback);
    if (-1 !== index) {
      finishedProcessingCallbacks.splice(index, 1);
    }
  };
};

export { JOURNAL_STAGES, replaceJournalEntry, makeJournalEntry, addJournalEntry, onJournalEntry, onJournalEntriesProcessed, observeJournalEntries, processJournalEntries };
