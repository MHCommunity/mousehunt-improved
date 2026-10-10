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

// Most setups land between 70% and 100%, so the tiers are closer together there. Easy starts at
// 85% and Mild at 60%, where the catch rate colors in the table change.
const trapEffectivenessTiers = [
  [100, 'Excellent', 'excellent'],
  [95, 'Effortless', 'effortless'],
  [90, 'Strong', 'strong'],
  [85, 'Easy', 'easy'],
  [80, 'Medium', 'medium'],
  [70, 'Moderate', 'moderate'],
  [60, 'Mild', 'mild'],
  [50, 'Challenging', 'challenging'],
  [40, 'Difficult', 'difficult'],
  [25, 'Overpowering', 'overpowering'],
  [10, 'Very Poor', 'very_poor'],
  [0, 'Impossible', 'near_impossible'],
];

/**
 * Replace the game's Trap Effectiveness label and bar with a tier based on the overall catch rate.
 *
 * @param {number|null} overallCatchRate The overall catch rate (0-1), or null to restore the game's label.
 */
const updateTrapEffectivenessText = (overallCatchRate = lastOverallCatchRate) => {
  lastOverallCatchRate = overallCatchRate;

  const text = document.querySelector('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer span');
  const bar = document.querySelector('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer .campPage-trap-trapEffectivenessBar');
  if (!text || !bar) {
    return;
  }

  if (null === overallCatchRate || !getOverallTrapEffectiveness()) {
    if (text.dataset.originalText) {
      text.textContent = text.dataset.originalText;
      delete text.dataset.originalText;
    }

    if (undefined !== bar.dataset.originalClasses) {
      bar.className = bar.dataset.originalClasses;
      delete bar.dataset.originalClasses;
    }

    return;
  }

  text.dataset.originalText ??= text.textContent;
  bar.dataset.originalClasses ??= bar.className;

  const percent = Math.max(0, Math.min(100, Math.round(overallCatchRate * 100)));
  const [, label, className] = trapEffectivenessTiers.find(([threshold]) => percent >= threshold);

  const tierClasses = new Set(trapEffectivenessTiers.map(([, , tierClass]) => tierClass));
  const baseClasses = bar.dataset.originalClasses.split(' ').filter((cls) => cls && !tierClasses.has(cls));

  text.textContent = label;
  bar.className = [...baseClasses, className].join(' ');
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
