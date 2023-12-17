const cleanupSettings = (settingsToDelete) => {
  settingsToDelete.forEach((setting) => {
    localStorage.removeItem(setting);
  });
};

export default cleanupSettings;
