const addEvent = (eventName, eventCallback, eventScope, removeAfterFire, weight, uniqueId) => {
  eventRegistry.addEventListener(eventName, callback, eventScope, removeAfterFire, weight, uniqueId);
};

const doEvent = (eventName, params) => {
  eventRegistry.doEvent(eventName, params);
};

const functionsAdded = {};
const addEventToFunction = (functionName, eventName) => {
  if (functionsAdded[functionName]) {
    return;
  }

  functionsAdded[functionName] = true;
  const originalFunction = window[functionName];
  window[functionName] = function() {
    doEvent(eventName, arguments);
    console.log('event fired', eventName);
    Reflect.apply(originalFunction, this, arguments);
  };
};

export {
  addEvent,
  doEvent,
  addEventToFunction
};
