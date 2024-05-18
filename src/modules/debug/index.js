import * as Utils from '@utils';

import settings from './settings';

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

const main = () => {
  // Add all the stuff from Utils to be accessible in the console as 'app.mhutils'
  window.app = window.app || {};
  window.app.mhutils = Utils;

  // To enable, either add `debug-all` or one of the following: debug-dialog, debug-navigation, debug-request, debug-events.
  if (Utils.getSetting('debug.dialog', false)) {
    let currentDialog = null;
    Utils.onDialogHide(() => {
      debug(`Dialog hidden: ${currentDialog}`);
    });

    Utils.onDialogShow('all', () => {
      currentDialog = Utils.getCurrentDialog();
      debug(`Dialog shown: ${currentDialog}`);
    });
  }

  if (Utils.getSetting('debug.navigation', false)) {
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

  if (Utils.getSetting('debug.request', false)) {
    Utils.onRequest('*', (response) => {
      debug('onRequest', response);
    });
  }

  if (Utils.getSetting('debug.events', false)) {
    let events = [
      'camp_page_arm_item',
      'camp_page_toggle_blueprint',
      'camp_page_update_item_array',
      'camp_quest_hud_view_initialize',
      'checkout_cart_update',
      'info_arrow_hide',
      'info_arrow_show',
      'spring_hunt_claim_hidden_egg',
      'tournament_status_change',
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

    let hasSingleEvent = false;
    const ignoredEvents = [];

    // If Utils.getFlags() contains debug-events-<event-name>, also log that event.
    for (const flag in Utils.getFlags()) {
      if (flag.startsWith('debug-events-only-')) {
        const event = flag.replace('debug-events-only-', '');
        hasSingleEvent = event;
      } else if (flag.startsWith('debug-events-')) {
        const event = flag.replace('debug-events-', '');
        events.push(event);
      } else if (flag.startsWith('debug-events-no-')) {
        const event = flag.replace('debug-events-no-', '');
        ignoredEvents.push(event);
      }
    }

    if (ignoredEvents.length > 0) {
      events = events.filter((event) => ! ignoredEvents.includes(event));
    }

    if (hasSingleEvent) {
      events = [hasSingleEvent];
    }

    events.forEach((event) => {
      Utils.onEvent(event, (...data) => {
        debug(`onEvent: ${event}`, data);
      });
    });
  }
};

const init = () => {
  main();

  Utils.onActivation('dev', main);
  Utils.onDeactivation('dev', () => {
    window.location.reload();
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'debug',
  name: 'Debug',
  description: 'Adds all utility functions to <code>app.mhutils</code>, adds debug logs, and other development tools.',
  type: 'advanced',
  default: false,
  order: 900,
  load: init,
  settings
};
