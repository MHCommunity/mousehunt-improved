/**
 * Helper function to add a key and value to the global object.
 *
 * @param {string} key   Key to add.
 * @param {any}    value Value to add.
 */
const addToGlobal = (key, value) => {
  // if we don't have a global object, create it
  if (! window.mhui) {
    window.mhui = {};
  }

  // add the key and value to the global object
  window.mhui[key] = value;
  app.mhui = mhui;
};

/**
 * Helper function to get a key from the global object.
 *
 * @param {string} key Key to get.
 *
 * @return {any|boolean} Value of the key or false if not found.
 */
const getGlobal = (key) => {
  if (! window.mhui) {
    return false;
  }

  return mhui[key];
};

export {
  addToGlobal,
  getGlobal
};
