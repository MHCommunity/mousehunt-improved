import { capitalize } from './utils';

/**
 * Get the School of Sorcery stage.
 *
 * @param {Object} context        The stager context.
 * @param {Object} context.quests The user's quests.
 *
 * @return {Object} The stage for each source.
 */
export default ({ quests }) => {
  const dataCourses = {
    arcane_101_course: 'Arcane Arts',
    shadow_101_course: 'Shadow Sciences',
  };

  const quest = quests.QuestSchoolOfSorcery;
  if (!quest.in_course) {
    return { data: 'Hallway', live: 'Hallway' };
  }

  const course = quest.current_course;
  const isExam = 'exam_course' === course.course_type;
  const powerType = capitalize(course.power_type || '');
  const courseName = quest.course_selections?.find((selection) => selection.type === course.course_type)?.name ?? null;

  let live = courseName;
  if (courseName && course.is_boss_encounter) {
    live = `${courseName} Boss`;
  } else if (courseName && isExam) {
    live = `${courseName} - ${powerType}`;
  }

  let data = dataCourses[course.course_type] ?? null;
  if (isExam) {
    data = course.is_boss_encounter ? 'Final Exam - Boss' : `Final Exam - ${powerType}`;
  } else if (data && course.is_boss_encounter) {
    data += ' - Boss';
  }

  return { data, live };
};
