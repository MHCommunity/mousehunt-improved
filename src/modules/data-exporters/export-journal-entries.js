import { dbGetAll } from '@utils';
import { exportPopup } from './exporter';

const fetch = async () => {
  const journalEntries = await dbGetAll('journal');

  journalEntries.sort((a, b) => b.id - a.id);

  // we want to reduce the data to the data parameter only
  return journalEntries.map((entry) => {
    return {
      id: entry?.data?.id || 0,
      date: entry?.data?.date || '',
      location: entry?.data?.location || '',
      text: entry?.data?.text || '',
      type: entry?.data?.type || '',
      mouse: entry?.data?.mouse || '',
    };
  });
};

const afterFetch = (data) => {
  const totalItemsEl = document.querySelector('.export-items-footer .total-items');
  totalItemsEl.textContent = data.length.toLocaleString();
};

const exportJournalEntries = () => {
  exportPopup({
    type: 'journal-entries',
    text: 'Journal Entries',
    footerMarkup: '<div class="region-name">Total Values</div><div class="total-items">-</div>',
    fetch,
    afterFetch,
    dataIsAvailable: true,
    download: {
      headers: [
        'ID',
        'Date',
        'Location',
        'Text',
        'Type',
        'Mouse',
      ]
    },
  });
};

export default exportJournalEntries;
