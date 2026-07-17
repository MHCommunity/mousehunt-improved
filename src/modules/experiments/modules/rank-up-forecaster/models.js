const DAY = 24 * 60 * 60 * 1000;

/**
 * Get the median of a list of numbers.
 *
 * @param {Array} values The values to get the median of.
 *
 * @return {number|null} The median value, or null if there are no values.
 */
const median = (values) => {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * Convert samples into day-offset points relative to the first sample.
 *
 * @param {Array} samples The wisdom samples.
 *
 * @return {Array} Points with x in days and y in wisdom.
 */
const toDayPoints = (samples) => {
  if (!samples.length) {
    return [];
  }

  const origin = samples[0].timestamp;
  return samples.map((sample) => ({
    x: (sample.timestamp - origin) / DAY,
    y: sample.wisdom,
  }));
};

/**
 * Ordinary least-squares regression over a set of points.
 *
 * @param {Array} points The points to fit, each with x and y.
 *
 * @return {Object|null} The slope and intercept, or null if it can't be fit.
 */
const leastSquares = (points) => {
  if (points.length < 2) {
    return null;
  }

  let xSum = 0;
  let ySum = 0;
  let xySum = 0;
  let xxSum = 0;

  points.forEach(({ x, y }) => {
    xSum += x;
    ySum += y;
    xySum += x * y;
    xxSum += x * x;
  });

  const count = points.length;
  const denominator = count * xxSum - xSum * xSum;
  if (!denominator) {
    return null;
  }

  const slope = (count * xySum - xSum * ySum) / denominator;
  const intercept = ySum / count - (slope * xSum) / count;

  return { slope, intercept };
};

/**
 * Build a per-day forecast result from a daily wisdom rate.
 *
 * @param {Object} options                 The model result options.
 * @param {string} options.id              Model identifier.
 * @param {string} options.label           Display label.
 * @param {string} options.description     Short explanation of the model.
 * @param {number} options.samples         Number of samples used.
 * @param {number} options.ratePerDay      Estimated wisdom gained per day.
 * @param {number} options.wisdomRemaining Wisdom still needed.
 *
 * @return {Object|null} The forecast result, or null for a non-positive rate.
 */
const makePerDayForecast = ({ id, label, description, samples, ratePerDay, wisdomRemaining }) => {
  if (!ratePerDay || ratePerDay <= 0 || !Number.isFinite(ratePerDay)) {
    return null;
  }

  const daysRemaining = Math.max(0, wisdomRemaining / ratePerDay);

  return {
    id,
    label,
    description,
    kind: 'wisdom-per-day',
    samples,
    rate: ratePerDay,
    ratePerDay,
    daysRemaining,
    targetTimestamp: Date.now() + daysRemaining * DAY,
  };
};

/**
 * Linear regression model: ordinary least squares of wisdom over time.
 *
 * @param {Array}  samples         The wisdom samples.
 * @param {number} wisdomRemaining Wisdom still needed.
 * @param {Object} options         Label overrides for the variant.
 *
 * @return {Object|null} The forecast result.
 */
const linearModel = (samples, wisdomRemaining, options = {}) => {
  if (samples.length < 2) {
    return null;
  }

  const regression = leastSquares(toDayPoints(samples));
  if (!regression) {
    return null;
  }

  return makePerDayForecast({
    id: options.id || 'linear',
    label: options.label || 'Linear (all data)',
    description: options.description || 'Straight-line fit over every saved sample.',
    samples: samples.length,
    ratePerDay: regression.slope,
    wisdomRemaining,
  });
};

/**
 * Theil-Sen estimator: the median slope of all sample pairs, which is
 * robust against outliers like one-off wisdom dumps or bad samples.
 *
 * @param {Array}  samples         The wisdom samples.
 * @param {number} wisdomRemaining Wisdom still needed.
 *
 * @return {Object|null} The forecast result.
 */
const theilSenModel = (samples, wisdomRemaining) => {
  // Cap the pair count so this stays cheap even with years of samples.
  const points = toDayPoints(samples.slice(-250));
  if (points.length < 3) {
    return null;
  }

  const slopes = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const run = points[j].x - points[i].x;
      if (run > 0.01) {
        slopes.push((points[j].y - points[i].y) / run);
      }
    }
  }

  return makePerDayForecast({
    id: 'theil-sen',
    label: 'Robust trend',
    description: 'Median slope across all sample pairs; ignores outliers and one-off wisdom spikes.',
    samples: points.length,
    ratePerDay: median(slopes),
    wisdomRemaining,
  });
};

