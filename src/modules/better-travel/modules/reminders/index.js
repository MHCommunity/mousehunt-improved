import { getCurrentLocation, getFlag, showHornMessage } from '@utils';

/**
 * Allow the user to disable reminder for specific items.
 *
 * @param {string} item The item to disable the reminder for.
 *
 * @return {boolean} True if the reminder was disabled.
 */
const hasDisabledReminder = (item) => {
  return getFlag(`better-travel-no-reminder-${item}`);
};

/**
 * Add reminders to the horn when traveling.
 */
const addReminders = () => {
  const reminderOpts = {
    title: 'Travel Reminder',
    dismiss: 4000,
  };

  switch (getCurrentLocation()) {
  case 'rift_valour':
    if (hasDisabledReminder('champions-fire')) {
      break;
    }

    if (user.quests?.QuestRiftValour?.is_fuel_enabled) {
      reminderOpts.text = 'Champion\'s Fire is active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/6622efd1db7028b30f48b15771138720.png';
      reminderOpts.button = 'Deactivate';
      /**
       * Toggle the fuel.
       */
      reminderOpts.action = () => {
        const button = document.querySelector('.valourRiftHUD-fuelContainer-armButton');
        if (button) {
          button.click();
        }
      };
    }
    break;
  case 'queso_river':
  case 'queso_plains':
  case 'queso_quarry':
  case 'queso_geyser':
    if (hasDisabledReminder('wild-tonic')) {
      break;
    }

    if (
      user.quests?.QuestQuesoCanyon?.is_wild_tonic_active ||
      user.quests?.QuestQuesoGeyser?.is_wild_tonic_enabled
    ) {
      reminderOpts.text = 'Wild Tonic is active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/b6b9f97a1ee3692fdff0b5a206adf7e1.png';
      reminderOpts.button = 'Deactivate';
      /**
       * Toggle the fuel.
       */
      reminderOpts.action = () => {
        const button = document.querySelector('.quesoHUD-wildTonic-button');
        if (button) {
          button.click();
        }
      };
    }
    break;
  case 'floating_islands':
    if (hasDisabledReminder('bottled-wind')) {
      break;
    }

    if ('launch_pad_island' === user.quests?.QuestFloatingIslands?.hunting_site_atts?.island_power_type) {
      break;
    }

    if (
      ! user.quests?.QuestFloatingIslands?.hunting_site_atts?.is_fuel_enabled && // BW not active.
      ! (
        user.quests?.QuestFloatingIslands?.hunting_site_atts?.is_vault_island && // is SP.
        user.quests?.QuestFloatingIslands?.hunting_site_atts?.island_mod_panels[2]?.is_complete // Is on the 4th tile.
      )
    ) {
      reminderOpts.text = 'Bottled Wind is <strong>not</strong> active.';
      reminderOpts.image = 'https://www.mousehuntgame.com/images/ui/hud/floating_islands/items/bottled_wind_stat_item.png';
      reminderOpts.button = 'Activate';
      /**
       * Toggle the fuel.
       */
      reminderOpts.action = () => {
        const button = document.querySelector('.floatingIslandsHUD-fuel-button');
        if (button) {
          button.click();
        }
      };
    }
    break;
  case 'bountiful_beanstalk':
  case 'foreword_farm':
  case 'prologue_pond':
  case 'table_of_contents':
  case 'school_of_sorcerey':
    if (hasDisabledReminder('condensed-creativity')) {
      break;
    }

    if (
      user.quests?.QuestBountifulBeanstalk?.is_fuel_enabled ||
      user.quests?.QuestProloguePond?.is_fuel_enabled ||
      user.quests?.QuestForewordFarm?.is_fuel_enabled ||
      user.quests?.QuestTableOfContents?.is_fuel_enabled ||
      user.quests?.QuestSchoolOfSorcery?.is_fuel_enabled
    ) {
      reminderOpts.text = 'Condensed Creativity is active.';
      reminderOpts.button = 'Deactivate';
    } else {
      reminderOpts.text = 'Condensed Creativity is <strong>not</strong> active.';
      reminderOpts.button = 'Activate';
    }

    reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/4f5d55c1eff77474c7363f0e52d03e49.png';
    reminderOpts.action = hg.views.HeadsUpDisplayFolkloreForestRegionView.toggleFuel;
    break;
  case 'winter_hunt_grove':
  case 'winter_hunt_workshop':
  case 'winter_hunt_fortress':
    if (hasDisabledReminder('festive-spirit')) {
      break;
    }

    if (
      user.quests?.QuestCinnamonTreeGrove?.is_fuel_enabled ||
      user.quests?.QuestGolemWorkshop?.is_fuel_enabled ||
      user.quests?.QuestIceFortress?.is_fuel_enabled
    ) {
      reminderOpts.text = 'Festive Spirit is active.';
      reminderOpts.button = 'Deactivate';
    } else if ('winter_hunt_forest' === getCurrentLocation()) {
      reminderOpts.text = 'Festive Spirit is <strong>not</strong> active.';
      reminderOpts.button = 'Activate';
    }

    reminderOpts.image = 'https://www.mousehuntgame.com/images/items/stats/large/cda292833fce3b65b7a6a38c000e8620.png';
    /**
     * Toggle the fuel.
     */
    reminderOpts.action = () => {
      const toggle = document.querySelector('.headsUpDisplayWinterHuntRegionView__fuelButton');
      if (toggle) {
        toggle.click();
      }
    };
  }

  if (reminderOpts.text) {
    showHornMessage(reminderOpts);
  }
};

export default addReminders;
