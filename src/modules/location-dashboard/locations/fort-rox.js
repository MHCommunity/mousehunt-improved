import { getFortRoxState } from '@utils/shared/stages/fort-rox';

/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (!quests.QuestFortRox) {
    return '';
  }

  const { isLair, phase, hp, maxHp } = getFortRoxState({ quests });

  if (isLair) {
    return 'In Lair';
  }

  return `${phase || 'Day'}: ${hp}/${maxHp} HP`;
};
