import * as Utils from '@utils';

const isDebugging = (flag) => {
  if (Utils.getFlag('debug-all')) {
    return true;
  }

  return Utils.getFlag(flag);
};

const debug = (message, ...args) => {
  const textMessages = [];
  const objectMessages = [];

  for (const arg of args) {
    if (typeof arg === 'string') {
      textMessages.push(arg);
    } else {
      objectMessages.push(arg);
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `%cMH Improved:%c ${message}`,
    'color: #ff3434; font-weight: 900; font-size: 1.1em',
    'color: inherit; font-weight: inherit; font-size: inherit',
    ...textMessages,
    ...objectMessages
  );
};

const init = () => {
  // Add all the stuff from Utils to be accessible in the console as 'app.mhutils'
  window.app = window.app || {};
  window.app.mhutils = Utils;

  // To enable, either add `debug-all` or one of the following: debug-dialog, debug-navigation, debug-request, debug-events.
  if (isDebugging('debug-dialog')) {
    let currentDialog = null;
    Utils.onDialogHide(() => {
      debug(`Dialog hidden: ${currentDialog}`);
    });

    Utils.onDialogShow('all', () => {
      currentDialog = Utils.getCurrentDialog();
      debug(`Dialog shown: ${currentDialog}`);
    });
  }

  if (isDebugging('debug-navigation')) {
    Utils.onNavigation(() => {
      debug('onNavigation', {
        page: Utils.getCurrentPage(),
        tab: Utils.getCurrentTab(),
        subtab: Utils.getCurrentSubtab(),
      });
    });

    Utils.onTravel(null, () => {
      debug('onTravel', Utils.getCurrentLocation());
    });
  }

  if (isDebugging('debug-request')) {
    Utils.onRequest('all', (response) => {
      debug('onRequest', response);
    });
  }

  if (isDebugging('debug-events')) {
    const events = [
      'ajax_response',
      'app_init',
      'camp_page_arm_item',
      'camp_page_toggle_blueprint',
      'camp_page_update_item_array',
      'camp_quest_hud_view_initialize',
      'checkout_cart_update',
      'info_arrow_hide',
      'info_arrow_show',
      'js_dialog_hide',
      'js_dialog_show',
      'set_inset_tab',
      'set_page',
      'set_tab',
      'spring_hunt_claim_hidden_egg',
      'tournament_status_change',
      'travel_complete',
      'treasure_map_update_favourite_friends',
      'treasure_map_update_sent_requests',
      'treasure_map_update',
      'user_interaction_update',
      'user_inventory_update',
      'user_inventory_use_convertible',
      'user_recipe_update',
      'user_relationship',
      'user_trap_update',
    ];

    events.forEach((event) => {
      Utils.onEvent(event, (...data) => {
        debug(`onEvent: ${event}`, data);
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
