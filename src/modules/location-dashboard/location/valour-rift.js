export default (quests) => {
  if (! quests.QuestRiftValour) {
    return;
  }

  const quest = {
    floor: quests?.QuestRiftValour?.floor || 0,
    floor_name: quests?.QuestRiftValour?.floor_name || 'Outside',
    floor_steps: quests?.QuestRiftValour?.floor_steps || 0,
    hunts_remaining: quests?.QuestRiftValour?.hunts_remaining || 0,
    current_step_formatted: quests?.QuestRiftValour?.current_step_formatted || '0',
    speed: quests?.QuestRiftValour?.power_up_data?.hunt_limit?.current_level || 0,
    sync: quests?.QuestRiftValour?.power_up_data?.long_stride?.current_level || 0,
    siphon: quests?.QuestRiftValour?.power_up_data?.siphon?.current_level || 0,
  };

  let text = '';

  text = quest.floor === 0 ? 'Outside' : `Floor ${quest.floor} (${quest.floor_name}) ${quest.hunts_remaining} hunts remaining`;

  return `${text} <div class="stats">Speed ${quest.speed} · Sync ${quest.sync} · Siphon ${quest.siphon}</div>`;
};
