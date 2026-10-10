import { capitalize } from './utils';

/**
 * Get the Conclusion Cliffs stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const { story } = quests.QuestConclusionCliffs;

  let stage = 'Not Writing';
  if (story.is_writing && story.is_postscript) {
    stage = story.story_content.some((chapter) => 'fantasy' === chapter.genre_type) ? 'Fantasy Postscript' : 'Postscript';
  } else if (story.is_writing) {
    stage = `Writing ${capitalize(story.current_chapter.genre_type)}`;
  }

  return { data: stage, live: stage };
};
