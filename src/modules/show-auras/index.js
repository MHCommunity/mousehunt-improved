import { addStyles, getActiveAuras, getCurrentPage, humanizeTime, makeElement, onAurasChange, onNavigation } from '@utils';

import { isBlockHidden } from '@/custom-trap-selector/blocks';

import { applyAuraLayout } from './layout';

import styles from './styles/styles.css';

/**
 * Get the expiry formatted.
 *
 * @param {number} time The time.
 *
 * @return {string} The formatted expiry.
 */
const getExpiryFormatted = (time) => {
  return new Date(time).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

/**
 * Get the expiry remaining formatted.
 *
 * @param {number} time The time.
 *
 * @return {string} The formatted expiry remaining.
 */
const getExpiryRemainingFormatted = (time) => {
  const duration = humanizeTime(time, {
    units: time < 1000 * 60 * 60 * 24 ? ['h', 'm'] : ['d', 'h'], // Show days and hours if over a day, otherwise hours and minutes.
    delimiter: '<br>',
  });

  return duration;
};

// Most auras get flagged a day out, but these are refreshed often enough that
// a full day of warning is just noise.
const expiryWarningThresholds = {
  QuestJetStreamAura: 60 * 60 * 6,
  QuestMillenniaura: 60 * 60 * 6,
};

/**
 * Get how many seconds before expiry an aura should be flagged.
 *
 * @param {Object} aura The aura.
 *
 * @return {number} The threshold in seconds.
 */
const getExpiryWarningThreshold = (aura) => expiryWarningThresholds[aura.type] ?? 60 * 60 * 24;

/**
 * Add the expiry warning.
 */
const addExpiryWarning = () => {
  // Clear the last warning, since an aura may have been renewed since.
  for (const element of document.querySelectorAll('.trapImageView-trapAura.expiring-soon')) {
    element.classList.remove('expiring-soon');
    element.style.removeProperty('--mhui-aura-offset-x');
    element.style.removeProperty('--mhui-aura-offset-y');
  }

  // Only auras with an icon on the trap image can be flagged there.
  const onTrap = aurasExpiry.filter((aura) => aura.element);
  const soon = onTrap.filter((aura) => null !== aura.remaining && aura.remaining < getExpiryWarningThreshold(aura));
  if (!soon.length) {
    return;
  }

  // Expiring auras stay visible on the trap image while the rest are hidden
  // until hover, so shift them up into the first slots instead of leaving
  // them floating in their usual spot.
  const slots = onTrap.map((aura) => aura.element);
  soon.forEach((aura, index) => {
    aura.element.classList.add('expiring-soon');

    const slot = slots[index];
    aura.element.style.setProperty('--mhui-aura-offset-x', `${slot.offsetLeft - aura.element.offsetLeft}px`);
    aura.element.style.setProperty('--mhui-aura-offset-y', `${slot.offsetTop - aura.element.offsetTop}px`);
  });
};

/**
 * Add the aura block to the trap stats.
 */
const addTrapBlock = () => {
  // With no active auras there's nothing to list, so clear out any block we
  // left behind rather than leaving an empty section under the trap stats.
  if (0 === aurasExpiry.length) {
    document.querySelector('#mh-improved-aura-view')?.remove();
    return;
  }

  const trapSummary = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (!trapSummary) {
    return;
  }

  const auraTrapBlock = makeElement('div', ['mh-improved-aura-view', 'campPage-trap-trapEffectiveness']);
  auraTrapBlock.id = 'mh-improved-aura-view';

  aurasExpiry.forEach((aura) => {
    const auraEl = makeElement('div', ['aura', 'mousehuntTooltipParent', aura.type]);
    auraEl.id = `mh-aura-${aura.type.toLowerCase()}`;

    const hasExpiry = null !== aura.expiry;
    const expiryText = hasExpiry ? getExpiryFormatted(aura.expiry) : '';
    const remaining = hasExpiry ? getExpiryRemainingFormatted(aura.remaining * 1000) : '';

    const tooltip = makeElement('div', ['mousehuntTooltip', 'noEvents']);
    const tooltipContent = makeElement('div', 'mousehuntTooltipContent');
    makeElement('div', 'mousehuntTooltipContentTitle', `${aura.name} Aura`, tooltipContent);
    if (hasExpiry) {
      makeElement('div', 'mousehuntTooltipContentTime', `Expires on ${expiryText}`, tooltipContent);
      makeElement('div', 'mousehuntTooltipContentTime', `${remaining} remaining`, tooltipContent);
    }
    tooltip.append(tooltipContent);

    auraEl.append(tooltip);

    // The game's icon classes, or the ones it would use when the aura isn't on the trap image.
    const auraImage = makeElement('div', 'image');
    auraImage.classList.add(...(aura.element ? aura.element.classList : ['trapImageView-trapAura', aura.type, 'active']));
    auraImage.classList.remove('mousehuntTooltipParent', 'expiring-soon');
    auraEl.append(auraImage);

    makeElement('div', 'type', aura.name, auraEl);

    const times = makeElement('div', 'times');
    makeElement('div', 'expiry', expiryText, times);
    makeElement('div', 'time', remaining, times);
    auraEl.append(times);

    auraTrapBlock.append(auraEl);
  });

  const existing = document.querySelector('#mh-improved-aura-view');
  if (existing) {
    existing.replaceWith(auraTrapBlock);
  } else {
    const tem = document.querySelector('.campPage-trap-trapEffectiveness.campPage-trap-statsContainer');
    if (tem) {
      tem.after(auraTrapBlock);
    } else {
      trapSummary.append(auraTrapBlock);
    }
  }
};

let aurasExpiry = [];

/**
 * Read the auras and redraw the auras block and the expiry warning.
 */
const refresh = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  aurasExpiry = await getActiveAuras();

  // The block is still added when it's hidden, so showing it in Custom Trap Selector is instant.
  if (!isBlockHidden('auras')) {
    addExpiryWarning();
  }

  addTrapBlock();
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'show-auras');
  applyAuraLayout();

  onNavigation(() => setTimeout(refresh, 1000), { page: 'camp' });

  // A trap change, hunt, or new aura sends the aura data; wait for the game to redraw the trap first.
  onAurasChange(() => setTimeout(refresh, 250));
};

/**
 * Initialize the module.
 */
export default {
  id: 'show-auras',
  name: 'Show Auras',
  type: 'hunting-traps',
  // Shown, hidden, and laid out in Custom Trap Selector.
  alwaysLoad: true,
  description: 'Show your active auras and when they expire below your trap stats.',
  load: init,
};
