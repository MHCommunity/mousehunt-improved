/**
 * Safely parse a JSON string.
 *
 * @param {*}        value        The value to parse.
 * @param {*}        defaultValue The fallback value if parsing fails.
 * @param {Function} onError      Optional callback to run on parse failure.
 *
 * @return {*} The parsed value or the fallback value.
 */
const safeJsonParse = (value, defaultValue = null, onError = null) => {
  if (null === value || undefined === value) {
    return defaultValue;
  }

  if ('string' !== typeof value) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    if ('function' === typeof onError) {
      onError(error);
    }

    return defaultValue;
  }
};

export {
  safeJsonParse
};