/**
 * Recency-weighted pace: an exponentially weighted average of the wisdom
 * rate between consecutive samples, so recent hunting counts for more.
 *
 * @param {Array}  samples         The wisdom samples.
 * @param {number} wisdomRemaining Wisdom still needed.
 * @param {number} halfLifeDays    Half-life for the recency weighting.
 *
 * @return {Object|null} The forecast result.
 */
const weightedPaceModel = (samples, wisdomRemaining, halfLifeDays = 7) => {
  if (samples.length < 2) {
    return null;
  }

  const now = Date.now();
  let weightedGain = 0;
  let weightedDays = 0;

  for (let i = 1; i < samples.length; i++) {
    const durationDays = (samples[i].timestamp - samples[i - 1].timestamp) / DAY;
    if (durationDays <= 0) {
      continue;
    }

    const ageDays = (now - samples[i].timestamp) / DAY;
    const decay = Math.exp((-Math.LN2 * ageDays) / halfLifeDays);

    weightedGain += (samples[i].wisdom - samples[i - 1].wisdom) * decay;
    weightedDays += durationDays * decay;
  }

  if (!weightedDays) {
    return null;
  }

  return makePerDayForecast({
    id: 'weighted-pace',
    label: 'Recent pace',
    description: 'Recency-weighted average rate; the last week or so of hunting counts the most.',
    samples: samples.length,
    ratePerDay: weightedGain / weightedDays,
    wisdomRemaining,
  });
};

/**
 * Resample irregular samples onto a daily grid using linear interpolation.
 *
 * @param {Array} samples The wisdom samples.
 *
 * @return {Array} Daily wisdom values from the first to the last sample.
 */
const resampleDaily = (samples) => {
  if (samples.length < 2) {
    return [];
  }

  const first = samples[0].timestamp;
  const last = samples.at(-1).timestamp;
  const days = Math.floor((last - first) / DAY);
  if (days < 3) {
    return [];
  }

  const values = [];
  let cursor = 0;
  for (let day = 0; day <= days; day++) {
    const time = first + day * DAY;
    while (cursor < samples.length - 2 && samples[cursor + 1].timestamp <= time) {
      cursor++;
    }

    const a = samples[cursor];
    const b = samples[cursor + 1];
    const span = b.timestamp - a.timestamp;
    const progress = span > 0 ? Math.min(1, Math.max(0, (time - a.timestamp) / span)) : 0;
    values.push(a.wisdom + (b.wisdom - a.wisdom) * progress);
  }

  return values;
};

/**
 * Holt's linear trend model (double exponential smoothing) over a daily
 * resampled series, which adapts to a changing pace faster than a
 * straight-line fit while still smoothing out noise.
 *
 * @param {Array}  samples         The wisdom samples.
 * @param {number} wisdomRemaining Wisdom still needed.
 * @param {number} alpha           Level smoothing factor.
 * @param {number} beta            Trend smoothing factor.
 *
 * @return {Object|null} The forecast result.
 */
const holtTrendModel = (samples, wisdomRemaining, alpha = 0.4, beta = 0.15) => {
  const series = resampleDaily(samples);
  if (series.length < 4) {
    return null;
  }

  let level = series[0];
  let trend = series[1] - series[0];

  for (let i = 1; i < series.length; i++) {
    const previousLevel = level;
    level = alpha * series[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - previousLevel) + (1 - beta) * trend;
  }

  return makePerDayForecast({
    id: 'holt-trend',
    label: 'Smoothed trend',
    description: 'Exponential smoothing with a trend component; adapts as your pace speeds up or slows down.',
    samples: series.length,
    ratePerDay: trend,
    wisdomRemaining,
  });
};

/**
 * Per-hunt model: regression of wisdom against total hunts, combined with
 * the observed hunts-per-day to estimate a date.
 *
 * @param {Array}  samples         The wisdom samples.
 * @param {number} wisdomRemaining Wisdom still needed.
 *
 * @return {Object|null} The forecast result.
 */
