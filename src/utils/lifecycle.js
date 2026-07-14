let currentLifecycle = null;

/**
 * Create a lifecycle used to guard long-lived callbacks.
 *
 * @param {string} id The lifecycle identifier.
 *
 * @return {Object} The lifecycle state.
 */
const createLifecycle = (id) => ({ id, active: false });

/**
 * Run synchronous setup work within a lifecycle registration context.
 *
 * Location implementations register their long-lived callbacks synchronously,
 * even when their exported initializer is declared async. Registrations can be
 * suppressed on refresh while the implementation still reapplies its DOM work.
 *
 * @param {Object}   lifecycle The lifecycle state.
 * @param {Function} callback  The setup work to run.
 * @param {boolean}  register  Whether long-lived callbacks may be registered.
 *
 * @return {*} The callback result.
 */
const runInLifecycle = (lifecycle, callback, register = true) => {
  const previousLifecycle = currentLifecycle;
  currentLifecycle = { lifecycle, register };

  try {
    return callback();
  } finally {
    currentLifecycle = previousLifecycle;
  }
};

/**
 * Prepare a callback registered while a lifecycle is being initialized.
 *
 * @param {Function} callback The callback to guard.
 * @param {string}   type     The registration type.
 *
 * @return {Object} Registration metadata.
 */
const prepareLifecycleCallback = (callback, type) => {
  if (! currentLifecycle) {
    return { callback, id: null, skip: false };
  }

  if (! currentLifecycle.register) {
    return { callback, id: null, skip: true };
  }

  const { lifecycle } = currentLifecycle;

  return {
    callback: (...args) => {
      if (lifecycle.active) {
        return callback(...args);
      }
    },
    id: `${lifecycle.id}:${type}:${callback.toString()}`,
    skip: false,
  };
};

export {
  createLifecycle,
  prepareLifecycleCallback,
  runInLifecycle
};
