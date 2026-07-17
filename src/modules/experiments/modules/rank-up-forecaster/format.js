/**
 * Format a number with locale separators.
 *
 * @param {number} value  The value to format.
 * @param {number} digits Number of fraction digits to show.
 *
 * @return {string} The formatted value.
 */
const formatNumber = (value, digits = 0) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-';
  }

  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
};

/**
 * Shorten a large number to a compact form like 61.3m or 1.71b.
 *
 * @param {number} value The value to shorten.
 *
 * @return {string} The shortened value.
 */
const shortNumber = (value) => {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-';
  }

  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toLocaleString(undefined, { maximumFractionDigits: 2 })}b`;
  }

  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}m`;
  }

  if (Math.abs(value) >= 1e4) {
    return `${(value / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  }

  return value.toLocaleString();
};

/**
 * Format a timestamp as a readable date.
 *
 * @param {number}  timestamp The timestamp to format.
 * @param {boolean} withTime  Whether to include the time.
 *
 * @return {string} The formatted date.
 */
const formatDate = (timestamp, withTime = false) => {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return '-';
  }

  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
};

/**
 * Format a pair of timestamps as a compact date range.
 *
 * @param {number} start The start timestamp.
 * @param {number} end   The end timestamp.
 *
 * @return {string} The formatted range.
 */
const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate.getFullYear() === endDate.getFullYear()) {
    const startText = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${startText} – ${formatDate(end)}`;
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
};

/**
 * Format a number of days as a readable duration.
 *
 * @param {number} days The number of days.
 *
 * @return {string} The formatted duration.
 */
const formatDuration = (days) => {
  if (days === null || days === undefined || !Number.isFinite(days)) {
    return '-';
  }

  if (days < 1) {
    return `${Math.max(1, Math.round(days * 24)).toLocaleString()} hours`;
  }

  if (days < 60) {
    return `${Math.round(days).toLocaleString()} days`;
  }

  if (days < 730) {
    return `${(days / 30.44).toLocaleString(undefined, { maximumFractionDigits: 1 })} months`;
  }

  return `${(days / 365.25).toLocaleString(undefined, { maximumFractionDigits: 1 })} years`;
};

export { formatDate, formatDateRange, formatDuration, formatNumber, shortNumber };
