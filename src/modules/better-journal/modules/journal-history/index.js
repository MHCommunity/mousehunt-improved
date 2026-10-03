import {
  addEvent,
  addStyles,
  dbGet,
  dbGetAll,
  dbGetCount,
  dbSet,
  getCurrentPage,
  getData,
  makeElement,
  makeMhButton,
  onJournalEntry,
  onNavigation,
  onRequest,
  processJournalEntries,
} from '@utils';

import styles from './styles.css';

/**
 * Make the markup for the journal entries.
 *
 * @param {Array} entries The journal entries.
 *
 * @return {string} The markup.
 */
const makeEntriesMarkup = (entries) => {
  return entries
    .map((entry) => {
      if (entry.data) {
        entry = entry.data;
      }

      entry = {
        id: entry?.id || 0,
        timestamp: entry?.timestamp || 0,
        date: entry?.date || '0:00',
        location: entry?.location || '',
        text: entry?.text || '',
        type: entry?.type || [],
        image: entry?.image || '',
      };

      if (
        (entry.type.includes('catchsuccess') ||
          entry.type.includes('catchsuccessloot') ||
          entry.type.includes('bonuscatchsuccess') ||
          entry.type.includes('luckycatchsuccess') ||
          entry.type.includes('bonuscatchsuccess')) &&
        !entry.mouse
      ) {
        // get the mouse type by parsing the link for hg.views.MouseView.show
        const mouseLink = entry.text.match(/hg\.views\.MouseView\.show\('([^']+)'\)/);
        if (mouseLink && mouseLink[1]) {
          entry.mouse = mouseLink[1];
        }
      }

      let html = `<div class="${entry.type.filter((cls) => !['newEntry', 'animate'].includes(cls)).join(' ')}" data-entry-id="${entry.id}" data-mouse-type="${entry.mouse || ''}">`;
      if (entry.mouse && miceThumbs.length) {
        const mouseImages = miceThumbsMap ? miceThumbsMap.get(entry.mouse) : miceThumbs.find((mouse) => mouse.type === entry.mouse);
        if (mouseImages) {
          html += `<div class="journalimage"><a onclick="hg.views.MouseView.show('${entry.mouse}'); return false;"><img src="${mouseImages.thumb}" alt="${mouseImages.name}" title="${mouseImages.name}" /></a></div>`;
        }
      }

      if (entry.image && !entry.mouse) {
        html += `<div class="journalimage">${entry.image}</div>`;
      }

      let timestamp = '';
      if (entry.timestamp) {
        timestamp = new Date(entry.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      html += `<div class="journalbody">
        <div class="journalactions"></div>
        <div class="journalenvdate">
          <div class="journaldate">${entry.date} - </div>
          <div class="journalenvironment">${entry.location}</div>
          <span class="history-timestamp">${timestamp}</span>
        </div>
        <div class="journaltext">${entry.text}</div>
      </div>
    </div>`;

      return html;
    })
    .join('');
};

/**
 * Render the history entries for a journal page.
 *
 * @param {number} page The page number to render.
 */
const doPageStuff = async (page) => {
  if (page <= defaultPages || page > totalPages) {
    return;
  }

  const journalEntryContainer = document.querySelector('#journalContainer .journalEntries');
  if (!journalEntryContainer) {
    return;
  }

  // The game has just swapped in an empty page. If the entries are already
  // cached, render them right away so the empty page never gets painted.
  let entries = journalEntries;
  if (!entries) {
    journalEntryContainer.append(makeElement('div', 'journal-history-loading', 'Loading journal history…'));
    entries = await getAllEntries();
    journalEntryContainer.querySelector('.journal-history-loading')?.remove();

    // The page may have changed while the entries were loading.
    if (!journalEntryContainer.isConnected || pager?.getCurrentPage() !== page) {
      return;
    }
  }

  const journalEntriesForPage = entries.slice((page - 1) * perPage, page * perPage);
  if (!journalEntriesForPage.length) {
    return;
  }

  // The journal page splits entries into two columns, the camp journal doesn't.
  const leftCol = journalEntryContainer.querySelector(':scope > .leftcol');
  const rightCol = journalEntryContainer.querySelector(':scope > .rightcol');
  if (leftCol && rightCol) {
    const half = Math.ceil(journalEntriesForPage.length / 2);
    leftCol.insertAdjacentHTML('beforeend', makeEntriesMarkup(journalEntriesForPage.slice(0, half)));
    rightCol.insertAdjacentHTML('beforeend', makeEntriesMarkup(journalEntriesForPage.slice(half)));
  } else {
    journalEntryContainer.append(makeElement('div', 'journal-history-entries', makeEntriesMarkup(journalEntriesForPage)));
  }

  await processJournalEntries(journalEntryContainer);
};

/**
 * Retrieve all journal entries from the database, loading them only once.
 *
 * @return {Promise<Array>} Journal entries, newest first.
 */
const getAllEntries = async () => {
  if (journalEntries) {
    return journalEntries;
  }

  if (!journalEntriesPromise) {
    journalEntriesPromise = dbGetAll('journal')
      .then((entries) => {
        // sort the entries by id, with the newest first. if timestamp exists, sort those first.
        journalEntries = (entries || []).sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }

          if (a.id && b.id) {
            return b.id - a.id;
          }

          return 0;
        });

        return journalEntries;
      })
      .catch(() => [])
      .finally(() => {
        journalEntriesPromise = null;
      });
  }

  return journalEntriesPromise;
};

