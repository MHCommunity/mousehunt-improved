/**
 * Get the current wave of the Fiery Warpath.
 *
 * @return {number} The current wave.
 */
const getFieryWarpathWave = () => {
  let wave = 0;

  const waveEl = document.querySelector('.warpathHUD.showPortal');
  if (waveEl) {
    // get the classlist and find the one that starts with 'wave'
    const waveClass = [...waveEl.classList].find((className) => className.startsWith('wave'));
    wave = waveClass.replace('wave', '').replace('_', '');
  }

  return wave;
};

/**
 * Get the current streak of the Fiery Warpath.
 *
 * @return {number} The current streak.
 */
const getFieryWarpathStreak = () => {
  let streak = 0;

  const streakEl = document.querySelector('.warpathHUD-streakBoundingBox');
  if (streakEl) {
    streak = Number.parseInt(streakEl.innerText.replaceAll('\n', ' ').replace(' 0', '').trim()) || 0;
  }

  return streak;
};

/**
 * Get the remaining mouse population in the specified wave.
 *
 * @param {number} [wave] The wave number. Defaults to the current wave.
 *
 * @return {number} The number of mice remaining.
 */
const getFieryWarpathRemainingInWave = (wave) => {
  if (! wave) {
    wave = getFieryWarpathWave();
  }

  let remaining = 0;

  const remainingEl = document.querySelectorAll(`.warpathHUD-wave.wave_${wave} .warpathHUD-wave-mouse-population`);
  if (remainingEl.length) {
    // sum all the values that have an innerText
    remaining = [...remainingEl].reduce((sum, el) => {
      if (el.innerText) {
        sum += Number.parseInt(el.innerText);
      }
      return sum;
    }, 0);
  }

  return remaining;
};

/**
 * Get the current percentage of the Fiery Warpath.
 *
 * @return {number} The current percentage.
 */
const getFieryWarpathPercent = () => {
  let percent = 0;

  const percentEl = document.querySelector('.warpathHUD-moraleBar span');
  if (percentEl) {
    // get the style attribute and parse the width value.
    const style = percentEl.getAttribute('style');
    if (style) {
      percent = Number.parseInt(style.replace('width:', '').replace('%;', ''));
    }
  }

  return percent;
};

export {
  getFieryWarpathWave,
  getFieryWarpathStreak,
  getFieryWarpathRemainingInWave,
  getFieryWarpathPercent
};
