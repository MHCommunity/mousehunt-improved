import { addHudStyles, getSetting, makeElement, onRequest } from '@utils';

import cleanChalkboard from './clean-chalkboard.css';
import regionStyles from '../../shared/folklore-forest/styles.css';
import styles from './styles.css';

const highlightIfHighest = () => {
  const transcripts = user?.quests?.QuestSchoolOfSorcery?.transcript_data;
  const currentCourse = user?.quests?.QuestSchoolOfSorcery?.current_course?.course_type;
  const currentScore = user?.quests?.QuestSchoolOfSorcery?.current_course?.course_level;

  if (! transcripts || ! currentCourse || ! currentScore) {
    return;
  }

  const courseTranscript = transcripts.find(({ courseType }) => courseType === currentCourse);
  const highestScore = courseTranscript?.highest_level || 0;

  if (! courseTranscript) {
    return;
  }

  const title = document.querySelector('.schoolOfSorceryCourseView__courseName');
  if (highestScore > currentScore) {
    title.classList.remove('schoolOfSorceryCourseView__courseName--highest');

    const existingHighestMarker = title.querySelector('.schoolOfSorceryCourseView__highestMarker');
    if (existingHighestMarker) {
      existingHighestMarker.remove();
    }

    return;
  }

  if (! title.classList.contains('schoolOfSorceryCourseView__courseName--highest')) {
    title.classList.add('schoolOfSorceryCourseView__courseName--highest');
  }

  const existingHighestMarker = title.querySelector('.schoolOfSorceryCourseView__highestMarker');
  if (existingHighestMarker) {
    return;
  }

  const highestMarker = makeElement('img', 'schoolOfSorceryCourseView__highestMarker');
  highestMarker.src = 'https://www.mousehuntgame.com/images/ui/camp/trap/star_favorite.png';
  highestMarker.src = 'https://www.mousehuntgame.com/images/ui/hud/rift_valour/upgrade_arrow.png';
  highestMarker.alt = '';
  highestMarker.setAttribute('title', 'New record for your highest in this course!');
  highestMarker.addEventListener('click', () => {
    const transcriptButton = document.querySelector('.headsUpDisplaySchoolOfSorceryView__viewTranscriptButton');
    if (transcriptButton) {
      transcriptButton.click();
    }
  });

  title.append(highestMarker);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([
    regionStyles,
    styles,
    getSetting('location-huds.school-of-sorcery-clean-chalkboard', false) && cleanChalkboard,
  ]);

  highlightIfHighest();
  onRequest('*', highlightIfHighest);
};
