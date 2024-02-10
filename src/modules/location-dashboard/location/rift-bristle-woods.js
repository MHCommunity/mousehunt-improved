/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestRiftBristleWoods) {
    return '';
  }

  const quest = {
    progress_goal: quests?.QuestRiftBristleWoods?.progress_goal || null,
    progress_remaining: quests?.QuestRiftBristleWoods?.progress_remaining || null,
    chamber_name: quests?.QuestRiftBristleWoods?.chamber_name || null,
    chamber_type: quests?.QuestRiftBristleWoods?.chamber_type || null,
    obelisk_percent: quests?.QuestRiftBristleWoods?.obelisk_percent || null,
    aco_sand: quests?.QuestRiftBristleWoods?.acolyte_sand || 0,
    time_sand: quests?.QuestRiftBristleWoods?.items?.rift_hourglass_sand_stat_item?.quantity || 0,
  };

  if ('acolyte_chamber' === quest.chamber_type) {
    return `Acolyte chamber: ${quest.obelisk_percent}% charged · <div class="stats">${quest.aco_sand} Acolyte sand · ${quest.time_sand} time sand</div>`;
  }

  return `${quest.chamber_name} · ${quest.progress_goal - quest.progress_remaining} / ${quest.progress_goal} loot`;
};
