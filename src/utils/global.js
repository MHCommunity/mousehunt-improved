/**
 * Helper function to add a key and value to the global object.
 *
 * @param {string} key   Key to add.
 * @param {any}    value Value to add.
 */
const setGlobal = (key, value) => {
  window.mhui = window.mhui || {};
  window.mhui[key] = value;
  app.mhui = window.mhui;
};

/**
 * Helper function to get a key from the global object.
 *
 * @param {string} key Key to get.
 *
 * @return {any|boolean} Value of the key or false if not found.
 */
const getGlobal = (key) => {
  if (window?.mhui) {
    return window.mhui[key] || false;
  }
  return app?.mhui?.[key] || false;
};

export {
  setGlobal,
  getGlobal
};
