/**
 * Add an event to the event registry.
 *
 * @param {string}   eventName     The name of the event.
 * @param {Function} eventCallback The callback to run when the event is fired.
 * @param {Object}   args          The arguments for the event.
 */
const addEvent = (eventName, eventCallback, args) => {
  const {
    eventScope = null,
    removeAfterFire = false,
    weight = 0,
    id = null
  } = args || {};

  if (! eventRegistry) {
    return;
  }

  eventRegistry.addEventListener(eventName, eventCallback, eventScope, removeAfterFire, weight, id);
};

/**
 * Fire an event.
 *
 * @param {string} eventName The name of the event to fire.
 * @param {Object} params    The parameters to pass to the event.
 */
const doEvent = (eventName, params) => {
  if (! eventRegistry) {
    return;
  }

  eventRegistry.doEvent(eventName, params);
};

/**
 * Add something to the event registry.
 *
 * @param {string}   event    The event name.
 * @param {Function} callback The callback to run when the event is fired.
 * @param {boolean}  remove   Whether or not to remove the event listener after it's fired.
 */
const onEvent = (event, callback, remove = false) => {
  if (! eventRegistry) {
    return;
  }

  eventRegistry.addEventListener(event, callback, null, remove);
};

const onSettingsChange = (key, callback) => {
  // If callback is a function, then use it. If it's an object, then use the 'enable' and 'disable' keys.
  onEvent('mh-improved-settings-changed', (args) => {
    if (args.key !== key) {
      return;
    }

    if (typeof callback === 'function') {
      callback(args);
    } else if (typeof callback === 'object') {
      if (args.value) {
        callback.enable(args);
      } else {
        callback.disable(args);
      }
    }
  });
};

export {
  addEvent,
  doEvent,
  onEvent,
  onSettingsChange
};
