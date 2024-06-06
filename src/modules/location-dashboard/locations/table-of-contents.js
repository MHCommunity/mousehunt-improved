/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestTableOfContents) {
    return '';
  }

  const q = quests.QuestTableOfContents;

  if (! q.is_writing) {
    return 'Not writing';
  }

  return `Writing: ${q.current_book.name} (${q.current_book.percent}%) <div class="stats">${q.current_book.word_count_formatted} words · ${q.current_book.hunts_remaining} hunts remaining</div>`;
};
