/**
 * Get the current location.
 *
 * @return {string} The current location.
 */
const getCurrentLocation = () => {
  const location = user?.environment_type || '';
  return location.toLowerCase();
};

/**
 * Get the current location name.
 *
 * @return {string} The current location name.
 */
const getCurrentLocationName = () => {
  return user?.environment_name || getCurrentLocation();
};

export {
  getCurrentLocation,
  getCurrentLocationName
};
