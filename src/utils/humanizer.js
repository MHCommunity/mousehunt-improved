import humanizeDuration from 'humanize-duration';

/**
 * Humanize duration setup helper.
 *
 * @param {number} time    The time in milliseconds.
 * @param {Object} options The humanize duration options.
 *
 * @return {Object} The humanize duration object.
 */
const humanizer = (time, options) => {
  const thehumanizer = humanizeDuration.humanizer({
    language: 'shortEn',
    languages: {
      shortEn: {
        y: () => 'y',
        mo: () => 'mo',
        w: () => 'w',
        d: () => 'd',
        h: () => 'h',
        m: () => 'm',
        s: () => 's',
        ms: () => 'ms',
      },
    },
    ...options,
  });

  return thehumanizer(time);
};

/**
 * Helper to humanize a duration.
 *
 * @param {number} time    The time in milliseconds.
 * @param {Object} options The humanize duration options.
 *
 * @return {string} The humanized duration.
 */
const plainHumanizer = (time, options) => {
  const thehumanizer = humanizeDuration.humanizer(options);

  return thehumanizer(time);
};

export {
  humanizer,
  plainHumanizer
};
