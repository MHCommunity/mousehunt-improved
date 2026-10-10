import { getSetting, saveSetting } from '@utils';

// Set in the Custom Trap Selector editor, on the trap effectiveness block.
const settingKey = 'catch-rate-estimate.overall-trap-effectiveness';

let lastOverallCatchRate = null;

/**
 * Check whether the Trap Effectiveness label shows the overall catch rate.
 *
 * @return {boolean} Whether it does.
 */
const getOverallTrapEffectiveness = () => getSetting(settingKey, false);

// Most setups land between 70% and 100%, so the tiers are closer together there, and only a sure
// catch is Guaranteed. The classes color the bar like the game's tiers, which the catch rates
// table matches: green from 80%, yellow from 40%, and red below that.
const trapEffectivenessTiers = [
  [100, 'Guaranteed', 'excellent'],
  [95, 'Excellent', 'excellent'],
  [90, 'Effortless', 'effortless'],
  [85, 'Strong', 'strong'],
  [80, 'Easy', 'easy'],
  [70, 'Medium', 'medium'],
  [60, 'Moderate', 'moderate'],
  [50, 'Challenging', 'challenging'],
  [40, 'Difficult', 'difficult'],
  [25, 'Overpowering', 'overpowering'],
  [10, 'Very Poor', 'very_poor'],
  [0, 'Impossible', 'near_impossible'],
];

/**
 * Get the overall catch rate from the catch rates table next to the label.
 *
 * Copies of the trap, like the Custom Trap Selector's preview on other pages, have the table but
 * not the rate it was worked out from.
 *
 * @param {HTMLElement} text The Trap Effectiveness label.
 *
 * @return {number|null} The overall catch rate (0-1), or null if it isn't there.
 */
const getTableCatchRate = (text) => {
  const cell = text.closest('.trapSelectorView__trapStatSummaryContainer')?.querySelector('.mh-improved-cre-overall td:last-child');
  const percent = Number.parseFloat(cell?.textContent);

  return Number.isNaN(percent) ? null : percent / 100;
};

/**
 * Replace the game's Trap Effectiveness label and bar with a tier based on the overall catch rate.
 *
 * @param {number|null} [overallCatchRate] The overall catch rate (0-1), null to restore the game's label, or
 *                                         left out to use the last one.
 */
const updateTrapEffectivenessText = (overallCatchRate) => {
  if (undefined !== overallCatchRate) {
    lastOverallCatchRate = overallCatchRate;
  }

  const text = document.querySelector('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer span');
  const bar = document.querySelector('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer .campPage-trap-trapEffectivenessBar');
  if (!text || !bar) {
    return;
  }

  overallCatchRate = lastOverallCatchRate ?? getTableCatchRate(text);

  if (null === overallCatchRate || !getOverallTrapEffectiveness()) {
    if (text.dataset.originalText) {
      text.textContent = text.dataset.originalText;
      delete text.dataset.originalText;
    }

    if (undefined !== bar.dataset.originalClasses) {
      bar.className = bar.dataset.originalClasses;
      delete bar.dataset.originalClasses;
    }

    bar.style.removeProperty('--mhui-tem-fill');

    return;
  }

  text.dataset.originalText ??= text.textContent;
  bar.dataset.originalClasses ??= bar.className;

  const percent = Math.max(0, Math.min(100, overallCatchRate * 100));
  // Rounded down, so it's only Guaranteed when it's sure.
  const [, label, className] = trapEffectivenessTiers.find(([threshold]) => Math.floor(percent) >= threshold);

  const tierClasses = new Set(trapEffectivenessTiers.map(([, , tierClass]) => tierClass));
  const baseClasses = bar.dataset.originalClasses.split(' ').filter((cls) => cls && !tierClasses.has(cls));

  text.textContent = label;
  bar.className = [...baseClasses, className, 'mhui-tem-fill'].join(' ');
  // The game's bar only fills in steps, so fill it to the catch rate instead.
  bar.style.setProperty('--mhui-tem-fill', `${percent}%`);
};

/**
 * Change whether the Trap Effectiveness label shows the overall catch rate.
 *
 * @param {boolean} enabled Whether it does.
 */
const setOverallTrapEffectiveness = (enabled) => {
  saveSetting(settingKey, enabled);
  updateTrapEffectivenessText();
};

export { getOverallTrapEffectiveness, setOverallTrapEffectiveness, updateTrapEffectivenessText };
