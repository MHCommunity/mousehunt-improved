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

export default onJournalEntry;
