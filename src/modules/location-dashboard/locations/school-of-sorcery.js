/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests?.QuestSchoolOfSorcery) {
    return '';
  }

  const currentCourse = quests?.QuestSchoolOfSorcery?.current_course;
  if (! currentCourse && ! currentCourse?.in_course) {
    return 'Not enrolled';
  }

  const courseName = currentCourse?.course_name;
  const courseType = currentCourse?.course_type;
  const powerType = currentCourse?.power_type == 'arcane' ? 'Arcane' : 'Shadow';
  const isBoss = currentCourse?.is_boss_encounter;

  let examText = '';
  if ('exam_course' === courseType) {
    examText = `${powerType}, ${currentCourse?.power_type_hunts_remaining} hunts until ${powerType === 'Arcane' ? 'Shadow' : 'Arcane'}`;
  }


  return `${courseName} · ${currentCourse?.hunts_remaining || 0} hunts remaining<div class="stats">${examText}${isBoss ? ' At Boss' : ''}</div>`;
};
