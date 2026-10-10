/**
 * Capitalize the first letter of a string.
 *
 * @param {string} string The string.
 *
 * @return {string} The capitalized string.
 */
const capitalize = (string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`;

export { capitalize };
