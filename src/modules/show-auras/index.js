import humanizeDuration from 'humanize-duration';

import {
  addStyles,
  getCurrentPage,
  getSetting,
  makeElement,
  onNavigation
} from '@utils';

import gridStyles from './grid.css';
import listStyles from './list.css';
import onlyIconsStyles from './icons.css';

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
  const units = ['y', 'mo', 'w', 'd', 'h', 'm'];

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
  const soon = aurasExpiry.filter((aura) => aura.time < 60 * 60 * 24 * 40); // TODO: figure out the time that's worht a warning
  if (soon.length) {
    // add a class to the aura to show it's expiring soon
    soon.forEach((aura) => {
      aura.element.classList.add('expiring-soon');
    });
  }
};

const addTrapBlock = () => {
  const trapSummary = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (! trapSummary) {
    return;
  }

  const auraTrapBlock = makeElement('div', ['mh-improved-aura-view', 'campPage-trap-trapEffectiveness']);
  auraTrapBlock.id = 'mh-improved-aura-view';

  aurasExpiry.forEach((aura) => {
    const auraEl = makeElement('div', 'aura');

    const auraImage = makeElement('div', 'image');
    const auraClasses = aura.element.classList;
    // copy the classes from the aura to the new element
    auraImage.classList.add(...auraClasses);
    auraImage.classList.remove('mousehuntTooltipParent');
    auraEl.append(auraImage);

    makeElement('div', 'type', aura.type, auraEl);

    const times = makeElement('div', 'times');
    makeElement('div', 'expiry', getExpiryFormatted(aura.expiry), times);
    makeElement('div', 'time', getExpiryRemainingFormatted(aura.remaining * 1000), times);
    auraEl.append(times);

    auraTrapBlock.append(auraEl);
  });

  const existing = document.querySelector('#mh-improved-aura-view');
  if (existing) {
    existing.replaceWith(auraTrapBlock);
  } else {
    trapSummary.append(auraTrapBlock);
  }
};

const getAuras = () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const auras = document.querySelectorAll('.trapImageView-trapAura.active');
  if (! auras) {
    return;
  }

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

const aurasExpiry = [];
const main = () => {
  getAuras();
  addExpiryWarning();
  addTrapBlock();
};

const init = async () => {
  if (getSetting('show-auras.list')) {
    addStyles(listStyles, 'show-auras');
  } else if (getSetting('show-auras.icons')) {
    addStyles(onlyIconsStyles, 'show-auras');
  } else {
    addStyles(gridStyles, 'show-auras');
  }

  onNavigation(main, { page: 'camp' });
};

export default {
  id: 'show-auras',
  name: 'Show Auras in Trap Selector',
  type: 'beta',
  default: true,
  load: init
};
