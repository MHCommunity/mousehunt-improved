const addReminder = () => {
  let reminderText = '';
  let shouldDeactivate = true;

  switch (getCurrentLocation()) {
  case 'rift_valour':
    if (user.quests?.QuestRiftValour?.is_fuel_enabled) {
      reminderText = 'Champion\'s Fire is active.';
    }
    break;
  case 'queso_river':
  case 'queso_plains':
  case 'queso_quarry':
  case 'queso_geyser':
    if (user.quests?.QuestQuesoCanyon?.is_wild_tonic_active) {
      reminderText = 'Wild Tonic is active.';
    }
    break;
  case 'floating_islands':
    if (! user.quests?.QuestFloatingIslands?.hunting_atts?.is_fuel_enabled) {
      reminderText = 'Bottled Wind is <strong>not</strong> active.';
    }
    break;
  case 'foreword_farm':
  case 'prologue_pond':
  case 'table_of_contents':
    if (user.quests?.QuestProloguePond?.is_fuel_enabled ||
      user.quests?.QuestForewordFarm?.is_fuel_enabled ||
      user.quests?.QuestTableOfContents?.is_fuel_enabled) {
      reminderText = 'Condensed Creativity is active.';
    } else {
      shouldDeactivate = false;
      reminderText = 'Condensed Creativity is <strong>not</strong> active.';
    }
    break;
  }

  if (reminderText) {
    showHornMessage({
      title: shouldDeactivate ? 'Don\'t waste your resources!' : 'Don\'t waste your hunts!',
      text: reminderText,
      button: 'Dismiss',
      dismiss: 4000,
    });
  }
};

export default function moduleTemplate() {
  eventRegistry.addEventListener('travel_complete', addReminder);
}
