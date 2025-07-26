function humanizeTime(time, options = {}) {
  const {
    units = ['d', 'h', 'm', 's'],
    spacer = ' ',
    delimiter = ' ',
  } = options || {};

  const unitMs = {
    y: 365 * 24 * 60 * 60 * 1000,
    mo: 30 * 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
    ms: 1,
  };

  const unitLabels = {
    y: 'year',
    mo: 'month',
    w: 'week',
    d: 'day',
    h: 'hour',
    m: 'minute',
    s: 'second',
  };

  let remaining = time;
  const parts = [];

  for (const unit of units) {
    const value = Math.floor(remaining / unitMs[unit]);
    if (value > 0 || (unit === units.at(-1) && parts.length === 0)) {
      parts.push(`${value}${spacer}${unitLabels[unit]}${value > 1 ? 's' : ''}`);
      remaining -= value * unitMs[unit];
    }
  }

  return parts.join(delimiter).trim();
}

// Alias for compatibility
const humanizer = humanizeTime;
const plainHumanizer = humanizeTime;

export {
  humanizeTime,
  humanizer,
  plainHumanizer
};
