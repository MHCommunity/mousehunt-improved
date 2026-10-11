const boundListeners = new WeakMap();

/**
 * Add an event listener to a HUD element, replacing the one from an earlier run.
 *
 * Location HUD handlers rerun on every navigation while the game keeps the same
 * HUD elements, so a plain addEventListener would stack another copy each time.
 * Listeners are keyed by the handler's source, so each call site keeps one
 * listener per element and the newest closure wins.
 *
 * @param {EventTarget} element The element to listen on.
 * @param {string}      type    The event type.
 * @param {Function}    handler The listener.
 * @param {Object}      options Options passed to addEventListener.
 */
const addHudListener = (element, type, handler, options = {}) => {
  if (!element) {
    return;
  }

  let listeners = boundListeners.get(element);
  if (!listeners) {
    listeners = new Map();
    boundListeners.set(element, listeners);
  }

  const key = `${type}:${handler.toString()}`;
  const previous = listeners.get(key);
  if (previous) {
    element.removeEventListener(type, previous.handler, previous.options);
  }

  listeners.set(key, { handler, options });
  element.addEventListener(type, handler, options);
};

export default addHudListener;
