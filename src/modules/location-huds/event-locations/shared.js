const updateDateTooltip = (selector) => {
  const tooltip = document.querySelector(selector);
  if (! tooltip) {
    return;
  }

  if (tooltip.getAttribute('data-changed')) {
    return;
  }

  tooltip.classList.add('bottom');
  tooltip.classList.remove('top');
  tooltip.setAttribute('data-changed', 'true');
};

const spaceNumbers = (text) => {
  return text.replaceAll(/(\d+)/g, ' $1 ').trim();
};

const updateDateDates = (remainingSelector, textSelector = false) => {
  const badge = document.querySelector(remainingSelector);
  if (badge) {
    if (badge.getAttribute('data-changed')) {
      return;
    }

    badge.innerHTML = spaceNumbers(badge.innerHTML);
    badge.setAttribute('data-changed', 'true');
  }

  if (! textSelector) {
    return;
  }

  const tooltip = document.querySelector(textSelector);
  if (tooltip) {
    if (tooltip.getAttribute('data-changed')) {
      return;
    }

    tooltip.innerHTML = spaceNumbers(tooltip.innerHTML);
    tooltip.setAttribute('data-changed', 'true');
  }
};

export {
  updateDateTooltip,
  updateDateDates
};
