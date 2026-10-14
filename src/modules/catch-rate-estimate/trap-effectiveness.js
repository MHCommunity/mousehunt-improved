import { addEvent, getCurrentPage, getSetting, onNavigation, saveSetting } from '@utils';
import { getStage } from '@utils/shared/stages';

// Set in the Custom Trap Selector editor, on the trap effectiveness block.
const settingKey = 'catch-rate-estimate.overall-trap-effectiveness';

let lastOverallCatchRate;
let lastContext = null;
let initialized = false;

/**
 * Check whether the Trap Effectiveness label shows the overall catch rate.
 *
 * @return {boolean} Whether it does.
 */
const getOverallTrapEffectiveness = () => getSetting(settingKey, false);

// Most setups land between 70% and 100%, so the tiers are closer together there, and only a sure
// catch is Guaranteed. The classes color the bar like the game's tiers, which the catch rates
// table matches below 80%: yellow from 40% and red below that. The table keeps green for a sure catch.
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
 * Identify the setup and stage a rate was calculated for. Stock consumption does not change
 * the rate until the cheese or charm runs out. Include location modifiers used by data.js too.
 *
 * @return {string} The calculation context.
 */
const getTrapEffectivenessContext = () => {
  const stage = getStage();
  const quests = user.quests || {};
  const atts = user.viewing_atts || {};
  return JSON.stringify([
    user.environment_id,
    user.weapon_item_id,
    user.base_item_id,
    user.bait_item_id,
    user.bait_quantity > 0,
    user.trinket_item_id,
    user.trinket_quantity > 0,
    user.trap_power,
    user.trap_luck,
    user.trap_power_bonus,
    user.trap_power_type_name,
    user.trap_attraction_bonus,
    user.trap_cheese_effect,
    [...document.querySelectorAll('.trapImageView-trapAura.mousehuntTooltipParent.active')].map((aura) => [...aura.classList].find((cls) => cls.startsWith('Quest'))),
    stage.dataEnvironment,
    stage.data,
    stage.live,
    stage.liveFloorMice && [...stage.liveFloorMice],
    stage.boss,
    quests.QuestAncientCity?.width,
    quests.QuestAncientCity?.boss,
    quests.QuestFortRox?.fort?.b?.level,
    quests.QuestFortRox?.fort?.c?.level,
    quests.QuestFortRox?.lair_width,
    (quests.QuestRiftBristleWoods?.acolyte_sand || 0) > 0,
    quests.QuestSandDunes?.minigame?.salt_charms_used,
    atts.zzt_amplifier,
    (atts.desert_warpath?.mice?.desert_elite_gaurd?.quantity || 0) > 0,
  ]);
};

/**
 * Replace the game's Trap Effectiveness label and bar with a tier based on the overall catch rate.
 *
 * @param {number|null} [overallCatchRate] The overall catch rate (0-1), null to restore the game's label,
 *                                       or left out to use the last one.
 * @param {string}     [context]          The context captured before calculating the rate.
 */
const updateTrapEffectivenessText = (overallCatchRate, context = getTrapEffectivenessContext()) => {
  const currentContext = getTrapEffectivenessContext();
  // A trap or stage change can finish while the asynchronous calculation is still running.
  if (context !== currentContext) {
    return;
  }

  if (undefined !== overallCatchRate) {
    lastOverallCatchRate = Number.isFinite(overallCatchRate) ? overallCatchRate : null;
    lastContext = context;
  } else if (null !== lastContext && lastContext !== currentContext) {
    lastOverallCatchRate = null;
    lastContext = currentContext;
  }

  const controls = document.querySelectorAll('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer');
  for (const control of controls) {
    const text = control.querySelector('span');
    const bar = control.querySelector('.campPage-trap-trapEffectivenessBar');
    if (!text || !bar) {
      continue;
    }

    // Only an editor preview may use its copied table; the live table can belong to an old setup.
    const rate = undefined === lastOverallCatchRate && text.closest('.mhui-trap-editor-preview') ? getTableCatchRate(text) : lastOverallCatchRate;
    if (!Number.isFinite(rate) || !getOverallTrapEffectiveness()) {
      // Only put the game's label back if it hasn't since written a newer one.
      if (text.dataset.mhuiLabel && text.textContent === text.dataset.mhuiLabel) {
        text.textContent = text.dataset.originalText;
      }

      if (bar.classList.contains('mhui-tem-fill')) {
        bar.className = bar.dataset.originalClasses;
      }

      delete text.dataset.originalText;
      delete text.dataset.mhuiLabel;
      delete bar.dataset.originalClasses;
      bar.style.removeProperty('--mhui-tem-fill');
      continue;
    }

    // Leave the game's loading state up while a trap change is saving.
    if ('Loading...' === text.textContent) {
      continue;
    }

    // Whatever the game last wrote is the label to restore if this is turned off.
    if (text.textContent !== text.dataset.mhuiLabel) {
      text.dataset.originalText = text.textContent;
    }

    if (!bar.classList.contains('mhui-tem-fill')) {
      bar.dataset.originalClasses = bar.className;
    }

    const percent = Math.max(0, Math.min(100, rate * 100));
    // Rounded down, so it's only Guaranteed when it's sure.
    const [, label, className] = trapEffectivenessTiers.find(([threshold]) => Math.floor(percent) >= threshold);

    const tierClasses = new Set(trapEffectivenessTiers.map(([, , tierClass]) => tierClass));
    const baseClasses = bar.dataset.originalClasses.split(' ').filter((cls) => cls && !tierClasses.has(cls));

    text.dataset.mhuiLabel = label;
    if (text.textContent !== label) {
      text.textContent = label;
    }

    const barClasses = [...baseClasses, className, 'mhui-tem-fill'].join(' ');
    if (bar.className !== barClasses) {
      bar.className = barClasses;
    }

    // The game's bar only fills in steps, so fill it to the catch rate instead.
    bar.style.setProperty('--mhui-tem-fill', `${percent}%`);
  }
};

/**
 * Decorate the trap after the game finishes its AJAX refresh, without observing our own writes.
 *
 * @param {Function} refresh Recalculate when the previous rate belongs to a different context.
 */
const initTrapEffectiveness = (refresh) => {
  if (initialized) {
    return;
  }
  initialized = true;

  addEvent(
    'ajax_response',
    (response) => {
      if (!getOverallTrapEffectiveness() || 'camp' !== getCurrentPage() || !response?.user || Number(response.user.user_id) !== Number(user.user_id)) {
        return;
      }

      const stale = null !== lastContext && lastContext !== getTrapEffectivenessContext();
      updateTrapEffectivenessText();
      if (stale) {
        refresh();
      }
    },
    {
      // CampPage writes the label at weight 0; the global user is updated at weight 90.
      weight: 1000,
      id: 'mh-improved-trap-effectiveness',
    }
  );

  onNavigation(() => updateTrapEffectivenessText(), { page: 'camp' });
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

export { getOverallTrapEffectiveness, getTrapEffectivenessContext, initTrapEffectiveness, setOverallTrapEffectiveness, updateTrapEffectivenessText };
