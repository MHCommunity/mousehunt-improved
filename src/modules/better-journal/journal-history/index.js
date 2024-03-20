import {
  addEvent,
  dbGet,
  dbGetAll,
  dbSet,
  getData,
  onNavigation,
  onRequest
} from '@utils';

let pager;
let journalEntries = [];
let totalPages = 0;
let currentPage = 0;

const makeEntriesMarkup = (entries) => {
  return entries.map((entry) => {
    entry = {
      id: entry.data?.id || 0,
      date: entry.data?.date || '0:00',
      location: entry.data?.location || '',
      text: entry.data?.text || '',
      type: entry.data?.type || [],
    };

    let html = `<div class="${entry.type.join(' ')}" data-entry-id="${entry.id}" data-mouse-type="${entry.mouse || ''}">`;
    if (entry.mouse && entry.mouse.length > 0) {
      const mouseImages = miceThumbs.find((mouse) => mouse.type === entry.mouse);
      if (mouseImages) {
        html += `<div class="journalimage"><a onclick="hg.views.MouseView.show('${entry.mouse}'); return false;"><img src="${mouseImages.thumb}" border="0"></a></div>`;
      }
    }

    html += `<div class="journalbody"><div class="journalactions"></a></div><div class="journaldate">${entry.date} - ${entry.location}</div><div class="journaltext">${entry.text}</div></div></div></div>`;

    return html;
  }).join('');
};

const doPageStuff = (page, event) => {
  if (page < 6) {
    return;
  }

  if (page === 6) {
    currentPage = page;
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  currentPage = page;

  const journalEntriesForPage = journalEntries.slice((page - 1) * 12, page * 12);
  const markup = makeEntriesMarkup(journalEntriesForPage);

  setTimeout(() => {
    const journalEntryContainer = document.querySelector('#journalContainer .journalEntries');
    if (! journalEntryContainer) {
      return;
    }

    journalEntryContainer.innerHTML = markup;

    main();
  }, 500);
};

const getPager = () => {
  const journalPageLink = document.querySelector('.pagerView-nextPageLink.pagerView-link');
  if (! journalPageLink) {
    return;
  }

  return hg.views.JournalView.getPager(journalPageLink);
};

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

const eventListeners = {
  prevLink: (event) => doPageStuff(currentPage - 1, event),
  nextLink: (event) => doPageStuff(currentPage + 1, event),
  lastLink: (event) => doPageStuff(totalPages, event),
};

const main = async () => {
  pager = pager || getPager();
  journalEntries = journalEntries.length ? journalEntries : await getAllEntries();

  totalPages = Math.ceil(journalEntries.length / 12);
  pager.setTotalItems(journalEntries.length);
  pager.enable();
  pager.render();

  const prevLink = document.querySelector('.pagerView-previousPageLink.pagerView-link');
  const nextLink = document.querySelector('.pagerView-nextPageLink.pagerView-link');
  const lastLink = document.querySelector('.pagerView-lastPageLink.pagerView-link');
  if (! prevLink || ! nextLink || ! lastLink) {
    return;
  }

  // The normal handler will only work for the first 6 pages. If we're on the 6th page, we
  // need to re-enable the next and last buttons and when they're clicked, we need to
  // handle the page change ourselves.

  prevLink.removeEventListener('click', eventListeners.prevLink);
  nextLink.removeEventListener('click', eventListeners.nextLink);
  lastLink.removeEventListener('click', eventListeners.lastLink);

  if (6 >= currentPage) {
    nextLink.addEventListener('click', eventListeners.nextLink);
    lastLink.addEventListener('click', eventListeners.lastLink);
  }

  if (currentPage >= 7) {
    prevLink.addEventListener('click', eventListeners.prevLink);
  }
};

let lastDate = '';
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

  if (original && original.text) {
    return;
  }

  const dateEl = entry.querySelector('.journaldate');

  let date = dateEl ? dateEl.innerText : lastDate;
  lastDate = date;

  date = date.split('-');

  const journalData = {
    id: entryId,
    date: date[0] ? date[0].trim() : '0:00',
    location: date[1] ? date[1].trim() : 'Unknown',
    text: entryText.innerHTML,
    type: [...entry.classList],
    mouse: entry.getAttribute('data-mouse-type') || null,
  };

  await dbSet('journal', journalData);
};

let lastResponsePage;
const onJournalRequest = (data) => {
  const reportedCurrentPage = data.journal_page.pager.current;

  if (lastResponsePage === reportedCurrentPage) {
    return;
  }

  currentPage = reportedCurrentPage;
  lastResponsePage = currentPage;

  main();
};

let miceThumbs = [];
export default async (enabled) => {
  miceThumbs = await getData('mice-thumbs');

  if (enabled) {
    onNavigation(main, { page: 'camp' });
    onRequest('pages/journal.php', onJournalRequest);
  }

  addEvent('journal-entry', saveToDatabase, { weight: 1, id: 'better-journal-history' });
};
