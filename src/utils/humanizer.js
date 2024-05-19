import humanizeDuration from 'humanize-duration';

/**
 * Humanize duration setup helper.
 *
 * @return {Object} The humanize duration object.
 */
const setupHumanizer = () => {
  humanizeDuration.humanizer({
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
  });

  return humanizeDuration;
};

export {
  setupHumanizer
};
