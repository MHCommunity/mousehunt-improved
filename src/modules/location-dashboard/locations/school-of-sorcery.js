/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  const quest = quests?.QuestSchoolOfSorcery;
  if (!quest) {
    return '';
  }

  const currentCourse = quest.current_course;
  if (!currentCourse || !(quest.in_course ?? currentCourse.in_course)) {
    return 'Not enrolled';
  }

  const powerType = currentCourse.power_type === 'arcane' ? 'Arcane' : 'Shadow';

  let examText = '';
  if ('exam_course' === currentCourse.course_type) {
    examText = `${powerType}, ${currentCourse.power_type_hunts_remaining} hunts until ${powerType === 'Arcane' ? 'Shadow' : 'Arcane'}`;
  }

  return `${currentCourse.course_name} · ${currentCourse.hunts_remaining || 0} hunts remaining<div class="stats">${examText}${currentCourse.is_boss_encounter ? ' At Boss' : ''}</div>`;
};