const perHuntModel = (samples, wisdomRemaining) => {
  const turnSamples = samples.filter((sample) => Number.isFinite(sample.totalTurns) && sample.wisdom);
  if (turnSamples.length < 2) {
    return null;
  }

  const origin = turnSamples[0].totalTurns;
  const regression = leastSquares(
    turnSamples.map((sample) => ({
      x: sample.totalTurns - origin,
      y: sample.wisdom,
    }))
  );

  if (!regression || regression.slope <= 0) {
    return null;
  }

  const first = turnSamples[0];
  const latest = turnSamples.at(-1);
  const huntsRemaining = Math.max(0, wisdomRemaining / regression.slope);
  const days = Math.max(1 / 24, (latest.timestamp - first.timestamp) / DAY);
  const huntsPerDay = (latest.totalTurns - first.totalTurns) / days;
  const daysRemaining = huntsPerDay > 0 ? huntsRemaining / huntsPerDay : null;

  return {
    id: 'per-hunt',
    label: 'Per hunt',
    description: 'Wisdom per hunt from your hunt totals, projected using your recent hunts per day.',
    kind: 'wisdom-per-hunt',
    samples: turnSamples.length,
    rate: regression.slope,
    ratePerDay: daysRemaining ? wisdomRemaining / daysRemaining : null,
    huntsRemaining,
    huntsPerDay,
    daysRemaining,
    targetTimestamp: daysRemaining === null ? null : Date.now() + daysRemaining * DAY,
  };
};

/**
 * Filter samples down to a recent window, falling back to the last few
 * samples when the window is too sparse.
 *
 * @param {Array}  samples The wisdom samples.
 * @param {number} days    The window size in days.
 *
 * @return {Array} The recent samples.
 */
const getRecentSamples = (samples, days = 14) => {
  const cutoff = Date.now() - days * DAY;
  const recent = samples.filter((sample) => sample.timestamp >= cutoff);
  return recent.length >= 2 ? recent : samples.slice(-10);
};

/**
 * Run every forecast model and build a consensus estimate.
 *
 * @param {Array}  samples         The wisdom samples, sorted by timestamp.
 * @param {number} wisdomRemaining Wisdom still needed to hit the target.
 *
 * @return {Object} The individual model results and the consensus.
 */
const buildForecasts = (samples, wisdomRemaining) => {
  const recent = getRecentSamples(samples);

  const models = [
    weightedPaceModel(samples, wisdomRemaining),
    holtTrendModel(samples, wisdomRemaining),
    theilSenModel(samples, wisdomRemaining),
    linearModel(samples, wisdomRemaining),
    linearModel(recent, wisdomRemaining, {
      id: 'linear-recent',
      label: 'Linear (recent)',
      description: 'Straight-line fit over the last two weeks of samples.',
    }),
    perHuntModel(recent, wisdomRemaining),
  ].filter(Boolean);

  const days = models.map((model) => model.daysRemaining).filter((value) => value !== null && Number.isFinite(value));

  if (!days.length) {
    return { models, consensus: null };
  }

  const daysRemaining = median(days);
  const earliestDays = Math.min(...days);
  const latestDays = Math.max(...days);

  // Spread of the models relative to the consensus tells us how much
  // they agree; a tight spread means a more trustworthy estimate.
  const spread = daysRemaining > 0 ? (latestDays - earliestDays) / daysRemaining : 0;
  let confidence = 'low';
  if (models.length >= 3 && spread < 0.35) {
    confidence = 'high';
  } else if (models.length >= 2 && spread < 0.9) {
    confidence = 'medium';
  }

  return {
    models,
    consensus: {
      daysRemaining,
      targetTimestamp: Date.now() + daysRemaining * DAY,
      earliestTimestamp: Date.now() + earliestDays * DAY,
      latestTimestamp: Date.now() + latestDays * DAY,
      ratePerDay: daysRemaining > 0 ? wisdomRemaining / daysRemaining : null,
      confidence,
      modelCount: models.length,
    },
  };
};

export { buildForecasts, getRecentSamples };
