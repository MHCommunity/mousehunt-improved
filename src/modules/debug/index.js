import {
  getCurrentDialog,
  getCurrentLocation,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  getFlags,
  getSetting,
  onActivation,
  onDeactivation,
  onDialogHide,
  onDialogShow,
  onEvent,
  onNavigation,
  onRequest,
  onTravel
} from '@utils';
import settings from './settings';

/**
 * Log a message to the console with a prefix.
 *
 * @param {string} message The message to log.
 * @param {any[]}  args    Additional arguments to log.
 */
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

/**
 * Main function.
 */
const main = () => {
  // If debug is not enabled, return.
  if (! getSetting('debug', false)) {
    return;
  }

  // To enable, either add `debug-all` or one of the following: debug-dialog, debug-navigation, debug-request, debug-events.
  if (getSetting('debug.dialog', false)) {
    let currentDialog = null;
    onDialogHide(() => {
      debug(`Dialog hidden: ${currentDialog}`);
    });

    onDialogShow('all', () => {
      currentDialog = getCurrentDialog();
      debug(`Dialog shown: ${currentDialog}`);
    });
  }

  if (getSetting('debug.navigation', false)) {
    onNavigation(() => {
      debug('onNavigation', {
        page: getCurrentPage(),
        tab: getCurrentTab(),
        subtab: getCurrentSubtab(),
      });
    });

    onTravel(null, () => {
      debug('onTravel', getCurrentLocation());
    });
  }

  if (getSetting('debug.request', false)) {
    onRequest('*', (response) => {
      debug('onRequest', response);
    });
  }

  const debugAllEvents = getSetting('debug.all-events', false);
  const debugEvents = getSetting('debug.events', false);

  if (debugEvents || debugAllEvents) {
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

    // If getFlags() contains debug-events-<event-name>, also log that event.
    for (const flag in getFlags()) {
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
      onEvent(event, (...data) => {
        debug(`onEvent: ${event}`, data);
      });
    });
  }
};

/**
 * Start the module.
 */
const init = () => {
  main();

  onActivation('dev', main);
  onDeactivation('dev', () => {
    window.location.reload();
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'debug',
  name: 'Debug',
  type: 'advanced',
  description: 'Various <a href="https://github.com/MHCommunity/mousehunt-improved/blob/main/docs/debug.md" target="_blank" rel="noreferrer">debugging</a> tools for developers and advanced users.',
  default: false,
  order: 900,
  load: init,
  settings
};
