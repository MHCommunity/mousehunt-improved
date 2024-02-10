/**
 * Removes settings from local storage.
 *
 * @param {Array} settingsToDelete An array of setting ids to remove from local storage.
 */
const cleanupSettings = (settingsToDelete) => {
  settingsToDelete.forEach((setting) => {
    localStorage.removeItem(setting);
  });
};

export default cleanupSettings;
