/**
 * Dashboard output for Conclusion Cliffs.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestConclusionCliffs) {
    return '';
  }

  const story = quests.QuestConclusionCliffs.story || {};

  if (story.is_postscript) {
    return `Postscript <div class="stats">${story.postscript_hunts_remaining || 0} ${story.postscript_hunts_text || 'Hunts Remaining'}</div>`;
  }

  if (! story.is_writing) {
    return 'Writer\'s Block';
  }

  const chapter = story.current_chapter || {};

  return `Chapter ${chapter.chapter_number || 0}/${story.max_chapters || 0}: ${chapter.name || ''}
  <div class="stats">${chapter.catches_remaining || 0}/${chapter.max_catches || 0} ${chapter.catches_text || 'Catches Remaining'}</div>`;
};
