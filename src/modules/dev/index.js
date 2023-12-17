import * as Utils from '@utils';

const isDebugging = (flag) => {
  if (Utils.getFlag('debug-all')) {
    return true;
  }

  return Utils.getFlag(flag);
};

const init = () => {
  // Add all the stuff from Utils to be accessible in the console as 'app.mhutils'
  window.app = window.app || {};
  window.app.mhutils = Utils;

  // To enable, either add `debug-all` or one of the following: debug-dialog, debug-navigation, debug-request, debug-events.
  if (isDebugging('debug-dialog')) {
    let currentDialog = null;
    Utils.onDialogHide(() => {
      Utils.devDebug(`Dialog hidden: ${currentDialog}`);
    });

    Utils.onDialogShow(() => {
      currentDialog = Utils.getCurrentDialog();
      Utils.devDebug(`Dialog shown: ${currentDialog}`);
    });
  }

  if (isDebugging('debug-navigation')) {
    Utils.onNavigation(() => {
      Utils.devDebug(`Navigated to ${Utils.getCurrentPage()} / ${Utils.getCurrentTab()} / ${Utils.getCurrentSubtab()}`);
    });

    Utils.onTravel(() => {
      Utils.devDebug(`Traveled to ${Utils.getCurrentLocation()}`);
    });
  }

  if (isDebugging('debug-request')) {
    Utils.onRequest((response) => {
      Utils.devDebug('Request made:');
      console.log(response); // eslint-disable-line no-console
      Utils.devDebug('---');
    });
  }

  if (isDebugging('debug-events')) {
    const events = [
      'ajax_response',
      'camp_quest_hud_view_initialize',
      'checkout_cart_update',
      'info_arrow_show',
      'js_dialog_hide',
      'js_dialog_show',
      'travel_complete',
      'treasure_map_update_favourite_friends',
      'treasure_map_update_sent_requests',
      'treasure_map_update',
      'user_relationship',
      'user_inventory_update',
      'user_recipe_update',
      'user_trap_update',
      'app_init',
      'camp_page_arm_item',
      'spring_hunt_claim_hidden_egg',
      'info_arrow_hide',
      'user_inventory_use_convertible',
      'set_inset_tab',
      'set_page',
      'set_tab',
      'info_arrow_show',
      'camp_page_toggle_blueprint',
      'camp_page_update_item_array',
      'user_interaction_update',
      'tournament_status_change',
    ];

    events.forEach((event) => {
      Utils.onEvent(event, (...data) => {
        Utils.devDebug(`Event fired: "${event}" with data:`);
        console.log(...data); // eslint-disable-line no-console
        Utils.devDebug('---');
      });
    });
  }
};

export default {
  id: 'dev',
  name: 'Developer Tools',
  type: 'required',
  load: init,
};
