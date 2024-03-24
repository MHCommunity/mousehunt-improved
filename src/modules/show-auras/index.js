import humanizeDuration from 'humanize-duration';

import {
  addStyles,
  getCurrentPage,
  getSetting,
  makeElement,
  onNavigation
} from '@utils';

import settings from './settings';

import gridStyles from './grid.css';
import listStyles from './list.css';
import onlyIconsStyles from './icons.css';
import styles from './styles.css';

const humanizer = humanizeDuration.humanizer({
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

const getExpiryFormatted = (time) => {
  const date = new Date(time);
  return date.toLocaleDateString(new Intl.DateTimeFormat('en', {
    dateStyle: 'short',
    timeStyle: 'short',
  }));
};

const getExpiryRemainingFormatted = (time) => {
  const units = ['d', 'h'];

  const duration = humanizer(time, {
    round: true,
    units,
    spacer: '',
    delimiter: ' ',
  });

  return duration;
};

const addExpiryWarning = () => {
  // if any of the auras are expiring soon, show a notification
  // const soon = aurasExpiry.filter((aura) => aura.time < 60 * 60 * 24);
  const soon = aurasExpiry.filter((aura) => aura.time < 60 * 60 * 24 * 40); // TODO: figure out the time that's worth a warning
  if (soon.length) {
    // add a class to the aura to show it's expiring soon
    soon.forEach((aura) => {
      aura.element.classList.add('expiring-soon');
    });
  }
};

let isAppending = false;
const addTrapBlock = () => {
  if (isAppending) {
    return;
  }

  isAppending = true;

  const trapSummary = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (! trapSummary) {
    return;
  }

  let existing = document.querySelector('#mh-improved-aura-view');
  if (existing) {
    return;
  }

  const auraTrapBlock = makeElement('div', ['mh-improved-aura-view', 'campPage-trap-trapEffectiveness']);
  auraTrapBlock.id = 'mh-improved-aura-view';

  aurasExpiry.forEach((aura) => {
    const auraKey = `mh-aura-${aura.type.toLowerCase().replaceAll(' ', '-')}`;
    const existingAura = document.querySelector(`#${auraKey}`);
    if (existingAura) {
      return;
    }

    const auraClasses = aura.element.classList;

    const questClass = [...auraClasses].find((c) => c.startsWith('Quest') || c.startsWith('Event') || c.startsWith('Mini'));
    const auraEl = makeElement('div', ['aura', 'mousehuntTooltipParent', questClass]);

    auraEl.id = auraKey;

    const expiryText = getExpiryFormatted(aura.expiry);
    const remaining = getExpiryRemainingFormatted(aura.remaining * 1000);

    auraEl.title = `Expires on ${expiryText}, ${remaining} remaining`;

    const tooltip = makeElement('div', ['mousehuntTooltip', 'top', 'noEvents']);
    const tooltipContent = makeElement('div', 'mousehuntTooltipContent');
    makeElement('div', 'mousehuntTooltipContentTitle', `${aura.type} Aura`, tooltipContent);
    makeElement('div', 'mousehuntTooltipContentTime', `Expires on ${expiryText}, ${remaining} remaining`, tooltipContent);
    tooltip.append(tooltipContent);

    makeElement('div', 'mousehuntTooltip-arrow', '', tooltip);
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

  existing = document.querySelector('#mh-improved-aura-view');
  if (existing) {
    existing.replaceWith(auraTrapBlock);
  } else {
    trapSummary.append(auraTrapBlock);
  }

  isAppending = false;
};

const getAuras = () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const auras = document.querySelectorAll('.trapSelectorView .trapImageView-trapAuraContainer .trapImageView-trapAura.active');
  if (! auras) {
    return;
  }

  aurasExpiry = [];
  auras.forEach((aura) => {
    const typeEl = aura.querySelector('.trapImageView-tooltip-trapAura-title');
    if (! typeEl) {
      return;
    }

    const type = typeEl.textContent.replaceAll('You have the ', '').replaceAll('Aura!', '').trim();
    const expiryEl = aura.querySelector('.trapImageView-tooltip-trapAura-expiry span');

    if (! expiryEl || ! type) {
      return;
    }

    // calculate the expiry time from "September 11, 2025 @ 3:41pm (Local Time)" to a date object
    const origExpiryText = expiryEl.textContent
      .replaceAll('(Local Time)', '')
      .replaceAll('  ', ' ')
      .trim();

    let expiryText = origExpiryText;

    const dateParts = expiryText.split('@');
    if (dateParts.length > 1) {
      expiryText = dateParts[0].trim();
      const time = dateParts[1].trim();

      const timeParts = time.split(':');
      let hours = Number.parseInt(timeParts[0], 10);
      hours = timeParts[1].includes('pm') ? hours + 12 : hours;

      const minutes = timeParts[1].replaceAll('pm', '').replaceAll('am', '').trim();

      expiryText = `${expiryText} ${hours}:${minutes}`;
    }

    const expiry = new Date(Date.parse(expiryText));
    const now = new Date();

    // get the difference in seconds
    const remaining = Math.floor((expiry - now) / 1000);

    aurasExpiry.push({
      type,
      remaining,
      expiry,
      expiryText: origExpiryText,
      element: aura,
    });
  });
};

let aurasExpiry = [];
const main = () => {
  setTimeout(() => {
    getAuras();
    addExpiryWarning();
    addTrapBlock();
  }, 1000);
};

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

  onNavigation(main, { page: 'camp' });
};

export default {
  id: 'show-auras',
  name: 'Show Auras',
  description: 'Show auras and their expiry time below the trap stats.',
  type: 'beta',
  default: false,
  load: init,
  settings
};
