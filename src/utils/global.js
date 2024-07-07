/**
 * Helper function to add a key and value to the global object.
 *
 * @param {string} key   Key to add.
 * @param {any}    value Value to add.
 */
const setGlobal = (key, value) => {
  if (! app.mhui) {
    app.mhui = {};
  }

  app.mhui[key] = value;
};

/**
 * Helper function to get a key from the global object.
 *
 * @param {string} key Key to get.
 *
 * @return {any|boolean} Value of the key or false if not found.
 */
const getGlobal = (key) => {
  if (app?.mhui && app.mhui[key]) {
    return app.mhui[key];
  }

  if (window?.mhui && window.mhui[key]) {
    return window.mhui[key];
  }

  return false;
};

export {
  setGlobal,
  getGlobal
};