let lastDate = '';

/**
 * Save a journal entry to the database.
 *
 * @param {Object} model The journal entry model to save.
 */
const saveToDatabase = async (model) => {
  const entry = model.el;
  if (!entry || !entry.classList) {
    return;
  }

  if ('camp' !== getCurrentPage() && 'journal' !== getCurrentPage()) {
    return;
  }

  const entryId = Number.parseInt(entry.getAttribute('data-entry-id'), 10);
  if (!entryId) {
    return;
  }

  if (!model.textEl) {
    return;
  }

  const original = await dbGet('journal', entryId);

  if (original && original.data?.text) {
    return;
  }

  const dateEl = entry.querySelector('.journaldate');

  let date = dateEl ? dateEl.innerText : lastDate;
  lastDate = date;

  date = date.split('-');

  const location = entry.querySelector('.journalenvironment');

  const entryImage = entry.querySelector('.journalimage');

  const journalData = {
    id: entryId,
    timestamp: Date.now(),
    date: date[0] ? date[0].trim() : '0:00',
    location: location ? location.innerText : '',
    text: model.html,
    type: [...model.classes].filter((cls) => !['newEntry', 'animate'].includes(cls)),
    mouse: model.mouseType || null,
    image: entryImage ? entryImage.innerHTML : null,
  };

  await dbSet('journal', journalData);

  // Keep the cached entries current so history pages don't need a reload.
  if (journalEntries && !journalEntries.some((cached) => cached.id === entryId)) {
    journalEntries.unshift({ id: entryId, data: journalData });
  }
};

