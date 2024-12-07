import {
  addHudStyles,
  getSetting,
  makeElement,
  onRequest,
  onTurn,
  showHornMessage
} from '@utils';

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

const showPowerTypeReminder = () => {
  const courseType = user?.quests?.QuestSchoolOfSorcery?.current_course?.course_type;
  if ('exam_course' !== courseType) {
    return;
  }

  if (user?.quests?.QuestSchoolOfSorcery?.current_course?.using_correct_power_type) {
    return;
  }

  const powerType = user?.quests?.QuestSchoolOfSorcery?.current_course?.power_type;

  showHornMessage({
    title: 'Power Type Reminder',
    text: `The recommended power type for this course is ${powerType.charAt(0).toUpperCase() + powerType.slice(1)}.`,
    image: `https://www.mousehuntgame.com/images/powertypes/${powerType}.png`,
    type: 'error',
    button: 'Switch',
    action: () => {
      const trapSelector = document.querySelector('.campPage-trap-armedItem.weapon');
      if (trapSelector) {
        trapSelector.click();
      }
    },
    dismiss: 6000,
  });
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

  showPowerTypeReminder();
  onTurn(showPowerTypeReminder, 3000);
};
