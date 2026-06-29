/**
 * Parse a gold value from text, stripping commas and any trailing label
 * (e.g. "12,345 Gold" -> 12345).
 *
 * @param {string} text The text to parse.
 *
 * @return {number} The parsed number, or 0 if it could not be parsed.
 */
const parseGold = (text) => {
  if (! text) {
    return 0;
  }

  const value = Number.parseInt(String(text).split('Gold')[0].replaceAll(',', '').trim(), 10);
  return Number.isNaN(value) ? 0 : value;
};

export {
  parseGold
};
