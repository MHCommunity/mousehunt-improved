import {
  addEvent,
  dbGet,
  dbGetAll,
  dbSet,
  doEvent,
  getCurrentPage,
  getData,
  makeElement,
  onNavigation,
  onRequest
} from '@utils';
import onJournalEntry from '../journal-event';

/**
 * Make the markup for the journal entries.
 *
 * @param {Array} entries The journal entries.
 *
 * @return {string} The markup.
 */
const makeEntriesMarkup = (entries) => {
  return entries.map((entry) => {
    if (entry.data) {
      entry = entry.data;
    }

    entry = {
      id: entry?.id || 0,
      date: entry?.date || '0:00',
      location: entry?.location || '',
      text: entry?.text || '',
      type: entry?.type || [],
      image: entry?.image || '',
    };

    if (
      (
        entry.type.includes('catchsuccess') ||
        entry.type.includes('catchsuccessloot') ||
        entry.type.includes('bonuscatchsuccess') ||
        entry.type.includes('luckycatchsuccess') ||
        entry.type.includes('bonuscatchsuccess')
      ) && ! entry.mouse
    ) {
      // get the mouse type by parsing the link for hg.views.MouseView.show
      const mouseLink = entry.text.match(/hg\.views\.MouseView\.show\('([^']+)'\)/);
      if (mouseLink && mouseLink[1]) {
        entry.mouse = mouseLink[1];
      }
    }

    let html = `<div class="${entry.type.join(' ')}" data-entry-id="${entry.id}" data-mouse-type="${entry.mouse || ''}">`;
    if (entry.mouse) {
      const mouseImages = miceThumbs.find((mouse) => mouse.type === entry.mouse);
      if (mouseImages) {
        html += `<div class="journalimage"><a onclick="hg.views.MouseView.show('${entry.mouse}'); return false;"><img src="${mouseImages.thumb}" border="0"></a></div>`;
      }
    }

    if (entry.image && ! entry.mouse) {
      html += `<div class="journalimage">${entry.image}</div>`;
    }

    html += `<div class="journalbody"><div class="journalactions"></a></div><div class="journaldate">${entry.date} - ${entry.location}</div><div class="journaltext">${entry.text}</div></div></div></div>`;

    return html;
  }).join('');
};

/**
 * Handle actions for a journal page.
 *
 * @param {number} page  The page number to handle.
 * @param {Event}  event The event that triggered the function, if any.
 */
const doPageStuff = (page, event = null) => {
  if (page <= 6 || page > totalPages) {
    return;
  }

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const journalEntriesForPage = journalEntries.slice((page - 1) * 12, page * 12);
  const journalEntryContainer = document.querySelector('#journalContainer .journalEntries');
  if (! journalEntriesForPage.length || ! journalEntryContainer) {
    return;
  }

  journalEntryContainer.append(makeElement('div', 'journal-history-entries', makeEntriesMarkup(journalEntriesForPage)));

  doEvent('journal-history-entry-added', journalEntryContainer);
};

/**
 * Retrieve all journal entries from the database.
 *
 * @return {Promise<Array>} Journal entries.
 */
const getAllEntries = async () => {
  if (! journalEntries.length) {
    journalEntries = await dbGetAll('journal');
  }

  if (! journalEntries.length) {
    return [];
  }

  // sort the entries by id, with the newest first
  journalEntries.sort((a, b) => b.id - a.id);

  return journalEntries;
};

let lastDate = '';

/**
 * Save a journal entry to the database.
 *
 * @param {HTMLElement} entry The journal entry element to save.
 */
const saveToDatabase = async (entry) => {
  const entryId = Number.parseInt(entry.getAttribute('data-entry-id'), 10);
  if (! entryId) {
    return;
  }

  const entryText = entry.querySelector('.journalbody .journaltext');
  if (! entryText) {
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

  const entryImage = entry.querySelector('.journalimage');

  const journalData = {
    id: entryId,
    date: date[0] ? date[0].trim() : '0:00',
    location: date[1] ? date[1].trim() : 'Unknown',
    text: entryText.innerHTML,
    type: [...entry.classList],
    mouse: entry.getAttribute('data-mouse-type') || null,
    image: entryImage ? entryImage.innerHTML : null,
  };

  await dbSet('journal', journalData);
};

/**
 * Handle the journal history.
 */
const doJournalHistory = async () => {
  if (! ('camp' === getCurrentPage() || 'journal' === getCurrentPage())) {
    return;
  }

  const perPage = ('journal' === getCurrentPage()) ? 24 : 12;
  const defaultPages = ('journal' === getCurrentPage()) ? 3 : 6;

  if (! pager) {
    const journalPageLink = document.querySelector('.pagerView-nextPageLink.pagerView-link');
    if (! journalPageLink) {
      return;
    }

    pager = hg.views.JournalView.getPager(journalPageLink);
  }

  if (! pager) {
    return;
  }

  journalEntries = journalEntries.length ? journalEntries : await getAllEntries();

  totalPages = Math.ceil(journalEntries.length / perPage);
  totalPages = totalPages <= defaultPages ? defaultPages : totalPages;
  if (totalPages < 6) {
    return;
  }

  pager.setTotalItems(totalPages * perPage);
  pager.enable();
  pager.render();
};

/**
 * Wrapper for doPageStuff to use with events.
 */
const doJournalHistoryRequest = () => {
  doJournalHistory();

  if (! pager) {
    doJournalHistory();
  }

  if (! pager) {
    return;
  }

  if (pager.getCurrentPage() > 6) {
    doPageStuff(pager.getCurrentPage());
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
let journalEntries = [];
let miceThumbs = [];

/**
 * Initialize the module.
 *
 * @param {boolean} enabled Whether the module is enabled.
 */
export default async (enabled) => {
  miceThumbs = await getData('mice-thumbnails');
  if (enabled) {
    doDelayedJournalHistory();
    onRequest('pages/journal.php', doJournalHistoryRequest);
    onNavigation(maybeDoJournalHistory);
  }

  onJournalEntry(saveToDatabase, 1);
};
