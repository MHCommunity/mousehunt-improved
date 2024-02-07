const addEvent = (eventName, eventCallback, eventScope, removeAfterFire, weight, uniqueId) => {
  if (! eventRegistry) {
    return;
  }

  eventRegistry.addEventListener(eventName, callback, eventScope, removeAfterFire, weight, uniqueId);
};

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

const functionsAdded = {};
const addEventToFunction = (functionName, eventName) => {
  if (functionsAdded[functionName]) {
    return;
  }

  functionsAdded[functionName] = true;
  const originalFunction = window[functionName];
  window[functionName] = function () {
    doEvent(eventName, arguments);
    Reflect.apply(originalFunction, this, arguments);
  };
};

export {
  addEvent,
  doEvent,
  onEvent,
  addEventToFunction
};