const addPageSelector = () => {
  const current = document.querySelector('.pagerView-section.current');
  if (!current) {
    return;
  }

  // if it has the page selector class, it's already been added
  if (current.classList.contains('page-selector')) {
    return;
  }

  current.classList.add('page-selector');

  let isShowing = false;
  current.addEventListener('click', (event) => {
    if (isShowing) {
      if (event.target.classList.contains('page-selector')) {
        const pageSelector = document.querySelector('.journal-history-page-selector');
        if (pageSelector) {
          pageSelector.remove();
        }
      }

      return;
    }

    isShowing = true;

    const target = event.target;
    const pageSelector = makeElement('div', 'journal-history-page-selector');
    const pageInputLabel = makeElement('label', 'page-input-label', 'Go to page:');
    pageInputLabel.htmlFor = 'page-input';
    pageSelector.append(pageInputLabel);

    const pageInput = makeElement('input', 'page-input');
    pageInput.type = 'number';
    pageInput.min = 1;
    pageInput.max = totalPages;

    /**
     * Show the selected page.
     */
    const showPage = () => {
      // Refresh the pager.
      getPager();

      pager.showPage(Number.parseInt(pageInput.value, 10));

      setTimeout(() => {
        pageSelector.remove();
        isShowing = false;
      }, 500);
    };

    pageInput.addEventListener('keydown', (evt) => {
      if ('Enter' === evt.key) {
        evt.preventDefault();
        showPage();
      }
    });

    const pageSubmit = makeMhButton({
      text: 'Go',
      className: 'page-submit',
      callback: showPage,
      appendTo: pageSelector,
    });

    pageSelector.append(pageInput, pageSubmit);
    target.append(pageSelector);

    pageInput.focus();
  });
};

const getPager = () => {
  const journalPageLink = document.querySelector('.pagerView-nextPageLink.pagerView-link');
  if (!journalPageLink) {
    return;
  }

  pager = hg.views.JournalView.getPager(journalPageLink);

  return pager;
};

/**
 * Handle the journal history.
 */
const doJournalHistory = async () => {
  if (!('camp' === getCurrentPage() || 'journal' === getCurrentPage())) {
    return;
  }

  perPage = 'journal' === getCurrentPage() ? 24 : 12;
  defaultPages = 'journal' === getCurrentPage() ? 3 : 6;

  if (!pager) {
    getPager();
  }

  if (!pager || !pager.getTotalItems()) {
    return;
  }

  const entryCount = journalEntries ? journalEntries.length : await dbGetCount('journal');

  totalPages = Math.ceil(entryCount / perPage);
  totalPages = totalPages <= defaultPages ? defaultPages : totalPages;
  if (totalPages <= defaultPages) {
    return;
  }

  // Load the entries ahead of time so changing pages can render instantly.
  getAllEntries();

  addPageSelector();

  if (!pager || !pager.setTotalItems) {
    return;
  }

  pager.setTotalItems(totalPages * perPage);
  pager.enable();
  pager.render();
};

/**
 * Wrapper for doPageStuff to use with events.
 */
const doJournalHistoryRequest = async () => {
  doJournalHistory();

  if (!pager) {
    doJournalHistory();
  }

  if (!pager) {
    return;
  }

  if (pager.getCurrentPage() > defaultPages) {
    await doPageStuff(pager.getCurrentPage());
  }
};

/**
 * Delay the journal history handling.
 */
const doDelayedJournalHistory = () => {
  setTimeout(doJournalHistory, 500);
  setTimeout(doJournalHistory, 1000);
};

/**
 * Conditionally handle the journal history based on the current page.
 */
const maybeDoJournalHistory = () => {
  pager = null;

  if ('camp' === getCurrentPage() || 'journal' === getCurrentPage()) {
    doDelayedJournalHistory();
    addEvent('ajax_response', doDelayedJournalHistory, { removeAfterFire: true });
  }
};

let pager;
let journalEntries = null;
let journalEntriesPromise = null;
let totalPages = 0;
let perPage = 12;
let defaultPages = 6;
let miceThumbs = [];
let miceThumbsMap;

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-journal-history');

  miceThumbs = await getData('mice-thumbnails');
  if (Array.isArray(miceThumbs) && miceThumbs.length) {
    miceThumbsMap = new Map(miceThumbs.map((mouse) => [mouse.type, mouse]));
  }

  doDelayedJournalHistory();
  onRequest('pages/journal.php', doJournalHistoryRequest);
  onNavigation(maybeDoJournalHistory);

  onJournalEntry(saveToDatabase, {
    id: 'better-journal-journal-history-save',
    stage: 'history-save',
  });
};
