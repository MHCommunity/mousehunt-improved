import { addStyles, getCurrentPage, getSetting, humanizeTime, makeElement, onNavigation, parseMouseHuntDate } from '@utils';

import settings from './settings';

import gridStyles from './styles/grid.css';
import listStyles from './styles/list.css';
import onlyIconsStyles from './styles/icons.css';
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

/**
 * Add the expiry warning.
 */
const addExpiryWarning = () => {
  // Flag any auras that expire within a day.
  const soon = aurasExpiry.filter((aura) => aura.remaining < 60 * 60 * 24);
  if (soon.length) {
    // add a class to the aura to show it's expiring soon
    soon.forEach((aura) => {
      aura.element.classList.add('expiring-soon');
    });
  }
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
    const auraKey = `mh-aura-${aura.type.toLowerCase().replaceAll(/[ !'(),.]/g, '-')}`;
    const existingAura = auraTrapBlock.querySelector(`[id="${auraKey}"]`);
    if (existingAura) {
      return;
    }

    const auraClasses = aura.element.classList;

    const questClass = [...auraClasses].find((c) => c.startsWith('Quest') || c.startsWith('Event') || c.startsWith('Mini'));
    const auraEl = makeElement('div', ['aura', 'mousehuntTooltipParent', questClass]);

    auraEl.id = auraKey;

    const expiryText = getExpiryFormatted(aura.expiry);
    const remaining = getExpiryRemainingFormatted(aura.remaining * 1000);

    const tooltip = makeElement('div', ['mousehuntTooltip', 'noEvents']);
    const tooltipContent = makeElement('div', 'mousehuntTooltipContent');
    makeElement('div', 'mousehuntTooltipContentTitle', `${aura.type} Aura`, tooltipContent);
    makeElement('div', 'mousehuntTooltipContentTime', `Expires on ${expiryText}`, tooltipContent);
    makeElement('div', 'mousehuntTooltipContentTime', `${remaining} remaining`, tooltipContent);
    tooltip.append(tooltipContent);

    auraEl.append(tooltip);

    const auraImage = makeElement('div', 'image');

    auraImage.classList.add(...auraClasses);
    auraImage.classList.remove('mousehuntTooltipParent');
    auraEl.append(auraImage);

    makeElement('div', 'type', aura.type, auraEl);

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

/**
 * Get the auras.
 */
const getAuras = async () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const auras = document.querySelectorAll('.trapSelectorView .trapImageView-trapAuraContainer .trapImageView-trapAura.active');
  if (!auras.length) {
    aurasExpiry = [];
    return;
  }

  const parsedAuras = await Promise.all(
    [...auras].map(async (aura) => {
      const typeEl = aura.querySelector('.trapImageView-tooltip-trapAura-title');
      if (!typeEl) {
        return null;
      }

      const type = typeEl.textContent.replaceAll('You have the ', '').replaceAll('Aura!', '').trim();
      const expiryEl = aura.querySelector('.trapImageView-tooltip-trapAura-expiry span');

      if (!expiryEl || !type) {
        return null;
      }

      const expiryText = expiryEl.textContent.replaceAll('  ', ' ').trim();
      const expiry = await parseMouseHuntDate(expiryText);
      if (null === expiry) {
        return null;
      }

      // get the difference in seconds
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

      return {
        type,
        remaining,
        expiry,
        expiryText: expiryText.replace('(Local Time)', '').trim(),
        element: aura,
      };
    })
  );

  aurasExpiry = parsedAuras.filter(Boolean);
};

let aurasExpiry = [];

/**
 * Initialize the module.
 */
const init = async () => {
  const stylesToUse = [styles];
  if (getSetting('show-auras.icons')) {
    stylesToUse.push(onlyIconsStyles);
  } else if (getSetting('show-auras.list')) {
    stylesToUse.push(listStyles);
  } else {
    stylesToUse.push(gridStyles);
  }

  addStyles(stylesToUse, 'show-auras');

  onNavigation(
    () => {
      setTimeout(async () => {
        await getAuras();
        addExpiryWarning();
        addTrapBlock();
      }, 1000);
    },
    { page: 'camp' }
  );
};

/**
 * Initialize the module.
 */
export default {
  id: 'show-auras',
  name: 'Show Auras',
  type: 'hunting-setup',
  default: true,
  description: 'Show auras and their expiry time below the trap stats.',
  load: init,
  settings,
};
